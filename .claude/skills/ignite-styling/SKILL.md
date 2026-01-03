---
name: ignite-styling
description: Guide for Ignite React Native styling patterns. Use when writing component styles, creating styled components, defining presets, or applying themed/static styles. Triggers on style creation, $-prefixed variables, ThemedStyle usage, component styling.
---

# Ignite Styling Patterns Guide

This skill provides guidance on Ignite's straightforward styling approach using plain JS objects and functions instead of `StyleSheet.create()`.

## Core Philosophy

Ignite favors **direct, colocated styling** without `StyleSheet.create()` which provides minimal practical advantages over plain objects and functions.

## Quick Reference

| Pattern | When to Use |
|---------|-------------|
| `$styleName` | All style constants (prefix indicates style-related) |
| `ThemedStyle<T>` | Dynamic styles that respond to theme changes |
| `ThemedStyleArray<T>` | Arrays of themed/static styles for composition |
| `$styles` import | Shared reusable styles (row, flex1, container) |
| Presets | Component variants via `preset` prop |

## Critical Rules

1. **Prefix all styles with `$`** - Convention: `$container`, `$text`, `$button`
2. **Colocate styles at bottom** of component files
3. **Use `ThemedStyle<T>`** for theme-aware styles
4. **Use `themed()` function** to apply ThemedStyle to components
5. **Avoid `StyleSheet.create()`** - Use plain objects instead
6. **Use spacing constants** - Never hardcode pixel values

## Basic Patterns

### Static Style (Theme-Independent)
```tsx
import type { ViewStyle } from "react-native"

const $container: ViewStyle = {
  flex: 1,
  borderRadius: 8,
}
```

### Themed Style (Theme-Dependent)
```tsx
import type { ViewStyle } from "react-native"
import type { ThemedStyle } from "@/theme"

const $container: ThemedStyle<ViewStyle> = (theme) => ({
  backgroundColor: theme.colors.background,
  padding: theme.spacing.md,
})

// Usage in component
const { themed } = useAppTheme()
<View style={themed($container)} />
```

### Style Composition
```tsx
// Combine static + themed styles
<View style={themed([$styles.row, $container])} />

// Combine multiple themed styles
<View style={themed([$baseStyle, $variantStyle])} />
```

## Component Presets Pattern

```tsx
type Presets = "default" | "filled" | "reversed"

const $viewPresets: Record<Presets, ThemedStyleArray<ViewStyle>> = {
  default: [
    $styles.row,
    $baseStyle,
    ({ colors }) => ({ backgroundColor: colors.palette.neutral100 }),
  ],
  filled: [
    $styles.row,
    $baseStyle,
    ({ colors }) => ({ backgroundColor: colors.palette.neutral300 }),
  ],
}

// Usage
<Button preset="filled" />
```

## Additional Resources

- For detailed patterns and examples, see [reference.md](reference.md)
- Theme documentation: `ignite-theme` skill
- Component source files: `app/components/`
- Shared styles: `app/theme/styles.ts`
