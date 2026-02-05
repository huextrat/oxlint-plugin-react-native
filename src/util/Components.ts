
export interface ComponentNode {
  range: [number, number];
  parent?: any;
}

export interface ComponentInfo {
  node: ComponentNode;
  confidence: number;
}

export class Components {
  list: { [key: string]: ComponentInfo };

  constructor() {
    this.list = {};
  }

  getId(node: ComponentNode | undefined): string {
    return node ? node.range.join(':') : '';
  }

  add(node: any, confidence: number) {
    const id = this.getId(node);
    if (this.list[id]) {
      if (confidence === 0 || this.list[id].confidence === 0) {
        this.list[id].confidence = 0;
      } else {
        this.list[id].confidence = Math.max(
          this.list[id].confidence,
          confidence
        );
      }
      return;
    }
    this.list[id] = {
      node: node,
      confidence: confidence,
    };
  }

  get(node: ComponentNode): ComponentInfo | undefined {
    const id = this.getId(node);
    return this.list[id];
  }

  set(node: ComponentNode, props: Partial<ComponentInfo>) {
    let currentNode: any = node;
    while (currentNode && !this.list[this.getId(currentNode)]) {
      currentNode = currentNode.parent;
    }
    if (!currentNode) {
      return;
    }
    const id = this.getId(currentNode);
    this.list[id] = { ...this.list[id], ...props };
  }

  all(): { [key: string]: ComponentInfo } {
    const list: { [key: string]: ComponentInfo } = {};
    Object.keys(this.list).forEach((i) => {
      if (
        Object.prototype.hasOwnProperty.call(this.list, i) &&
        this.list[i].confidence >= 2
      ) {
        list[i] = this.list[i];
      }
    });
    return list;
  }

  length(): number {
    let length = 0;
    Object.keys(this.list).forEach((i) => {
      if (
        Object.prototype.hasOwnProperty.call(this.list, i) &&
        this.list[i].confidence >= 2
      ) {
        length += 1;
      }
    });
    return length;
  }
}

