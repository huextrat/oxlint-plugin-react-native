
const rule = (context: any) => {
  function reportNode(JSXExpressionNode: any) {
    context.report({
      node: JSXExpressionNode,
      message:
        'Single element style arrays are not necessary and cause unnecessary re-renders',
      fix(fixer: any) {
        const realStyleNode = JSXExpressionNode.value.expression.elements[0];
        const styleSource = context.sourceCode.getText(realStyleNode);
        return fixer.replaceText(
          JSXExpressionNode.value.expression,
          styleSource
        );
      },
    });
  }

  // --------------------------------------------------------------------------
  // Public
  // --------------------------------------------------------------------------
  return {
    JSXAttribute(node: any) {
      if (node.name.name !== 'style') return;
      if (!node.value.expression) return;
      if (node.value.expression.type !== 'ArrayExpression') return;
      if (node.value.expression.elements.length === 1) {
        reportNode(node);
      }
    },
  };
};

export default {
  meta: {
    docs: {
      description:
        'Disallow single element style arrays. These cause unnecessary re-renders as the identity of the array always changes',
      category: 'Stylistic Issues',
      recommended: false,
      url: '',
    },
    fixable: 'code',
  },

  createOnce: rule,
};
