/**
 * no-raw-text rule: run against oxlint.
 */

import { hasDist, runOxlintWithPlugin } from '../run-oxlint';

const RULE = 'react-native/no-raw-text';
const rules = { [RULE]: 'error' };

describe('no-raw-text', () => {
  if (!hasDist()) {
    it('requires dist (run npm run build)', () => {
      expect(hasDist()).toBe(true);
    });
    return;
  }

  describe('valid', () => {
    it('text is inside Text', () => {
      const code = `
      export default function My() {
        return (
          <View>
            <Text>some text</Text>
          </View>
        );
      }
    `;
      const out = runOxlintWithPlugin(code, rules);
      expect(out).toEqual('');
    });
  });

  describe('invalid', () => {
    it('raw text outside Text (element)', () => {
      const code = `
      export default function My() {
        return (
          <View>
            <span>Raw text outside Text</span>
          </View>
        );
      }
    `;
      const out = runOxlintWithPlugin(code, rules);
      expect(out).toContain("react-native(no-raw-text): Raw text (Raw text outside Text) cannot be used outside of a <Text> tag");
    });

    it('JSXText outside Text', () => {
      const code = `
      export default function My() {
        return <View>hello</View>;
      }
    `;
      const out = runOxlintWithPlugin(code, rules);
      expect(out).toContain("react-native(no-raw-text): Raw text (hello) cannot be used outside of a <Text> tag");
    });
  });
});
