# no-unused-styles

Report style definitions in `StyleSheet.create()` that are never referenced. Unused styles add noise and can be removed.

## Rule details

- **Rule ID:** `react-native/no-unused-styles`
- **Fixable:** Yes (removes the unused style property from `StyleSheet.create`)

The rule tracks:

- Style names defined in `StyleSheet.create({ ... })`
- References to those styles (e.g. `styles.foo`, `styles.bar`) in `style` props

Any defined style that is never used is reported.

## Examples

### ❌ Incorrect

```jsx
const styles = StyleSheet.create({
  used: { flex: 1 },
  unused: { color: "red" },
});
export default function My() {
  return <View style={styles.used} />;
}
```

### ✅ Correct

```jsx
const styles = StyleSheet.create({
  box: { flex: 1 },
  text: { color: "red" },
});
export default function My() {
  return (
    <View style={styles.box}>
      <Text style={styles.text}>Hi</Text>
    </View>
  );
}
```

## Message

```
Unused style detected: {{styleSheetName}}.{{styleName}}
```

## Options

None.
