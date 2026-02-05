# sort-styles

Enforce a consistent order for style class names and style properties in `StyleSheet.create()`. Default order is ascending (alphabetical).

## Rule details

- **Rule ID:** `react-native/sort-styles`
- **Fixable:** Yes (when there are no comments between properties)

The rule checks:

1. **Class names** — the keys of the object passed to `StyleSheet.create()` (e.g. `a`, `b`, `box` must be in order).
2. **Style properties** — the keys inside each style object (e.g. `alignItems`, `flex`, `zIndex` must be in order).

Shorthand pairs (e.g. `margin` and `marginTop`) keep their original order relative to each other. When comments are present between properties, the rule still reports but does not auto-fix to avoid removing or moving comments.

## Examples

### ❌ Incorrect (ascending default)

```jsx
const styles = StyleSheet.create({
  c: {},
  b: {},
  a: {},
});

const styles = StyleSheet.create({
  box: {
    zIndex: 1,
    alignItems: 'center',
  },
});
```

### ✅ Correct

```jsx
const styles = StyleSheet.create({
  a: {},
  b: {},
  c: {},
});

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    zIndex: 1,
  },
});
```

## Message

```
Expected {{type}} to be in {{order}}ending order. '{{currentName}}' should be before '{{prevName}}'.
```

## Options

- **First option:** `'asc'` (default) or `'desc'` — sort order for both class names and properties.

- **Second option:** object with:
  - **`ignoreClassNames`** (boolean): If `true`, do not enforce order on class names in `StyleSheet.create()`.
  - **`ignoreStyleProperties`** (boolean): If `true`, do not enforce order on style properties inside each style object.

```json
{
  "react-native/sort-styles": ["warn", "asc", { "ignoreClassNames": true }]
}
```
