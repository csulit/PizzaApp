# Ignite App Entry Point Reference

Complete documentation for `app/app.tsx`, the main entry point of Ignite apps.

---

## File Overview

The `app/app.tsx` file is the primary entry point for your Ignite application. It's loaded by `index.tsx` (the React Native entry point) after initial splash screen setup.

**Key principle:** Most of this file is boilerplate. You rarely need to modify it, but understanding its structure helps when adding providers or debugging initialization issues.

---

## File Structure

```typescript
// 1. Dev tools setup (must be first)
if (__DEV__) {
  require("./devtools/ReactotronConfig.ts")
}

// 2. Gesture handler (must be early)
import "./utils/gestureHandler"

// 3. React and library imports
import { useEffect, useState } from "react"
import { useFonts } from "expo-font"
import * as Linking from "expo-linking"
import { KeyboardProvider } from "react-native-keyboard-controller"
import { SafeAreaProvider } from "react-native-safe-area-context"

// 4. App imports
import { AuthProvider } from "./context/AuthContext"
import { initI18n } from "./i18n"
import { AppNavigator } from "./navigators/AppNavigator"
import { useNavigationPersistence } from "./navigators/navigationUtilities"
import { ThemeProvider } from "./theme/context"
import { customFontsToLoad } from "./theme/typography"
import { loadDateFnsLocale } from "./utils/formatDate"
import * as storage from "./utils/storage"

// 5. Constants
export const NAVIGATION_PERSISTENCE_KEY = "NAVIGATION_STATE"

// 6. Deep linking config
const prefix = Linking.createURL("/")
const config = { screens: { ... } }

// 7. App component
export function App() { ... }
```

---

## Initialization Dependencies

The app waits for three async operations before rendering:

### 1. Navigation State Restoration

```typescript
const {
  initialNavigationState,
  onNavigationStateChange,
  isRestored: isNavigationStateRestored,
} = useNavigationPersistence(storage, NAVIGATION_PERSISTENCE_KEY)
```

Restores the user's last navigation position from MMKV storage.

### 2. Font Loading

```typescript
const [areFontsLoaded, fontLoadError] = useFonts(customFontsToLoad)
```

Loads custom fonts defined in `theme/typography.ts`. Continues on error to prevent app blocking.

### 3. Internationalization

```typescript
const [isI18nInitialized, setIsI18nInitialized] = useState(false)

useEffect(() => {
  initI18n()
    .then(() => setIsI18nInitialized(true))
    .then(() => loadDateFnsLocale())
}, [])
```

Initializes i18next and loads date-fns locale for formatting.

### Loading Guard

```typescript
if (!isNavigationStateRestored || !isI18nInitialized || (!areFontsLoaded && !fontLoadError)) {
  return null  // Shows native splash screen background
}
```

---

## Provider Hierarchy

Order matters! Inner providers can access outer providers' context.

```typescript
<SafeAreaProvider initialMetrics={initialWindowMetrics}>
  <KeyboardProvider>
    <AuthProvider>
      <ThemeProvider>
        <AppNavigator
          linking={linking}
          initialState={initialNavigationState}
          onStateChange={onNavigationStateChange}
        />
      </ThemeProvider>
    </AuthProvider>
  </KeyboardProvider>
</SafeAreaProvider>
```

### Provider Responsibilities

| Provider | Purpose | From |
|----------|---------|------|
| `SafeAreaProvider` | Safe area insets for notches/islands | `react-native-safe-area-context` |
| `KeyboardProvider` | Keyboard-aware scroll behavior | `react-native-keyboard-controller` |
| `AuthProvider` | Authentication state | `./context/AuthContext` |
| `ThemeProvider` | Theme colors and dark mode | `./theme/context` |

---

## Deep Linking Configuration

### Basic Structure

```typescript
const prefix = Linking.createURL("/")  // Creates app:// or exp:// URL

const config = {
  screens: {
    // Screen with no params
    Login: { path: "" },  // Root URL maps to Login

    // Simple path
    Welcome: "welcome",   // app://welcome → Welcome screen

    // Nested navigator with params
    Demo: {
      screens: {
        DemoShowroom: {
          path: "showroom/:queryIndex?/:itemIndex?",
        },
        DemoDebug: "debug",
        DemoPodcastList: "podcast",
        DemoCommunity: "community",
      },
    },
  },
}

const linking = {
  prefixes: [prefix],
  config,
}
```

### URL Parameter Examples

```
app://                          → Login screen
app://welcome                   → Welcome screen
app://showroom                  → DemoShowroom (no params)
app://showroom/2                → DemoShowroom (queryIndex: "2")
app://showroom/2/5              → DemoShowroom (queryIndex: "2", itemIndex: "5")
app://debug                     → DemoDebug screen
```

### Adding Deep Links for New Screens

