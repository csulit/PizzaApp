# Ignite Theme Reference

Complete documentation for Ignite's theming system using React Context.

---

## Architecture Overview

Ignite's theme system uses React Context to provide a consistent visual language across the app. The theme is composed of:

- **Colors** - Palette + semantic color definitions
- **Spacing** - Consistent whitespace scale
- **Typography** - Font families and loading
- **Timing** - Animation constants

The `ThemeProvider` wraps the app and delivers theming via the `useAppTheme()` hook.

---

## Theme Structure

### Theme Object

```typescript
interface Theme {
  colors: Colors        // Semantic + palette colors
  spacing: Spacing      // Spacing scale
  typography: Typography // Font families
  timing: Timing        // Animation timing
  isDark: boolean       // Theme mode flag
}
```

### File Organization

```
app/theme/
├── colors.ts          # Light theme colors
├── colorsDark.ts      # Dark theme colors
├── spacing.ts         # Light theme spacing
├── spacingDark.ts     # Dark theme spacing (if different)
├── typography.ts      # Font definitions
├── timing.ts          # Animation timing
├── theme.ts           # Theme object exports
├── types.ts           # TypeScript definitions
├── styles.ts          # Shared style constants
└── context.utils.ts   # System UI utilities
```

---

## Colors

### Color Philosophy

Use a two-tier system:

1. **Palette Colors** - Raw colors with neutral names (e.g., `neutral100`, `primary500`)
2. **Semantic Colors** - Purpose-driven colors (e.g., `text`, `background`, `tint`)

### Light Theme (colors.ts)

```typescript
const palette = {
  neutral100: "#FFFFFF",
  neutral200: "#F4F2F1",
  neutral300: "#D7CEC9",
  neutral400: "#B6ACA6",
  neutral500: "#978F8A",
  neutral600: "#564E4A",
  neutral700: "#3C3836",
  neutral800: "#191015",
  neutral900: "#000000",

  primary100: "#F4E0D9",
  primary200: "#E8C1B4",
  primary300: "#DDA28E",
  primary400: "#D28468",
  primary500: "#C76542",
  primary600: "#A54F31",

  secondary100: "#DCDDE9",
  secondary200: "#BCC0D6",
  secondary300: "#9196B9",
  secondary400: "#626894",
  secondary500: "#41476E",

  accent100: "#FFEED4",
  accent200: "#FFE1B2",
  accent300: "#FDD495",
  accent400: "#FBC878",
  accent500: "#FFBB50",

  angry100: "#F2D6CD",
  angry500: "#C03403",

  overlay20: "rgba(25, 16, 21, 0.2)",
  overlay50: "rgba(25, 16, 21, 0.5)",
}

export const colors = {
  palette,
  transparent: "rgba(0, 0, 0, 0)",
  text: palette.neutral800,
  textDim: palette.neutral600,
  background: palette.neutral200,
  border: palette.neutral400,
  tint: palette.primary500,
  tintInactive: palette.neutral300,
  separator: palette.neutral300,
  error: palette.angry500,
  errorBackground: palette.angry100,
}
```

### Dark Theme (colorsDark.ts)

Dark theme inverts the neutral scale and adjusts other colors for dark backgrounds:

```typescript
const palette = {
  neutral900: "#FFFFFF",  // Inverted
  neutral800: "#F4F2F1",
  neutral700: "#D7CEC9",
  // ... inverted scale
  neutral100: "#000000",
  // Other colors adjusted for dark mode
}

export const colors = {
  palette,
  text: palette.neutral800,       // Now light text
  background: palette.neutral200, // Now dark background
  // ... same semantic names, different values
}
```

### Adding Semantic Colors

When a color is used repeatedly, add it as a semantic color:

```typescript
// Instead of using palette.accent100 everywhere for borders:
export const colors = {
  // ... existing colors
  textFieldBorder: palette.accent100,  // New semantic color
}
```

---

## Spacing

### Spacing Scale

```typescript
export const spacing = {
  xxxs: 2,   // Micro gaps, hairlines
  xxs: 4,    // Tiny gaps between inline elements
  xs: 8,     // Small internal padding
  sm: 12,    // Default component padding
  md: 16,    // Standard gaps, section padding
  lg: 24,    // Large gaps between sections
  xl: 32,    // Major section margins
  xxl: 48,   // Large screen sections
  xxxl: 64,  // Full-screen vertical spacing
}
```

