# Ignite Styling Reference

Complete documentation for Ignite's styling patterns and best practices.

---

## Philosophy: Why No StyleSheet.create()?

Ignite uses **plain JavaScript objects and functions** instead of `StyleSheet.create()` because:

1. **No practical performance benefit** - StyleSheet.create() validation only runs in development
2. **Better type inference** - Plain objects work better with TypeScript
3. **Simpler composition** - Spread syntax and arrays are more intuitive
4. **Theme functions** - ThemedStyle pattern requires functions, not static objects

---

## The $ Prefix Convention

All style constants are prefixed with `$` to:
- Immediately identify style-related variables
- Distinguish from other constants
- Follow Ignite's established convention

```typescript
// Good
const $container: ViewStyle = { flex: 1 }
const $title: TextStyle = { fontSize: 24 }
const $button: ThemedStyle<ViewStyle> = (theme) => ({ ... })

// Bad - missing $ prefix
const containerStyle: ViewStyle = { flex: 1 }
const titleStyles: TextStyle = { fontSize: 24 }
```

---

## Style Types

### Static Styles

For styles that don't depend on theme:

```typescript
import type { ViewStyle, TextStyle, ImageStyle } from "react-native"

const $row: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
}

const $boldText: TextStyle = {
  fontWeight: "bold",
}

const $avatar: ImageStyle = {
  width: 48,
  height: 48,
  borderRadius: 24,
}
```

### ThemedStyle<T>

For styles that respond to theme changes:

```typescript
import type { ViewStyle, TextStyle } from "react-native"
import type { ThemedStyle } from "@/theme"

const $screen: ThemedStyle<ViewStyle> = (theme) => ({
  flex: 1,
  backgroundColor: theme.colors.background,
  padding: theme.spacing.md,
})

const $title: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.text,
  fontFamily: theme.typography.display.normal,
  fontSize: 32,
})
```

### ThemedStyleArray<T>

For composing multiple styles (static and/or themed):

```typescript
import type { ViewStyle } from "react-native"
import type { ThemedStyleArray } from "@/theme"
import { $styles } from "@/theme"

const $card: ThemedStyleArray<ViewStyle> = [
  $styles.row,                              // Static style
  { borderRadius: 8 },                      // Plain object
  (theme) => ({                             // ThemedStyle
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  }),
]
```

---

## Applying Styles with themed()

The `themed()` function from `useAppTheme()` resolves ThemedStyle functions:

```typescript
import { useAppTheme } from "@/theme"

const MyComponent = () => {
  const { themed } = useAppTheme()

  return (
    <View style={themed($container)}>
      <Text style={themed($title)}>Hello</Text>
    </View>
  )
}

// Themed style definitions
const $container: ThemedStyle<ViewStyle> = (theme) => ({
  backgroundColor: theme.colors.background,
})

const $title: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.text,
})
```

### Composing Styles

```typescript
// Single themed style
<View style={themed($container)} />

// Array of styles (static + themed)
<View style={themed([$styles.flex1, $container])} />

// Plain object still works
<View style={themed({ padding: 16 })} />

// Mixed array
<View style={themed([
  $styles.row,              // Static from $styles
  $baseContainer,           // Your themed style
  { marginTop: 10 },        // Inline static
])} />
```

---

## Component Presets System

Ignite components use **presets** for style variants:

### Defining Presets

```typescript
type Presets = "default" | "filled" | "reversed" | "destructive"

// Base style shared by all presets
const $baseViewStyle: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  minHeight: 56,
  borderRadius: 4,
  justifyContent: "center",
  alignItems: "center",
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.sm,
})

// Preset definitions using ThemedStyleArray
const $viewPresets: Record<Presets, ThemedStyleArray<ViewStyle>> = {
  default: [
    $styles.row,
    $baseViewStyle,
    ({ colors }) => ({
      borderWidth: 1,
      borderColor: colors.palette.neutral400,
      backgroundColor: colors.palette.neutral100,
    }),
  ],
  filled: [
    $styles.row,
    $baseViewStyle,
    ({ colors }) => ({
      backgroundColor: colors.palette.neutral300,
    }),
  ],
  reversed: [
    $styles.row,
    $baseViewStyle,
    ({ colors }) => ({
      backgroundColor: colors.palette.neutral800,
    }),
  ],
  destructive: [
    $styles.row,
    $baseViewStyle,
    ({ colors }) => ({
      backgroundColor: colors.error,
    }),
  ],
}
```

