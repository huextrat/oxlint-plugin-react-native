import { detect } from "../util/Components.js";
import { StyleSheets, astHelpers } from "../util/stylesheet.js";
import * as util from "util";

const rule = detect((context: any) => {
  let styleSheets: StyleSheets;

  return {
    before() {
      styleSheets = new StyleSheets();
    },
    CallExpression: (node: any) => {
      if (astHelpers.isStyleSheetDeclaration(node, context.settings)) {
        const styles = astHelpers.getStyleDeclarations(node);

        if (styles) {
          styles.forEach((style: any) => {
            const literals = astHelpers.collectColorLiterals(
              style.value,
              context,
            );
            styleSheets.addColorLiterals(literals);
          });
        }
      }
    },

    JSXAttribute: (node: any) => {
      if (astHelpers.isStyleAttribute(node)) {
        const literals = astHelpers.collectColorLiterals(node.value, context);
        styleSheets.addColorLiterals(literals);
      }
    },

    "Program:exit": () => {
      const colorLiterals = styleSheets.getColorLiterals();
      if (colorLiterals) {
        colorLiterals.forEach((style) => {
          if (style) {
            const expression = util.inspect(style.expression);
            context.report({
              node: style.node,
              message: "Color literal: {{expression}}",
              data: { expression },
            });
          }
        });
      }
    },
  };
});

export default {
  meta: {
    schema: [],
  },
  createOnce: rule,
};
