import { detect } from "../util/Components.js";
import { StyleSheets, astHelpers } from "../util/stylesheet.js";
import * as util from "util";

const rule = detect((context: any) => {
  // Setup state per-file (createOnce)
  let styleSheets: StyleSheets;

  return {
    before() {
      styleSheets = new StyleSheets();
    },
    JSXAttribute: (node: any) => {
      if (astHelpers.isStyleAttribute(node)) {
        const styles = astHelpers.collectStyleObjectExpressions(
          node.value,
          context,
        );
        styleSheets.addObjectExpressions(styles);
      }
    },

    "Program:exit": () => {
      const inlineStyles = styleSheets.getObjectExpressions();
      if (inlineStyles) {
        inlineStyles.forEach((style) => {
          if (style) {
            const expression = util.inspect(style.expression);
            context.report({
              node: style.node,
              message: "Inline style: {{expression}}",
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