### Usage

```typescript
import { spacing } from "@/theme/spacing"

const $container: ViewStyle = {
  padding: spacing.md,
  marginBottom: spacing.lg,
}
```

### With ThemedStyle

```typescript
const $container: ThemedStyle<ViewStyle> = (theme) => ({
  padding: theme.spacing.md,
  marginBottom: theme.spacing.lg,
})
```

### Best Practice

Stick to the scale - avoid custom values like `padding: 14`. If you need different values, modify the scale itself.

---

## Typography

### Font Structure

```typescript
export const customFontsToLoad = {
  interLight,
  interRegular,
  interMedium,
  interSemiBold,
  interBold,
  "CalSans-Regular": require("@assets/fonts/CalSans-Regular.ttf"),
}

const fonts = {
  calSans: {
    normal: "CalSans-Regular",
  },
  inter: {
    light: "interLight",
    normal: "interRegular",
    medium: "interMedium",
    semiBold: "interSemiBold",
    bold: "interBold",
  },
}

export const typography = {
  fonts,
  primary: fonts.inter,    // Body text
  display: fonts.calSans,  // Headlines
  code: Platform.select({ ios: fonts.courier, android: fonts.monospace }),
}
```

### Adding Custom Fonts

1. **Obtain font files** (OTF/TTF) or install Google Font package
2. **Add to `customFontsToLoad`**:
   ```typescript
   export const customFontsToLoad = {
     // existing fonts...
     myCustomFont: require("@assets/fonts/CustomFont.otf"),
   }
   ```
3. **Create font family entry**:
   ```typescript
   const fonts = {
     // existing...
     custom: {
       normal: "myCustomFont",
     },
   }
   ```
4. **Add to typography export**:
   ```typescript
   export const typography = {
     // existing...
     custom: fonts.custom,
   }
   ```

### Using Typography

```typescript
const $headline: ThemedStyle<TextStyle> = (theme) => ({
  fontFamily: theme.typography.display.normal,
  fontSize: 32,
})

const $body: ThemedStyle<TextStyle> = (theme) => ({
  fontFamily: theme.typography.primary.normal,
  fontSize: 16,
})
```

### Text Component Presets

Instead of defining font sizes everywhere, use Text component presets:

```tsx
<Text preset="heading" tx="screen:title" />
<Text preset="subheading" tx="screen:subtitle" />
<Text preset="default" tx="screen:body" />
```

---

## Timing

Animation timing constants:

```typescript
export const timing = {
  quick: 300,  // Quick animations in ms
}
```

Usage:

```typescript
const $animated: ThemedStyle<ViewStyle> = (theme) => ({
  transitionDuration: theme.timing.quick,
})
```

---

## ThemedStyle Type

### Definition

```typescript
type ThemedStyle<T> = (theme: Theme) => T
```

### Usage Patterns

#### Simple Themed Style

```typescript
const $container: ThemedStyle<ViewStyle> = (theme) => ({
  backgroundColor: theme.colors.background,
  padding: theme.spacing.md,
})
```

#### Multiple Styles

```typescript
const $text: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.text,
  fontFamily: theme.typography.primary.normal,
})

const $card: ThemedStyle<ViewStyle> = (theme) => ({
  backgroundColor: theme.isDark ? theme.colors.palette.neutral300 : theme.colors.palette.neutral100,
  borderRadius: 8,
})
```

#### Conditional Theming

```typescript
const $dynamicButton: ThemedStyle<ViewStyle> = (theme) => ({
  backgroundColor: theme.isDark
    ? theme.colors.palette.primary400
    : theme.colors.tint,
})
```

---

## useAppTheme Hook

### Import

```typescript
import { useAppTheme } from "@/theme"
```

### Full API

```typescript
const {
  theme,                    // Current Theme object
  themed,                   // Apply ThemedStyle function
  themeContext,             // "light" | "dark"
  setThemeContextOverride,  // Override system theme
  navigationTheme,          // React Navigation theme
} = useAppTheme()
```

