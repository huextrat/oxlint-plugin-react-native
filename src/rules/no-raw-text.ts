const elementName = (node: any) => {
  const reversedIdentifiers = [];
  if (
    node.type === "JSXElement" &&
    node.openingElement.type === "JSXOpeningElement"
  ) {
    let object = node.openingElement.name;
    while (object.type === "JSXMemberExpression") {
      if (object.property.type === "JSXIdentifier") {
        reversedIdentifiers.push(object.property.name);
      }
      object = object.object;
    }

    if (object.type === "JSXIdentifier") {
      reversedIdentifiers.push(object.name);
    }
  }

  return reversedIdentifiers.reverse().join(".");
};

const hasAllowedParent = (parent: any, allowedElements: string[]) => {
  let curNode = parent;

  while (curNode) {
    if (curNode.type === "JSXElement") {
      const name = elementName(curNode);
      if (allowedElements.includes(name)) {
        return true;
      }
    }
    curNode = curNode.parent;
  }

  return false;
};

const rule = (context: any) => {
  // Defer context.options to visitor (oxlint forbids in createOnce).
  let _allowedElements: string[] | undefined;
  function getAllowedElements(): string[] {
    if (_allowedElements === undefined) {
      const options = context.options[0] || {};
      const skippedElements = options.skip ? options.skip : [];
      _allowedElements = [
        "Text",
        "TSpan",
        "StyledText",
        "Animated.Text",
      ].concat(skippedElements);
    }
    return _allowedElements;
  }

  const report = (node: any) => {
    const errorValue =
      node.type === "TemplateLiteral"
        ? `TemplateLiteral: ${node.expressions[0].name}`
        : node.value.trim();

    const formattedErrorValue =
      errorValue.length > 0 ? `Raw text (${errorValue})` : "Whitespace(s)";

    context.report({
      node,
      message: `${formattedErrorValue} cannot be used outside of a <Text> tag`,
    });
  };

  const hasOnlyLineBreak = (value: string) =>
    /^[\r\n\t\f\v]+$/.test(value.replace(/ /g, ""));

  const getValidation = (node: any) =>
    !hasAllowedParent(node.parent, getAllowedElements());

  return {
    Literal(node: any) {
      const parentType = node.parent.type;
      const onlyFor = ["JSXExpressionContainer", "JSXElement"];
      if (
        typeof node.value !== "string" ||
        hasOnlyLineBreak(node.value) ||
        !onlyFor.includes(parentType) ||
        (node.parent.parent && node.parent.parent.type === "JSXAttribute")
      )
        return;

      const isStringLiteral = parentType === "JSXExpressionContainer";
      if (getValidation(isStringLiteral ? node.parent : node)) {
        report(node);
      }
    },

    JSXText(node: any) {
      if (typeof node.value !== "string" || hasOnlyLineBreak(node.value))
        return;
      if (getValidation(node)) {
        report(node);
      }
    },

    TemplateLiteral(node: any) {
      if (
        node.parent.type !== "JSXExpressionContainer" ||
        (node.parent.parent && node.parent.parent.type === "JSXAttribute")
      )
        return;

      if (getValidation(node.parent)) {
        report(node);
      }
    },
  };
};

export default {
  meta: {
    schema: [
      {
        type: "object",
        properties: {
          skip: {
            type: "array",
            items: {
              type: "string",
            },
          },
        },
        additionalProperties: false,
      },
    ],
  },
  createOnce: rule,
};
