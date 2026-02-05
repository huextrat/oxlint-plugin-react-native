/**
 * no-inline-styles rule: run against oxlint (not ESLint).
 */

import { hasDist, runOxlintWithPlugin } from "../run-oxlint";

const RULE = "react-native/no-inline-styles";
const rules = { [RULE]: "error" };

describe("no-inline-styles", () => {
  if (!hasDist()) {
    it("requires dist (run npm run build)", () => {
      expect(hasDist()).toBe(true);
    });
    return;
  }

  describe("valid", () => {
    it("using StyleSheet.create", () => {
      const code = `
      const styles = StyleSheet.create({
        style1: { color: 'red' },
        style2: { color: 'blue' }
      });
      export default function MyComponent() {
        return <View style={styles.style1} />;
      }
    `;
      const out = runOxlintWithPlugin(code, rules);
      expect(out).toEqual("");
    });
  });

  describe("invalid", () => {
    it("inline style object", () => {
      const code = `
      export default function Hello() {
        return <Text style={{ backgroundColor: '#FFFFFF', opacity: 0.5 }}>Hello</Text>;
      }
    `;
      const out = runOxlintWithPlugin(code, rules);
      expect(out).toContain(
        "react-native(no-inline-styles): Inline style: { backgroundColor: '#FFFFFF', opacity: 0.5 }",
      );
    });

    it("inline style with literal number", () => {
      const code = `
      export default function Hello() {
        return <Text style={{ height: 12 }}>Hello</Text>;
      }
    `;
      const out = runOxlintWithPlugin(code, rules);
      expect(out).toContain(
        "react-native(no-inline-styles): Inline style: { height: 12 }",
      );
    });

    it("inline style in array", () => {
      const code = `
      export default function Hello() {
        return <Text style={[styles.text, { backgroundColor: '#FFFFFF' }]}>Hello</Text>;
      }
    `;
      const out = runOxlintWithPlugin(code, rules);
      expect(out).toContain(
        "react-native(no-inline-styles): Inline style: { backgroundColor: '#FFFFFF' }",
      );
    });
  });
});