### themed() Function

Applies ThemedStyle to components:

```typescript
// Single style
<View style={themed($container)} />

// Array of styles (static + themed)
<View style={themed([$styles.flex1, $container])} />

// Plain styles still work
<View style={themed({ padding: 16 })} />
```

### Theme Override

```typescript
// Force light mode
setThemeContextOverride("light")

// Force dark mode
setThemeContextOverride("dark")

// Use system preference
setThemeContextOverride(undefined)
```

---

## Shared Styles

### styles.ts

Reusable static styles:

```typescript
import { spacing } from "./spacing"

export const $styles = {
  row: { flexDirection: "row" } as ViewStyle,
  flex1: { flex: 1 } as ViewStyle,
  flexWrap: { flexWrap: "wrap" } as ViewStyle,

  container: {
    paddingTop: spacing.lg + spacing.xl,
    paddingHorizontal: spacing.lg,
  } as ViewStyle,
}
```

Usage:

```tsx
import { $styles } from "@/theme"

<View style={$styles.row}>
  <View style={$styles.flex1} />
</View>
```

---

## System UI Integration

### context.utils.ts

Sync system UI with theme:

```typescript
import { setImperativeTheming } from "@/theme/context.utils"

// Called automatically by ThemeProvider
// Sets native background color to match theme
setImperativeTheming(theme)
```

---

## Complete Component Example

```tsx
import { View, ViewStyle, TextStyle } from "react-native"
import { Screen, Text, Button } from "@/components"
import { useAppTheme, $styles, type ThemedStyle } from "@/theme"

export const MyScreen = () => {
  const { themed, themeContext, setThemeContextOverride } = useAppTheme()

  const toggleTheme = () => {
    setThemeContextOverride(themeContext === "dark" ? "light" : "dark")
  }

  return (
    <Screen preset="scroll" style={themed($screen)}>
      <View style={themed([$styles.container, $content])}>
        <Text preset="heading" style={themed($title)} tx="screen:title" />
        <Text style={themed($body)} tx="screen:description" />
        <Button
          tx="screen:toggleTheme"
          style={themed($button)}
          onPress={toggleTheme}
        />
      </View>
    </Screen>
  )
}

const $screen: ThemedStyle<ViewStyle> = (theme) => ({
  backgroundColor: theme.colors.background,
})

const $content: ThemedStyle<ViewStyle> = (theme) => ({
  gap: theme.spacing.lg,
})

const $title: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.text,
  fontFamily: theme.typography.display.normal,
})

const $body: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.textDim,
  fontFamily: theme.typography.primary.normal,
})

const $button: ThemedStyle<ViewStyle> = (theme) => ({
  marginTop: theme.spacing.xl,
  backgroundColor: theme.colors.tint,
})
```

---

## Best Practices

1. **Use semantic colors** - Reference `colors.text` not `palette.neutral800`
2. **Stick to spacing scale** - Avoid arbitrary pixel values
3. **Prefer Text presets** - Use component presets over custom font styling
4. **Colocate themed styles** - Define `$styles` at bottom of component files
5. **Prefix with $** - Convention for style constants: `$container`, `$text`
6. **Test both themes** - Always verify components in light and dark mode
7. **Use isDark sparingly** - Only for truly different light/dark behaviors

---

## Third-Party Integration

### React Navigation

```tsx
import { useAppTheme } from "@/theme"
import { NavigationContainer } from "@react-navigation/native"

const App = () => {
  const { navigationTheme } = useAppTheme()

  return (
    <NavigationContainer theme={navigationTheme}>
      {/* navigators */}
    </NavigationContainer>
  )
}
```

### Other Libraries

Extend library theme providers with Ignite colors:

```tsx
import { ThemeProvider as ElementsThemeProvider } from 'react-native-elements'
import { useAppTheme } from "@/theme"

const App = () => {
  const { theme } = useAppTheme()

  const elementsTheme = {
    colors: {
      primary: theme.colors.tint,
      secondary: theme.colors.palette.secondary500,
      background: theme.colors.background,
    },
  }

  return (
    <ElementsThemeProvider theme={elementsTheme}>
      {/* app */}
    </ElementsThemeProvider>
  )
}
```