export function componentRule(rule: Function, context: any) {
  const components = new Components();
  // Access context.sourceCode only inside utils (when called during traversal), not during createOnce.

  const utils = {
    isES5Component: function (node: any) {
      if (!node.parent) {
        return false;
      }
      return /^(React\.)?createClass$/.test(
        context.sourceCode.getText(node.parent.callee)
      );
    },

    isES6Component: function (node: any) {
      if (!node.superClass) {
        return false;
      }
      return /^(React\.)?(Pure)?Component$/.test(
        context.sourceCode.getText(node.superClass)
      );
    },

    isReturningJSX: function (node: any) {
      let property;
      switch (node.type) {
        case 'ReturnStatement':
          property = 'argument';
          break;
        case 'ArrowFunctionExpression':
          property = 'body';
          break;
        default:
          return false;
      }

      const returnsJSX =
        node[property] &&
        (node[property].type === 'JSXElement' ||
          node[property].type === 'JSXFragment');
      const returnsReactCreateElement =
        node[property] &&
        node[property].callee &&
        node[property].callee.property &&
        node[property].callee.property.name === 'createElement';
      return Boolean(returnsJSX || returnsReactCreateElement);
    },

    getParentComponent: function (_n: any) {
      return (
        utils.getParentES6Component(_n) ||
        utils.getParentES5Component(_n) ||
        utils.getParentStatelessComponent(_n)
      );
    },

    getParentES5Component: function (_n: any) {
      let scope = (context.sourceCode || context).getScope(_n);
      while (scope) {
        const node =
          scope.block && scope.block.parent && scope.block.parent.parent;
        if (node && utils.isES5Component(node)) {
          return node;
        }
        scope = scope.upper;
      }
      return null;
    },

    getParentES6Component: function (_n: any) {
      let scope = (context.sourceCode || context).getScope(_n);
      while (scope && scope.type !== 'class') {
        scope = scope.upper;
      }
      const node = scope && scope.block;
      if (!node || !utils.isES6Component(node)) {
        return null;
      }
      return node;
    },

    getParentStatelessComponent: function (_n: any) {
      let scope = (context.sourceCode || context).getScope(_n);
      while (scope) {
        const node = scope.block;
        const isFunction = /Function/.test(node.type);
        const isNotMethod =
          !node.parent || node.parent.type !== 'MethodDefinition';
        const isNotArgument =
          !node.parent || node.parent.type !== 'CallExpression';
        if (isFunction && isNotMethod && isNotArgument) {
          return node;
        }
        scope = scope.upper;
      }
      return null;
    },

    getRelatedComponent: function (node: any) {
      let currentNode = node;
      let i;
      let j;
      let k;
      let l;
      const componentPath = [];
      while (currentNode) {
        if (
          currentNode.property &&
          currentNode.property.type === 'Identifier'
        ) {
          componentPath.push(currentNode.property.name);
        }
        if (currentNode.object && currentNode.object.type === 'Identifier') {
          componentPath.push(currentNode.object.name);
        }
        currentNode = currentNode.object;
      }
      componentPath.reverse();

      const variableName = componentPath.shift();
      if (!variableName) {
        return null;
      }
      let variableInScope;
      const { variables } = (context.sourceCode || context).getScope(node);
      for (i = 0, j = variables.length; i < j; i++) {
        if (variables[i].name === variableName) {
          variableInScope = variables[i];
          break;
        }
      }
      if (!variableInScope) {
        return null;
      }

      let defInScope;
      const { defs } = variableInScope;
      for (i = 0, j = defs.length; i < j; i++) {
        if (
          defs[i].type === 'ClassName' ||
          defs[i].type === 'FunctionName' ||
          defs[i].type === 'Variable'
        ) {
          defInScope = defs[i];
          break;
        }
      }
      if (!defInScope) {
        return null;
      }
      currentNode = defInScope.node.init || defInScope.node;

      for (i = 0, j = componentPath.length; i < j; i++) {
        if (!currentNode.properties) {
          continue;
        }
        // @ts-ignore
        for (k = 0, l = currentNode.properties.length; k < l; k++) {
          if (currentNode.properties[k].key.name === componentPath[i]) {
            currentNode = currentNode.properties[k];
            break;
          }
        }
        if (!currentNode) {
          return null;
        }
        currentNode = currentNode.value;
      }

      return components.get(currentNode);
    },
  };

  const detectionInstructions: any = {
    ClassDeclaration: function (node: any) {
      if (!utils.isES6Component(node)) {
        return;
      }
      components.add(node, 2);
    },

    ClassProperty: function (_n: any) {
      const node = utils.getParentComponent(_n);
      if (!node) {
        return;
      }
      components.add(node, 2);
    },

    ObjectExpression: function (node: any) {
      if (!utils.isES5Component(node)) {
        return;
      }
      components.add(node, 2);
    },

    FunctionExpression: function (_n: any) {
      const node = utils.getParentComponent(_n);
      if (!node) {
        return;
      }
      components.add(node, 1);
    },

    FunctionDeclaration: function (_n: any) {
      const node = utils.getParentComponent(_n);
      if (!node) {
        return;
      }
      components.add(node, 1);
    },

    ArrowFunctionExpression: function (_n: any) {
      const node = utils.getParentComponent(_n);
      if (!node) {
        return;
      }
      if (node.expression && utils.isReturningJSX(node)) {
        components.add(node, 2);
      } else {
        components.add(node, 1);
      }
    },

    ThisExpression: function (_n: any) {
      const node = utils.getParentComponent(_n);
      if (!node || !/Function/.test(node.type)) {
        return;
      }
      components.add(node, 0);
    },

    ReturnStatement: function (node: any) {
      if (!utils.isReturningJSX(node)) {
        return;
      }
      const parentNode = utils.getParentComponent(node);
      if (!parentNode) {
        return;
      }
      components.add(parentNode, 2);
    },
  };

  const ruleInstructions = rule(context, components, utils);
  const updatedRuleInstructions = { ...ruleInstructions };
  Object.keys(detectionInstructions).forEach((instruction) => {
    updatedRuleInstructions[instruction] = (node: any) => {
      detectionInstructions[instruction](node);
      return ruleInstructions[instruction]
        ? ruleInstructions[instruction](node)
        : undefined;
    };
  });
  return updatedRuleInstructions;
}

export function detect(rule: Function) {
  return function (context: any) {
      return componentRule(rule, context);
  };
}
