# oxlint-plugin-react-native

Lint rules for [React Native](https://reactnative.dev/) projects, built for [Oxlint](https://github.com/oxc-project/oxc).

---

## Installation

**npm**

```bash
npm install oxlint-plugin-react-native oxlint --save-dev
```

**yarn**

```bash
yarn add -D oxlint-plugin-react-native oxlint
```

---

## Configuration

In your Oxlint config (e.g. `.oxlintrc.json`), register the plugin by **name** and enable the rules you want:

```json
{
  "jsPlugins": [
    { "name": "react-native", "specifier": "oxlint-plugin-react-native" }
  ],
  "rules": {
    "react-native/no-color-literals": "error",
    "react-native/no-inline-styles": "warn",
    "react-native/no-raw-text": "error",
    "react-native/no-single-element-style-arrays": "error",
    "react-native/no-unused-styles": "warn",
    "react-native/sort-styles": "warn"
  }
}
```

---

## Rules

| Rule | Description | Fix |
|------|-------------|:---:|
| [no-color-literals](docs/no-color-literals.md) | Disallow color literals in styles; use variables or theme | — |
| [no-inline-styles](docs/no-inline-styles.md) | Disallow inline style objects; prefer `StyleSheet.create` | — |
| [no-raw-text](docs/no-raw-text.md) | Require text inside `<Text>` (or allowed components) | — |
| [no-single-element-style-arrays](docs/no-single-element-style-arrays.md) | Disallow single-element style arrays (`style={[x]}`) | ✅ |
| [no-unused-styles](docs/no-unused-styles.md) | Report unused styles from `StyleSheet.create` | — |
| [sort-styles](docs/sort-styles.md) | Enforce order of class names and style properties | ✅ |

Each rule is documented in the [docs](docs/) folder with examples and options.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run lint` | Run Oxlint |
| `npm run format` | Run Oxlint with `--fix` |
| `npm test` | Run tests |

---

## License

MIT