### Using Presets in Components

```typescript
export function Button(props: ButtonProps) {
  const { themed } = useAppTheme()
  const preset: Presets = props.preset ?? "default"

  function $viewStyle({ pressed }: PressableStateCallbackType): StyleProp<ViewStyle> {
    return [
      themed($viewPresets[preset]),           // Apply preset styles
      $viewStyleOverride,                      // Allow style override
      !!pressed && themed($pressedPresets[preset]),  // Pressed state
    ]
  }

  return <Pressable style={$viewStyle} {...rest} />
}
```

### Pressed/Disabled State Presets

```typescript
const $pressedViewPresets: Record<Presets, ThemedStyle<ViewStyle>> = {
  default: ({ colors }) => ({ backgroundColor: colors.palette.neutral200 }),
  filled: ({ colors }) => ({ backgroundColor: colors.palette.neutral400 }),
  reversed: ({ colors }) => ({ backgroundColor: colors.palette.neutral700 }),
}

const $disabledViewPresets: Record<Presets, ThemedStyle<ViewStyle>> = {
  default: () => ({ opacity: 0.5 }),
  filled: () => ({ opacity: 0.5 }),
  reversed: () => ({ opacity: 0.5 }),
}
```

---

## Shared Styles ($styles)

Import common styles from `@/theme/styles`:

```typescript
import { $styles } from "@/theme"

// Available shared styles
$styles.row        // { flexDirection: "row" }
$styles.flex1      // { flex: 1 }
$styles.flexWrap   // { flexWrap: "wrap" }
$styles.container  // { paddingTop: lg+xl, paddingHorizontal: lg }

// Usage
<View style={$styles.row}>
  <View style={$styles.flex1} />
</View>

// With themed styles
<View style={themed([$styles.row, $customStyle])} />
```

### Adding Shared Styles

Add commonly reused styles to `app/theme/styles.ts`:

```typescript
export const $styles = {
  // Existing styles...
  row: { flexDirection: "row" } as ViewStyle,
  flex1: { flex: 1 } as ViewStyle,

  // Add new shared styles
  center: {
    justifyContent: "center",
    alignItems: "center",
  } as ViewStyle,

  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  } as ViewStyle,
}
```

---

## Style Composition Patterns

### Spread Syntax for Inheritance

```typescript
const $baseText: TextStyle = {
  fontSize: 16,
  lineHeight: 24,
}

const $boldText: TextStyle = {
  ...$baseText,
  fontWeight: "bold",
}

const $largeText: TextStyle = {
  ...$baseText,
  fontSize: 24,
  lineHeight: 32,
}
```

### Conditional Styles

```typescript
const $button: ThemedStyle<ViewStyle> = (theme) => ({
  backgroundColor: theme.isDark
    ? theme.colors.palette.primary400
    : theme.colors.tint,
})

// In component
function $containerStyle(isActive: boolean): ThemedStyle<ViewStyle> {
  return (theme) => ({
    backgroundColor: isActive
      ? theme.colors.tint
      : theme.colors.background,
    borderWidth: isActive ? 2 : 1,
  })
}
```

### Dynamic Style Functions

```typescript
// Style factory function
const $paddedContainer = (horizontal: number, vertical: number): ViewStyle => ({
  paddingHorizontal: horizontal,
  paddingVertical: vertical,
})

// Themed style factory
const $coloredBackground = (colorKey: keyof Colors): ThemedStyle<ViewStyle> =>
  (theme) => ({
    backgroundColor: theme.colors[colorKey],
  })
```

---

## Complete Component Example

