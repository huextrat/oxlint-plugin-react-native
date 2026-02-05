import { Components, detect } from "../util/Components.js";
import { StyleSheets, astHelpers } from "../util/stylesheet.js";

const rule = detect((context: any, components: Components) => {
  let styleSheets: StyleSheets;
  let styleReferences: Set<string>;

  function reportUnusedStyles(unusedStyles: any) {
    Object.keys(unusedStyles).forEach((key) => {
      if ({}.hasOwnProperty.call(unusedStyles, key)) {
        const styles = unusedStyles[key];
        styles.forEach((node: any) => {
          const message = [
            "Unused style detected: ",
            key,
            ".",
            node.key.name,
          ].join("");

          context.report({ node, message });
        });
      }
    });
  }

  return {
    before() {
      styleSheets = new StyleSheets();
      styleReferences = new Set();
    },

    MemberExpression: function (node: any) {
      const styleRef =
        astHelpers.getPotentialStyleReferenceFromMemberExpression(node);
      if (styleRef) {
        styleReferences.add(styleRef);
      }
    },

    CallExpression: function (node: any) {
      if (astHelpers.isStyleSheetDeclaration(node, context.settings)) {
        const styleSheetName = astHelpers.getStyleSheetName(node);
        const styles = astHelpers.getStyleDeclarations(node);

        if (styleSheetName) {
          styleSheets.add(styleSheetName, styles);
        }
      }
    },

    "Program:exit": function () {
      const list = components.all();
      if (Object.keys(list).length > 0) {
        styleReferences.forEach((reference) => {
          styleSheets.markAsUsed(reference);
        });
        reportUnusedStyles(styleSheets.getUnusedReferences());
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
