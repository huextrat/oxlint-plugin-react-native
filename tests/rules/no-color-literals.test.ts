/**
 * no-color-literals rule: run against oxlint.
 */

import { hasDist, runOxlintWithPlugin } from "../run-oxlint";

const RULE = "react-native/no-color-literals";
const rules = { [RULE]: "error" };

describe("no-color-literals", () => {
  if (!hasDist()) {
    it("requires dist (run npm run build)", () => {
      expect(hasDist()).toBe(true);
    });
    return;
  }

  describe("valid", () => {
    it("using variables for colors", () => {
      const code = `
      const red = 'red';
      const styles = StyleSheet.create({
        style1: { color: red },
      });
      export default function My() {
        return <View style={styles.style1} />;
      }
    `;
      const out = runOxlintWithPlugin(code, rules);
      expect(out).toEqual("");
    });
  });

  describe("invalid", () => {
    it("color literal in inline style", () => {
      const code = `
      export default function Hello() {
        return <Text style={{ backgroundColor: '#FFFFFF', opacity: 0.5 }}>Hello</Text>;
      }
    `;
      const out = runOxlintWithPlugin(code, rules);
      expect(out).toContain(
        "react-native(no-color-literals): Color literal: { backgroundColor: '#FFFFFF' }",
      );
    });

    it("color literal in StyleSheet.create", () => {
      const code = `
      const styles = StyleSheet.create({
        box: { backgroundColor: '#ccc' },
      });
      export default function My() {
        return <View style={styles.box} />;
      }
    `;
      const out = runOxlintWithPlugin(code, rules);
      expect(out).toContain(
        "react-native(no-color-literals): Color literal: { backgroundColor: '#ccc' }",
      );
    });
  });
});
