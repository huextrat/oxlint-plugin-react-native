# no-raw-text

Require text content to be wrapped in a `<Text>` (or an allowed) component. In React Native, only text inside `<Text>` is rendered; raw text or other elements used as text can cause issues or be invisible.

## Rule details

- **Rule ID:** `react-native/no-raw-text`
- **Fixable:** No

The rule flags:

- String literals used as JSX children outside of `<Text>` (e.g. `<View>hello</View>`)
- JSX text nodes outside of `<Text>` (e.g. `<View>hello</View>`)
- Template literals in expression containers outside of `<Text>`

By default, the following are treated as valid text containers: `Text`, `TSpan`, `StyledText`, `Animated.Text`. You can allow more with the `skip` option.

## Examples

### ❌ Incorrect

```jsx
<View>hello</View>
<View><span>Raw text</span></View>
```

### ✅ Correct

```jsx
<View><Text>hello</Text></View>
<View><Text>Raw text</Text></View>
```

## Message

```
Raw text ({{value}}) cannot be used outside of a <Text> tag
```

or

```
Whitespace(s) cannot be used outside of a <Text> tag
```

## Options

- **`skip`** (string[]): Extra component names to treat as allowed text parents (e.g. custom text components).

```json
{
  "react-native/no-raw-text": ["error", { "skip": ["MyText", "Label"] }]
}
```
