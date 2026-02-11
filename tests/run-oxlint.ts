/**
 * Run oxlint with the react-native plugin on a code string.
 * Requires dist/ (npm run build). Returns stderr+stdout on non-zero exit.
 */

import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

const ROOT = path.resolve(__dirname, "..");
const TMP_DIR = path.join(__dirname, "tmp");
const PLUGIN_SPEC = path.join(ROOT, "dist", "index.js");
const OXLINT_BIN = path.join(
  ROOT,
  "node_modules",
  ".bin",
  process.platform === "win32" ? "oxlint.cmd" : "oxlint",
);

export function hasDist(): boolean {
  return fs.existsSync(PLUGIN_SPEC);
}

export type RulesConfig = Record<string, string>;

export function runOxlintWithPlugin(
  code: string,
  rules: RulesConfig,
  filename?: string,
): string {
  fs.mkdirSync(TMP_DIR, { recursive: true });
  const runDir = fs.mkdtempSync(path.join(TMP_DIR, "run-"));
  const inputFile = path.join(runDir, filename ?? "input.jsx");
  const configFile = path.join(runDir, ".oxlintrc.json");

  fs.writeFileSync(inputFile, code.trim());
  fs.writeFileSync(
    configFile,
    JSON.stringify(
      {
        $schema: path.join(
          ROOT,
          "node_modules/oxlint/configuration_schema.json",
        ),
        jsPlugins: [
          { name: "react-native", specifier: pathToFileURL(PLUGIN_SPEC).href },
        ],
        rules,
      },
      null,
      2,
    ),
  );

  try {
    execFileSync(OXLINT_BIN, ["-c", configFile, inputFile, "--import-plugin"], {
      encoding: "utf-8",
      cwd: ROOT,
      maxBuffer: 1024 * 1024,
    });
    return "";
  } catch (err: unknown) {
    const e = err as { stdout?: string; stderr?: string };
    return (e?.stdout ?? "") + (e?.stderr ?? "");
  }
}

/**
 * Run oxlint with --fix and return the fixed file content.
 * Returns the written file content after applying fixes.
 */
export function runOxlintWithPluginFix(
  code: string,
  rules: RulesConfig,
  filename?: string,
): string {
  fs.mkdirSync(TMP_DIR, { recursive: true });
  const runDir = fs.mkdtempSync(path.join(TMP_DIR, "run-"));
  const inputFile = path.join(runDir, filename ?? "input.jsx");
  const configFile = path.join(runDir, ".oxlintrc.json");

  fs.writeFileSync(inputFile, code.trim());
  fs.writeFileSync(
    configFile,
    JSON.stringify(
      {
        $schema: path.join(
          ROOT,
          "node_modules/oxlint/configuration_schema.json",
        ),
        jsPlugins: [
          { name: "react-native", specifier: pathToFileURL(PLUGIN_SPEC).href },
        ],
        rules,
      },
      null,
      2,
    ),
  );

  execFileSync(
    OXLINT_BIN,
    ["-c", configFile, inputFile, "--import-plugin", "--fix"],
    { encoding: "utf-8", cwd: ROOT, maxBuffer: 1024 * 1024 },
  );
  return fs.readFileSync(inputFile, "utf-8");
}