```tsx
import { View, ViewStyle, TextStyle } from "react-native"
import { Screen, Text, Button } from "@/components"
import { useAppTheme, $styles, type ThemedStyle } from "@/theme"

interface ProductCardProps {
  name: string
  price: string
  onPress: () => void
  variant?: "default" | "featured"
}

export function ProductCard({ name, price, onPress, variant = "default" }: ProductCardProps) {
  const { themed } = useAppTheme()

  return (
    <View style={themed($cardPresets[variant])}>
      <View style={$styles.flex1}>
        <Text style={themed($name)} text={name} />
        <Text style={themed($price)} text={price} />
      </View>
      <Button
        text="Buy"
        style={themed($button)}
        onPress={onPress}
      />
    </View>
  )
}

// Base styles
const $cardBase: ThemedStyle<ViewStyle> = (theme) => ({
  borderRadius: theme.spacing.sm,
  padding: theme.spacing.md,
  marginBottom: theme.spacing.sm,
})

// Preset variants
const $cardPresets = {
  default: [
    $styles.row,
    $cardBase,
    (theme) => ({
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
    }),
  ] as ThemedStyleArray<ViewStyle>,

  featured: [
    $styles.row,
    $cardBase,
    (theme) => ({
      backgroundColor: theme.colors.tint,
      shadowColor: theme.colors.palette.neutral800,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    }),
  ] as ThemedStyleArray<ViewStyle>,
}

// Text styles
const $name: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.text,
  fontFamily: theme.typography.primary.semiBold,
  fontSize: 16,
})

const $price: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.textDim,
  fontFamily: theme.typography.primary.normal,
  fontSize: 14,
  marginTop: theme.spacing.xxs,
})

const $button: ThemedStyle<ViewStyle> = (theme) => ({
  marginLeft: theme.spacing.md,
})
```

---

## Best Practices

1. **Always prefix with $** - Consistent convention for style identification
2. **Colocate styles at file bottom** - Keeps component logic clean and styles discoverable
3. **Use semantic colors** - `colors.text` over `palette.neutral800`
4. **Stick to spacing scale** - Avoid arbitrary pixel values like `padding: 14`
5. **Prefer ThemedStyle for colors** - Ensures dark mode compatibility
6. **Extract shared styles to $styles** - DRY principle for common patterns
7. **Use presets for variants** - Component API stays clean with `preset="filled"`
8. **Type your styles** - `ThemedStyle<ViewStyle>` catches errors early
9. **Avoid StyleSheet.create()** - Plain objects offer same benefits with more flexibility
10. **Test both themes** - Always verify styles in light and dark mode

---

## Anti-Patterns to Avoid

```typescript
// Bad: Using StyleSheet.create()
const styles = StyleSheet.create({
  container: { flex: 1 },
})

// Good: Plain object
const $container: ViewStyle = { flex: 1 }

// Bad: Hardcoded pixel values
const $box: ViewStyle = { padding: 14, margin: 22 }

// Good: Spacing scale
const $box: ThemedStyle<ViewStyle> = (theme) => ({
  padding: theme.spacing.sm,
  margin: theme.spacing.md,
})

// Bad: Missing $ prefix
const containerStyle: ViewStyle = { flex: 1 }

// Good: With $ prefix
const $container: ViewStyle = { flex: 1 }

// Bad: Inline complex styles
<View style={{
  flex: 1,
  backgroundColor: theme.colors.background,
  padding: theme.spacing.md,
}} />

// Good: Extracted and named
<View style={themed($container)} />

// Bad: Palette colors directly
const $text: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.palette.neutral800,
})

// Good: Semantic colors
const $text: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.text,
})
```

---

## TypeScript Types Reference

```typescript
// From @/theme/types

// Function that receives theme and returns style
type ThemedStyle<T extends ViewStyle | TextStyle | ImageStyle> = (theme: Theme) => T

// Array that can contain static styles, plain objects, and ThemedStyle functions
type ThemedStyleArray<T extends ViewStyle | TextStyle | ImageStyle> = (
  | T
  | ThemedStyle<T>
  | null
  | undefined
  | false
)[]

// For creating typed presets
type PresetRecord<P extends string, T> = Record<P, ThemedStyleArray<T>>
```
