/**
 * no-single-element-style-arrays rule: run against oxlint.
 */

import { hasDist, runOxlintWithPlugin } from "../run-oxlint";

const RULE = "react-native/no-single-element-style-arrays";
const rules = { [RULE]: "error" };

describe("no-single-element-style-arrays", () => {
  if (!hasDist()) {
    it("requires dist (run npm run build)", () => {
      expect(hasDist()).toBe(true);
    });
    return;
  }

  describe("valid", () => {
    it("style is not an array", () => {
      const code = `
      export default function My() {
        return <View style={styles.box} />;
      }
    `;
      const out = runOxlintWithPlugin(code, rules);
      expect(out).toEqual("");
    });

    it("style array has multiple elements", () => {
      const code = `
      export default function My() {
        return <View style={[styles.a, styles.b]} />;
      }
    `;
      const out = runOxlintWithPlugin(code, rules);
      expect(out).toEqual("");
    });
  });

  describe("invalid", () => {
    it("single-element style array (reference)", () => {
      const code = `
      export default function My() {
        return <View style={[styles.box]}>hi</View>;
      }
    `;
      const out = runOxlintWithPlugin(code, rules);
      expect(out).toContain(
        "react-native(no-single-element-style-arrays): Single element style arrays are not necessary and cause unnecessary re-renders",
      );
    });

    it("single-element style array with object", () => {
      const code = `
      export default function My() {
        return <View style={[{ width: 100 }]}>hi</View>;
      }
    `;
      const out = runOxlintWithPlugin(code, rules);
      expect(out).toContain(
        "react-native(no-single-element-style-arrays): Single element style arrays are not necessary and cause unnecessary re-renders",
      );
    });
  });
});
