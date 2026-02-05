/**
 * sort-styles rule: run against oxlint.
 */

import { hasDist, runOxlintWithPlugin } from '../run-oxlint';

const RULE = 'react-native/sort-styles';
const rules = { [RULE]: 'error' };

describe('sort-styles', () => {
  if (!hasDist()) {
    it('requires dist (run npm run build)', () => {
      expect(hasDist()).toBe(true);
    });
    return;
  }

  describe('valid', () => {
    it('class names are in ascending order', () => {
      const code = `
      const styles = StyleSheet.create({
        a: {},
        b: {},
        c: {},
      });
      export default function My() {
        return <View style={[styles.a, styles.b, styles.c]} />;
      }
    `;
      const out = runOxlintWithPlugin(code, rules);
      expect(out).toEqual('');
    });
  });

  describe('invalid', () => {
    it('class names are out of order (asc default)', () => {
      const code = `
      const styles = StyleSheet.create({
        c: {},
        b: {},
        a: {},
      });
      export default function My() {
        return <View style={[styles.a, styles.b, styles.c]} />;
      }
    `;
      const out = runOxlintWithPlugin(code, rules);
      expect(out).toContain("react-native(sort-styles): Expected class names to be in ascending order. 'b' should be before 'c'");
    });

    it('style properties are out of order', () => {
      const code = `
      const styles = StyleSheet.create({
        box: {
          zIndex: 1,
          alignItems: 'center',
        },
      });
      export default function My() {
        return <View style={styles.box} />;
      }
    `;
      const out = runOxlintWithPlugin(code, rules);
      expect(out).toContain("react-native(sort-styles): Expected style properties to be in ascending order. 'alignItems' should be before 'zIndex'");
    });
  });
});
