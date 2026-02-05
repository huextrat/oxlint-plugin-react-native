
import { astHelpers } from '../util/stylesheet.js';

const rule = (context: any) => {
  // Defer context.options and context.sourceCode to visitor (oxlint forbids in createOnce).
  function sort(array: any[], order: string) {
    return [...array].sort((a: any, b: any) => {
      const identifierA = astHelpers.getStylePropertyIdentifier(a) || '';
      const identifierB = astHelpers.getStylePropertyIdentifier(b) || '';

      let sortOrder = 0;
      if (astHelpers.isEitherShortHand(identifierA, identifierB)) {
        return a.range[0] - b.range[0];
      }
      if (identifierA < identifierB) {
        sortOrder = -1;
      } else if (identifierA > identifierB) {
        sortOrder = 1;
      }
      return sortOrder * (order === 'asc' ? 1 : -1);
    });
  }

  function report(
    array: any[],
    type: string,
    node: any,
    prev: any,
    current: any,
    order: string,
    sourceCode: any
  ) {
    const currentName = astHelpers.getStylePropertyIdentifier(current);
    const prevName = astHelpers.getStylePropertyIdentifier(prev);
    const hasComments = array
      .map((prop) => [
        ...sourceCode.getCommentsBefore(prop),
        ...sourceCode.getCommentsAfter(prop),
      ])
      .reduce((hasComment, comment) => hasComment || comment.length > 0, false);

    context.report({
      node,
      message: `Expected ${type} to be in ${order}ending order. '${currentName}' should be before '${prevName}'.`,
      loc: current.key.loc,
      fix: hasComments
        ? undefined
        : (fixer: any) => {
            const sortedArray = sort(array, order);
            return array
              .map((item, i) => {
                if (item !== sortedArray[i]) {
                  return fixer.replaceText(
                    item,
                    sourceCode.getText(sortedArray[i])
                  );
                }
                return null;
              })
              .filter(Boolean);
          },
    });
  }

  function checkIsSorted(
    array: any[],
    arrayName: string,
    node: any,
    order: string,
    options: any,
    sourceCode: any,
    isValidOrder: (a: any, b: any) => boolean
  ) {
    for (let i = 1; i < array.length; i += 1) {
      const previous = array[i - 1];
      const current = array[i];

      if (previous.type !== 'Property' || current.type !== 'Property') {
        return;
      }

      const prevName = astHelpers.getStylePropertyIdentifier(previous) || '';
      const currentName = astHelpers.getStylePropertyIdentifier(current) || '';

      const oneIsShorthandForTheOther =
        arrayName === 'style properties' &&
        astHelpers.isEitherShortHand(prevName, currentName);

      if (!oneIsShorthandForTheOther && !isValidOrder(prevName, currentName)) {
        return report(array, arrayName, node, previous, current, order, sourceCode);
      }
    }
  }

  return {
    CallExpression: function (node: any) {
      const order = context.options[0] || 'asc';
      const options = context.options[1] || {};
      const { ignoreClassNames, ignoreStyleProperties } = options;
      const sourceCode = context.sourceCode;
      const isValidOrder =
        order === 'asc'
          ? (a: any, b: any) => a <= b
          : (a: any, b: any) => a >= b;

      if (!astHelpers.isStyleSheetDeclaration(node, context.settings)) {
        return;
      }

      const classDefinitionsChunks = astHelpers.getStyleDeclarationsChunks(node);

      if (!ignoreClassNames) {
        classDefinitionsChunks.forEach((classDefinitions) => {
          checkIsSorted(
            classDefinitions,
            'class names',
            node,
            order,
            options,
            sourceCode,
            isValidOrder
          );
        });
      }

      if (ignoreStyleProperties) return;

      classDefinitionsChunks.forEach((classDefinitions) => {
        classDefinitions.forEach((classDefinition: any) => {
          const styleProperties = classDefinition.value.properties;
          if (!styleProperties || styleProperties.length < 2) {
            return;
          }
          const stylePropertyChunks = astHelpers.getPropertiesChunks(
            styleProperties
          );
          stylePropertyChunks.forEach((stylePropertyChunk) => {
            checkIsSorted(
              stylePropertyChunk,
              'style properties',
              node,
              order,
              options,
              sourceCode,
              isValidOrder
            );
          });
        });
      });
    },
  };
};

export default {
  meta: {
    fixable: 'code',
    schema: [
      {
        enum: ['asc', 'desc'],
      },
      {
        type: 'object',
        properties: {
          ignoreClassNames: {
            type: 'boolean',
          },
          ignoreStyleProperties: {
            type: 'boolean',
          },
        },
        additionalProperties: false,
      },
    ],
  },
  createOnce: rule,
};
