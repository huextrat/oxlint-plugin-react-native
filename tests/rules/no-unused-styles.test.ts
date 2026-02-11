/**
 * no-unused-styles rule: run against oxlint.
 */

import { hasDist, runOxlintWithPlugin, runOxlintWithPluginFix } from "../run-oxlint";

const RULE = "react-native/no-unused-styles";
const rules = { [RULE]: "error" };

describe("no-unused-styles", () => {
  if (!hasDist()) {
    it("requires dist (run npm run build)", () => {
      expect(hasDist()).toBe(true);
    });
    return;
  }

  describe("valid", () => {
    it("all styles are used", () => {
      const code = `
      const styles = StyleSheet.create({
        box: { flex: 1 },
        text: { color: 'red' },
      });
      export default function My() {
        return (
          <View style={styles.box}>
            <Text style={styles.text}>hi</Text>
          </View>
        );
      }
    `;
      const out = runOxlintWithPlugin(code, rules);
      expect(out).toEqual("");
    });

    it("exported styles are not reported as unused (used in another file)", () => {
      const code = `
      export const styles = StyleSheet.create({
        box: { flex: 1 },
        text: { color: 'red' },
      });
      export default function My() {
        return null;
      }
    `;
      const out = runOxlintWithPlugin(code, rules);
      expect(out).toEqual("");
    });

    it("export { styles } does not report styles as unused", () => {
      const code = `
      const styles = StyleSheet.create({
        box: { flex: 1 },
      });
      export { styles };
      export default function My() {
        return null;
      }
    `;
      const out = runOxlintWithPlugin(code, rules);
      expect(out).toEqual("");
    });
  });

  describe("invalid", () => {
    it("unused style in StyleSheet.create", () => {
      const code = `
      const styles = StyleSheet.create({
        used: { flex: 1 },
        unused: { color: 'red' },
      });
      export default function My() {
        return <View style={styles.used} />;
      }
    `;
      const out = runOxlintWithPlugin(code, rules);
      expect(out).toContain(
        "react-native(no-unused-styles): Unused style detected: styles.unused",
      );
    });
  });

  describe("fix", () => {
    it("removes unused style from StyleSheet.create", () => {
      const code = `
      const styles = StyleSheet.create({
        used: { flex: 1 },
        unused: { color: 'red' },
      });
      export default function My() {
        return <View style={styles.used} />;
      }
    `;
      const fixed = runOxlintWithPluginFix(code, rules);
      console.log(fixed);
      expect(fixed).not.toContain("unused:");
      expect(fixed).toContain("used: { flex: 1 }");
      expect(fixed).toContain("StyleSheet.create({");
      expect(fixed).toContain("});");
    });
  });
});
