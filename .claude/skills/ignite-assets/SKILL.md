---
name: ignite-assets
description: Guide for managing static assets in Ignite apps including icons, images, and fonts. Use when adding new icons, images, custom fonts, or configuring app icons and splash screens.
---

# Ignite Assets Guide

This skill provides guidance on managing static assets in Ignite apps using the `assets/` directory and `@assets/` path alias.

## Quick Reference

| Asset Type | Location | Registration |
|------------|----------|--------------|
| Icons | `assets/icons/` | `iconRegistry` in `app/components/Icon.tsx` |
| Images | `assets/images/` | Direct import with `require()` |
| Fonts | `assets/fonts/` | `customFontsToLoad` in `app/theme/typography.ts` |
| App Icons | `assets/images/app-icon-*.png` | Generated via Ignite CLI |

## Critical Rules

1. **Use @assets alias** - Always import with `@assets/` not relative paths
2. **Provide all densities** - Include `@2x` and `@3x` variants for icons/images
3. **Register icons** - Add to `iconRegistry` before using with `<Icon />` component
4. **Load fonts in app.tsx** - Fonts must be in `customFontsToLoad` to be available

## Adding a New Icon (2 Steps)

### Step 1: Add Icon Files

```
assets/icons/
  myIcon.png      (24x24 or base size)
  myIcon@2x.png   (48x48 or 2x base)
  myIcon@3x.png   (72x72 or 3x base)
```

### Step 2: Register in Icon Component

```typescript
// app/components/Icon.tsx
export const iconRegistry = {
  // ...existing icons
  myIcon: require("@assets/icons/myIcon.png"),
}
```

### Usage

```typescript
import { Icon } from "@/components"

<Icon icon="myIcon" size={24} color={colors.tint} />
```

## Adding a New Image

```typescript
// Direct import (no registration needed)
import { Image } from "react-native"

const myImage = require("@assets/images/myImage.png")

<Image source={myImage} style={{ width: 200, height: 100 }} />
```

## Adding a Custom Font

```typescript
// app/theme/typography.ts
export const customFontsToLoad = {
  // ...existing fonts
  "MyFont-Regular": require("@assets/fonts/MyFont-Regular.ttf"),
  "MyFont-Bold": require("@assets/fonts/MyFont-Bold.ttf"),
}

const fonts = {
  // ...existing fonts
  myFont: {
    normal: "MyFont-Regular",
    bold: "MyFont-Bold",
  },
}
```

## App Icon & Splash Screen

Use Ignite CLI generators:

```bash
# Generate app icons from source image
npx ignite-cli generate app-icon ./path/to/icon.png

# Generate splash screen from source image
npx ignite-cli generate splash-screen ./path/to/splash.png
```

## Additional Resources

- For detailed patterns and examples, see [reference.md](reference.md)
- Icon component: `app/components/Icon.tsx`
- Typography config: `app/theme/typography.ts`
