# no-single-element-style-arrays

Disallow style arrays that contain only one element (e.g. `style={[styles.x]}`). Use the value directly as `style={styles.x}`. Single-element arrays are unnecessary and can cause extra re-renders because the array reference changes every time.

## Rule details

- **Rule ID:** `react-native/no-single-element-style-arrays`
- **Fixable:** Yes (replaces the array with its single element)

The rule flags `style` props whose value is an array with exactly one element, whether that element is a style reference or an object literal.

## Examples

### ❌ Incorrect

```jsx
<View style={[styles.box]}>hi</View>
<View style={[{ width: 100 }]}>hi</View>
```

### ✅ Correct

```jsx
<View style={styles.box}>hi</View>
<View style={{ width: 100 }}>hi</View>
<View style={[styles.a, styles.b]}>hi</View>
```

## Message

```
Single element style arrays are not necessary and cause unnecessary re-renders
```

## Options

None.
