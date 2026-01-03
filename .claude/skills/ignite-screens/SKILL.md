---
name: ignite-screens
description: Guide for creating screens in Ignite React Native apps. Use when building new screens, implementing layouts, forms, lists, or any screen-level UI. Triggers on screen creation, layout implementation, screen styling.
---

# Ignite Screens Guide

This skill provides guidance on creating screens following Ignite's patterns and best practices.

## Quick Reference

| Screen Preset | Use Case |
|---------------|----------|
| `"fixed"` | Screens with FlatList or self-scrolling components |
| `"scroll"` | Forms, content needing keyboard avoidance |
| `"auto"` | General purpose, conditionally scrolls based on content |

## Critical Rules

1. **ALWAYS use the `Screen` component** as the root wrapper
2. **ALWAYS extend navigation props** via `AppStackScreenProps<"ScreenName">`
3. **ALWAYS use `ThemedStyle<T>`** for theme-responsive styles
4. **ALWAYS define styles outside components** with `$` prefix
5. **Use `tx` props** for text internationalization
6. **Co-locate screen-specific components** with their screens

## Basic Screen Template

```typescript
import { FC } from "react"
import { ViewStyle } from "react-native"
import { Screen, Text, Header } from "@/components"
import { AppStackScreenProps } from "@/navigators/navigationTypes"
import { useAppTheme } from "@/theme"
import type { ThemedStyle } from "@/theme"

interface MyScreenProps extends AppStackScreenProps<"MyScreen"> {}

export const MyScreen: FC<MyScreenProps> = function MyScreen({ navigation }) {
  const { themed } = useAppTheme()

  return (
    <Screen
      preset="scroll"
      contentContainerStyle={themed($container)}
      safeAreaEdges={["top", "bottom"]}
    >
      <Header titleTx="myScreen:title" leftIcon="back" onLeftPress={navigation.goBack} />
      {/* Screen content */}
    </Screen>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingVertical: spacing.xxl,
  paddingHorizontal: spacing.lg,
})
```

## Screen Presets

```typescript
// Fixed - for FlatList screens
<Screen preset="fixed" safeAreaEdges={["top"]} contentContainerStyle={$styles.flex1}>
  <FlatList ... />
</Screen>

// Scroll - for forms
<Screen preset="scroll" safeAreaEdges={["top", "bottom"]} keyboardShouldPersistTaps="handled">
  {/* Form fields */}
</Screen>

// Auto - conditional scrolling
<Screen preset="auto" safeAreaEdges={["top", "bottom"]}>
  {/* Content */}
</Screen>
```

## File Organization

```
app/screens/
  MyScreen.tsx                    # Simple screen
  MyComplexScreen/
    MyComplexScreen.tsx           # Main screen file
    MyScreenComponent.tsx         # Screen-specific component
```

## Additional Resources

- For detailed patterns and examples, see [reference.md](reference.md)
- Screen source files: `app/screens/`
- Screen component: `app/components/Screen.tsx`
