---
name: ignite-app-tsx
description: Guide for understanding and modifying the Ignite app entry point (app.tsx). Use when adding providers, configuring deep linking, modifying startup initialization, or troubleshooting app loading issues.
---

# Ignite App Entry Point Guide

This skill provides guidance on understanding and modifying `app/app.tsx`, the main entry point of Ignite apps.

## Quick Reference

| Concern | Implementation |
|---------|----------------|
| Entry file | `app/app.tsx` |
| Root entry | `index.tsx` (loads app.tsx after splash) |
| Reactotron | Loaded conditionally in `__DEV__` mode |

## Key Responsibilities

1. **Font Loading** - Uses `expo-font` to load custom fonts
2. **i18n Initialization** - Sets up internationalization with i18next
3. **Navigation Persistence** - Restores navigation state across restarts
4. **Deep Linking** - Configures URL-based app navigation
5. **Provider Hierarchy** - Wraps app in required context providers

## Provider Hierarchy (Order Matters!)

```typescript
<SafeAreaProvider>
  <KeyboardProvider>
    <AuthProvider>
      <ThemeProvider>
        <AppNavigator />
      </ThemeProvider>
    </AuthProvider>
  </KeyboardProvider>
</SafeAreaProvider>
```

## Critical Rules

1. **DON'T modify unless necessary** - Most of app.tsx is boilerplate
2. **Keep Reactotron import first** - Must be before other imports for dev tools
3. **Add providers in correct order** - Inner providers can access outer context
4. **Wait for all initializations** - Don't render until fonts, i18n, and navigation state are ready

## Adding a New Provider

```typescript
// 1. Import the provider
import { MyProvider } from "./context/MyContext"

// 2. Add to the provider hierarchy (order matters!)
return (
  <SafeAreaProvider>
    <KeyboardProvider>
      <AuthProvider>
        <MyProvider>  {/* Add here - can access Auth */}
          <ThemeProvider>
            <AppNavigator />
          </ThemeProvider>
        </MyProvider>
      </AuthProvider>
    </KeyboardProvider>
  </SafeAreaProvider>
)
```

## Deep Linking Configuration

```typescript
const config = {
  screens: {
    Login: { path: "" },           // Root path
    Welcome: "welcome",            // /welcome
    Demo: {
      screens: {
        DemoShowroom: {
          path: "showroom/:queryIndex?/:itemIndex?",  // With params
        },
      },
    },
  },
}
```

## Initialization Flow

```
1. Reactotron setup (dev only)
2. Gesture handler import
3. Font loading starts (async)
4. i18n initialization (async)
5. Navigation state restoration (async)
6. Wait for all to complete
7. Render app with providers
```

## Additional Resources

- For detailed patterns and examples, see [reference.md](reference.md)
- Navigation details: `/ignite-navigation`
- Theme details: `/ignite-theme`
