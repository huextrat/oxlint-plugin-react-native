# no-color-literals

Disallow color literals in styles. Use variables, constants, or theme values instead so colors stay consistent and easy to change.

## Rule details

- **Rule ID:** `react-native/no-color-literals`
- **Fixable:** No

The rule flags:

- Color literals in inline style objects (e.g. `style={{ backgroundColor: '#fff' }}`)
- Color literals inside `StyleSheet.create()` (e.g. `color: 'red'`, `backgroundColor: '#ccc'`)

It does not flag styles that use variables or expressions that resolve to colors at runtime.

## Examples

### ❌ Incorrect

```jsx
<View style={{ backgroundColor: '#FFFFFF' }} />
<Text style={{ color: 'red' }}>Hello</Text>

const styles = StyleSheet.create({
  box: { backgroundColor: '#ccc' },
});
```

### ✅ Correct

```jsx
const colors = { white: '#FFFFFF', red: 'red' };
<View style={{ backgroundColor: colors.white }} />
<Text style={{ color: colors.red }}>Hello</Text>

const styles = StyleSheet.create({
  box: { backgroundColor: colors.gray },
});
```

## Message

```
Color literal: {{expression}}
```

## Options

None.
