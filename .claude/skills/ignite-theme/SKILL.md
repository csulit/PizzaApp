---
name: ignite-theme
description: Guide for implementing theming in Ignite React Native apps. Use when styling components, implementing dark mode, customizing colors/typography/spacing, or creating themed styles. Triggers on theme customization, dark mode, styling components dynamically.
---

# Ignite Theme Guide

This skill provides guidance on using Ignite's theming system with React Context for consistent visual styling.

## Quick Reference

| File | Purpose |
|------|---------|
| `theme/colors.ts` | Light theme palette + semantic colors |
| `theme/colorsDark.ts` | Dark theme palette + semantic colors |
| `theme/spacing.ts` | Spacing scale (xxxs to xxxl) |
| `theme/typography.ts` | Font families + custom fonts |
| `theme/timing.ts` | Animation timing constants |
| `theme/theme.ts` | Theme object definitions (light/dark) |
| `theme/types.ts` | TypeScript types (Theme, ThemedStyle) |
| `theme/styles.ts` | Shared reusable styles |
| `theme/context.utils.ts` | System UI helpers |

## Critical Rules

1. **Use `useAppTheme()` hook** for accessing theme in components
2. **Use `ThemedStyle<T>` type** for dynamic styles that respond to theme
3. **Apply styles with `themed()` function** from the hook
4. **Use semantic colors** (e.g., `colors.text`) over palette colors (e.g., `palette.neutral800`)
5. **Use spacing constants** - never hardcode pixel values

## Core Hook: useAppTheme()

```tsx
import { useAppTheme } from "@/theme"

const MyComponent = () => {
  const { theme, themed, themeContext, setThemeContextOverride } = useAppTheme()

  return <View style={themed($container)} />
}
```

### Hook Returns

| Property | Type | Description |
|----------|------|-------------|
| `theme` | `Theme` | Current theme object (colors, spacing, typography, timing) |
| `themed` | `ThemedFnT` | Function to apply ThemedStyle to components |
| `themeContext` | `"light" \| "dark"` | Current active theme |
| `setThemeContextOverride` | `(mode) => void` | Override system theme |
| `navigationTheme` | `object` | React Navigation compatible theme |

## ThemedStyle Pattern

```tsx
import type { ViewStyle } from "react-native"
import type { ThemedStyle } from "@/theme"

const $container: ThemedStyle<ViewStyle> = (theme) => ({
  backgroundColor: theme.colors.background,
  padding: theme.spacing.md,
})

// Use in component
const { themed } = useAppTheme()
<View style={themed($container)} />
```

## Spacing Scale

| Name | Value | Use Case |
|------|-------|----------|
| `xxxs` | 2px | Micro gaps |
| `xxs` | 4px | Tiny gaps |
| `xs` | 8px | Small padding |
| `sm` | 12px | Default padding |
| `md` | 16px | Section gaps |
| `lg` | 24px | Large gaps |
| `xl` | 32px | Section margins |
| `xxl` | 48px | Major sections |
| `xxxl` | 64px | Full-screen spacing |

## Additional Resources

- For detailed patterns and examples, see [reference.md](reference.md)
- Theme source files: `app/theme/`

## Common Patterns

### Dynamic Background
```tsx
const $screen: ThemedStyle<ViewStyle> = (theme) => ({
  flex: 1,
  backgroundColor: theme.colors.background,
})
```

### Theme Toggle
```tsx
const { themeContext, setThemeContextOverride } = useAppTheme()

const toggleTheme = () => {
  setThemeContextOverride(themeContext === "dark" ? "light" : "dark")
}

// Reset to system preference
const useSystemTheme = () => setThemeContextOverride(undefined)
```

### Combining Static + Themed Styles
```tsx
const $button: ThemedStyle<ViewStyle> = (theme) => ({
  borderRadius: 8,
  padding: theme.spacing.md,
  backgroundColor: theme.colors.tint,
})

<Button style={themed([$styles.row, $button])} />
```
