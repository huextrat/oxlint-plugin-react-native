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

          context.report({
            node,
            message,
            fix(fixer: any) {
              const parent = node.parent;
              if (!parent || !parent.properties) {
                return fixer.remove(node);
              }
              const properties = parent.properties;
              const index = properties.indexOf(node);
              if (index === -1) return fixer.remove(node);

              let removeStart: number;
              let removeEnd: number;

              if (index === 0) {
                removeStart = node.range[0];
                removeEnd =
                  properties.length > 1 ? properties[1].range[0] : node.range[1];
              } else {
                const prev = properties[index - 1];
                removeStart = prev.range[1];
                removeEnd = node.range[1];
              }

              return fixer.removeRange([removeStart, removeEnd]);
            },
          });
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
          if (astHelpers.isStyleSheetExported(node)) {
            styleSheets.markAsExported(styleSheetName);
          }
        }
      }
    },

    ExportNamedDeclaration: function (node: any) {
      if (node.specifiers) {
        for (const spec of node.specifiers) {
          const name = spec.local && spec.local.name;
          if (name) styleSheets.markAsExported(name);
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
    fixable: "code",
  },
  createOnce: rule,
};
