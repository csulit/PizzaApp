---
name: ignite-navigation
description: Guide for implementing navigation in Ignite React Native apps. Use when creating new screens, routes, navigators, or handling navigation logic. Triggers on screen creation, route definition, navigation implementation, deep linking.
---

# Ignite Navigation Guide

This skill provides guidance on implementing navigation following Ignite's patterns with React Navigation v7.

## Quick Reference

| File | Purpose |
|------|---------|
| `AppNavigator.tsx` | Main stack navigator, root navigation configuration |
| `navigationTypes.ts` | TypeScript type definitions for all navigators |
| `navigationUtilities.ts` | Helper functions and hooks for navigation |

## Critical Rules

1. **ALWAYS add route types to `AppStackParamList`** in `navigationTypes.ts` first
2. **ALWAYS add screens at the `IGNITE_GENERATOR_ANCHOR_APP_STACK_SCREENS`** comment
3. **Use typed screen props** via `AppStackScreenProps<"ScreenName">`
4. **Use conditional rendering** for auth-based routing (not imperative navigation)
5. **Use `useNavigation` hook** inside components, `navigationRef` only outside React tree

## Adding a New Screen (3 Steps)

### Step 1: Define Route Type

```typescript
// navigationTypes.ts
export type AppStackParamList = {
  Welcome: undefined
  Login: undefined
  Demo: NavigatorScreenParams<DemoTabParamList>
  MyNewScreen: { itemId: string }  // Add here with params (or undefined)
  // IGNITE_GENERATOR_ANCHOR_APP_STACK_PARAM_LIST
}
```

### Step 2: Register Screen

```typescript
// AppNavigator.tsx - Add INSIDE the conditional rendering block
{isAuthenticated ? (
  <>
    <Stack.Screen name="Welcome" component={WelcomeScreen} />
    <Stack.Screen name="MyNewScreen" component={MyNewScreen} />
  </>
) : (
  <Stack.Screen name="Login" component={LoginScreen} />
)}
{/* IGNITE_GENERATOR_ANCHOR_APP_STACK_SCREENS */}
```

### Step 3: Create Screen with Typed Props

```typescript
// MyNewScreen.tsx
import { FC } from "react"
import { AppStackScreenProps } from "@/navigators/navigationTypes"

interface MyNewScreenProps extends AppStackScreenProps<"MyNewScreen"> {}

export const MyNewScreen: FC<MyNewScreenProps> = ({ route, navigation }) => {
  const { itemId } = route.params  // Fully typed!
  // ...
}
```

## Navigation Utilities

```typescript
import { navigate, goBack, resetRoot, navigationRef } from "@/navigators/navigationUtilities"

// Navigate from outside components
navigate("MyNewScreen", { itemId: "123" })

// Go back
goBack()

// Reset after logout
resetRoot({ index: 0, routes: [{ name: "Login" }] })
```

## Configuration

In `config/config.base.ts`:

```typescript
{
  persistNavigation: "dev",     // "always" | "dev" | "prod" | "never"
  exitRoutes: ["Welcome"],      // Screens that exit app on Android back press
}
```

## Additional Resources

- For detailed patterns and examples, see [reference.md](reference.md)
- Navigator source files: `app/navigators/`
