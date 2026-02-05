# no-inline-styles

Disallow inline style objects. Prefer `StyleSheet.create()` so styles are defined in one place, can be reused, and are easier to maintain.

## Rule details

- **Rule ID:** `react-native/no-inline-styles`
- **Fixable:** No

The rule flags any `style` prop whose value is an object expression (e.g. `style={{ width: 1 }}` or `style={{ height: 12 }}`), including when the style is inside an array (e.g. `style={[styles.x, { opacity: 0.5 }]}`).

## Examples

### ❌ Incorrect

```jsx
<View style={{ flex: 1 }} />
<Text style={{ color: '#000', fontSize: 14 }}>Hi</Text>
<View style={[styles.box, { marginTop: 8 }]} />
```

### ✅ Correct

```jsx
const styles = StyleSheet.create({
  container: { flex: 1 },
  text: { color: '#000', fontSize: 14 },
  boxWithMargin: { ...styles.box, marginTop: 8 },
});
<View style={styles.container} />
<Text style={styles.text}>Hi</Text>
<View style={styles.boxWithMargin} />
```

## Message

```
Inline style: {{expression}}
```

## Options

None.