1. Add screen to navigation (see `/ignite-navigation`)
2. Add path configuration:

```typescript
const config = {
  screens: {
    // ...existing screens

    // New screen with required param
    OrderDetails: "order/:orderId",

    // New screen with optional params
    ProductList: "products/:category?",

    // Nested in a tab navigator
    Profile: {
      screens: {
        Settings: "settings",
        Preferences: "preferences/:section?",
      },
    },
  },
}
```

---

## Adding a New Provider

### Step 1: Create the Provider

```typescript
// context/AnalyticsContext.tsx
import { createContext, useContext, FC, ReactNode } from "react"

interface AnalyticsContextType {
  trackEvent: (name: string, data?: object) => void
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined)

interface AnalyticsProviderProps {
  children: ReactNode
}

export const AnalyticsProvider: FC<AnalyticsProviderProps> = ({ children }) => {
  const trackEvent = (name: string, data?: object) => {
    // Implementation
  }

  return (
    <AnalyticsContext.Provider value={{ trackEvent }}>
      {children}
    </AnalyticsContext.Provider>
  )
}

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext)
  if (!context) {
    throw new Error("useAnalytics must be used within AnalyticsProvider")
  }
  return context
}
```

### Step 2: Add to app.tsx

```typescript
import { AnalyticsProvider } from "./context/AnalyticsContext"

// In the return statement, add provider in correct order:
return (
  <SafeAreaProvider initialMetrics={initialWindowMetrics}>
    <KeyboardProvider>
      <AuthProvider>
        <AnalyticsProvider>  {/* Can access auth state */}
          <ThemeProvider>
            <AppNavigator ... />
          </ThemeProvider>
        </AnalyticsProvider>
      </AuthProvider>
    </KeyboardProvider>
  </SafeAreaProvider>
)
```

---

## Adding Async Initialization

If your provider needs async initialization:

```typescript
export function App() {
  // Existing state
  const [areFontsLoaded, fontLoadError] = useFonts(customFontsToLoad)
  const [isI18nInitialized, setIsI18nInitialized] = useState(false)

  // Add your async state
  const [isAnalyticsReady, setIsAnalyticsReady] = useState(false)

  useEffect(() => {
    initI18n()
      .then(() => setIsI18nInitialized(true))
      .then(() => loadDateFnsLocale())
  }, [])

  // Add your initialization
  useEffect(() => {
    initAnalytics()
      .then(() => setIsAnalyticsReady(true))
      .catch((error) => {
        console.error("Analytics init failed:", error)
        setIsAnalyticsReady(true)  // Don't block app on analytics failure
      })
  }, [])

  // Update loading guard
  if (
    !isNavigationStateRestored ||
    !isI18nInitialized ||
    !isAnalyticsReady ||
    (!areFontsLoaded && !fontLoadError)
  ) {
    return null
  }

  // ... rest of component
}
```

---

## Reactotron Integration

Reactotron must be loaded before other imports:

```typescript
if (__DEV__) {
  require("./devtools/ReactotronConfig.ts")
}
```

Access in components:

```typescript
if (__DEV__) {
  console.tron.log("Debug message")
  console.tron.display({
    name: "API Response",
    value: data,
    preview: "Fetched 10 items",
  })
}
```

---

## Navigation Persistence

Controlled by `config/config.base.ts`:

```typescript
{
  persistNavigation: "dev",  // "always" | "dev" | "prod" | "never"
}
```

| Value | Behavior |
|-------|----------|
| `"always"` | Always persist navigation state |
| `"dev"` | Only in development |
| `"prod"` | Only in production |
| `"never"` | Never persist |

---

## Troubleshooting

### App Shows Blank Screen

Check the initialization guard:

```typescript
console.log({
  isNavigationStateRestored,
  isI18nInitialized,
  areFontsLoaded,
  fontLoadError,
})
```

### Deep Links Not Working

1. Verify URL scheme in `app.json`:
```json
{
  "expo": {
    "scheme": "myapp"
  }
}
```

2. Test with:
```bash
npx uri-scheme open "myapp://welcome" --ios
npx uri-scheme open "myapp://welcome" --android
```

3. Check config matches navigation structure

### Provider Access Error

"X must be used within XProvider" - Provider order is wrong. Check that consuming component's provider wraps it in the hierarchy.

---

## Best Practices

1. **Minimize modifications** - app.tsx is boilerplate; keep changes minimal

2. **Provider order matters** - Plan hierarchy before adding providers

3. **Don't block on optional services** - Analytics, crash reporting, etc. should not block app load

4. **Use error boundaries** - AppNavigator includes ErrorBoundary; leverage it

5. **Test deep links early** - Configure and test before building complex navigation

6. **Keep Reactotron first** - Must be before other imports for proper integration

7. **Handle font errors gracefully** - App continues even if fonts fail to load
