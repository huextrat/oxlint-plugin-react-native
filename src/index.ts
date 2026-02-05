import { eslintCompatPlugin, type Plugin } from '@oxlint/plugins';
import noUnusedStyles from './rules/no-unused-styles.js';
import noInlineStyles from './rules/no-inline-styles.js';
import noColorLiterals from './rules/no-color-literals.js';
import sortStyles from './rules/sort-styles.js';
import noRawText from './rules/no-raw-text.js';
import noSingleElementStyleArrays from './rules/no-single-element-style-arrays.js';

const allRules = {
  'no-unused-styles': noUnusedStyles,
  'no-inline-styles': noInlineStyles,
  'no-color-literals': noColorLiterals,
  'sort-styles': sortStyles,
  'no-raw-text': noRawText,
  'no-single-element-style-arrays': noSingleElementStyleArrays,
};

export default eslintCompatPlugin({
  meta: { name: 'oxlint-plugin-react-native' },
  rules: allRules,
} as Plugin);
