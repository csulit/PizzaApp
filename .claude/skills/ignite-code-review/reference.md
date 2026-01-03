# Ignite Code Review Reference

Comprehensive reference for all code review rules, violation patterns, and fixes.

---

## 1. Import Rules

### 1.1 Banned Imports (ERROR)

#### No React Native Text/Button/TextInput

**Why**: Ignite provides custom wrappers with i18n support, theming, and consistent styling.

```tsx
// BAD
import { Text, Button, TextInput, View } from "react-native"

// GOOD
import { View } from "react-native"
import { Text, Button, TextField } from "@/components"
```

**Detection Pattern**: `import { ... Text ... } from "react-native"`

#### No React Native SafeAreaView

**Why**: Use `react-native-safe-area-context` for proper safe area handling with hooks.

```tsx
// BAD
import { SafeAreaView } from "react-native"

// GOOD
import { SafeAreaView } from "react-native-safe-area-context"
// OR better - use Screen component which handles this
import { Screen } from "@/components"
```

#### No Default React Import

**Why**: Named imports enable better tree-shaking and follow modern React patterns.

```tsx
// BAD
import React from "react"
import React, { useState } from "react"

// GOOD
import { useState, useEffect, useMemo } from "react"
```

### 1.2 Import Order (WARNING)

**Required Order**:
1. `react`
2. `react-native`
3. `expo` / `expo-*`
4. External packages
5. `@/` path aliases
6. Relative imports

```tsx
// BAD
import { Screen } from "@/components"
import { useState } from "react"
import { View } from "react-native"

// GOOD
import { useState } from "react"

import { View } from "react-native"

import * as Haptics from "expo-haptics"

import { Screen, Text, Button } from "@/components"

import { MyLocalComponent } from "./MyLocalComponent"
```

### 1.3 Path Aliases (WARNING)

**Why**: Consistent imports, easier refactoring, clearer module boundaries.

```tsx
// BAD (deep relative imports)
import { Button } from "../../../components/Button"
import { colors } from "../../../theme/colors"

// GOOD
import { Button } from "@/components"
import { colors } from "@/theme"
```

**Path Alias Map**:
- `@/*` → `./app/*`
- `@assets/*` → `./assets/*`

---

## 2. Component Rules

### 2.1 Screen Component Required (ERROR)

**Why**: Screen handles safe areas, keyboard avoidance, scroll behavior, and status bar.

```tsx
// BAD - screen without Screen wrapper
export function HomeScreen() {
  return (
    <View style={{ flex: 1 }}>
      <Text>Content</Text>
    </View>
  )
}

// GOOD
export function HomeScreen() {
  return (
    <Screen preset="scroll" safeAreaEdges={["top"]}>
      <Text>Content</Text>
    </Screen>
  )
}
```

**Screen Presets**:
- `fixed` - No scroll (use for screens with FlatList/ScrollView)
- `scroll` - Built-in ScrollView (use for forms, content)
- `auto` - Conditional scroll based on content

### 2.2 Always Use Ignite Text (ERROR)

**Why**: Ignite Text supports i18n, theming, presets, and RTL.

```tsx
// BAD
<Text style={{ fontSize: 16 }}>Hello</Text>

// GOOD
import { Text } from "@/components"
<Text preset="default" tx="common:hello" />
<Text size="md" weight="medium">Hello</Text>
```

### 2.3 Memoize Button Accessories (WARNING)

**Why**: Prevents re-renders and flickering on button press states.

```tsx
// BAD - creates new component on every render
<Button
  LeftAccessory={() => <Icon icon="check" />}
/>

// GOOD
const LeftIcon = useMemo(
  () => (props: ButtonAccessoryProps) => <Icon icon="check" color={props.pressableState.pressed ? "gray" : "black"} />,
  []
)

<Button LeftAccessory={LeftIcon} />
```

### 2.4 Prefer tx Over text Props (WARNING)

**Why**: Enables internationalization and consistent translation management.

```tsx
// BAD
<Text text="Submit" />
<Button text="Cancel" />
<TextField label="Email" />

// GOOD
<Text tx="common:submit" />
<Button tx="common:cancel" />
<TextField labelTx="form:email" />

// ACCEPTABLE - dynamic content
<Text text={user.name} />
<Text>{`${count} items`}</Text>
```

### 2.5 Use EmptyState for Empty Lists (INFO)

```tsx
// BAD
{items.length === 0 && <Text>No items found</Text>}

// GOOD
{items.length === 0 ? (
  <EmptyState
    preset="generic"
    headingTx="items:emptyTitle"
    contentTx="items:emptyMessage"
    buttonTx="items:refresh"
    buttonOnPress={handleRefresh}
  />
) : (
  <FlatList ... />
)}
```

---

## 3. Styling Rules

### 3.1 No StyleSheet.create (WARNING)

**Why**: Plain objects work identically with no practical downsides. Simpler, more flexible.

```tsx
// BAD
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})

// GOOD
const $container: ViewStyle = {
  flex: 1,
}
```

### 3.2 Prefix Styles with $ (WARNING)

**Why**: Convention that clearly identifies style-related constants.

```tsx
// BAD
const container: ViewStyle = { flex: 1 }
const textStyle: TextStyle = { fontSize: 16 }

// GOOD
const $container: ViewStyle = { flex: 1 }
const $text: TextStyle = { fontSize: 16 }
```

### 3.3 No Hardcoded Colors (ERROR)

**Why**: Breaks theming, dark mode support, and design consistency.

```tsx
// BAD
const $container: ViewStyle = {
  backgroundColor: "#FFFFFF",
  borderColor: "red",
}

// GOOD - static style referencing colors
import { colors } from "@/theme"
const $container: ViewStyle = {
  backgroundColor: colors.background,
  borderColor: colors.error,
}

// BETTER - themed style
const $container: ThemedStyle<ViewStyle> = (theme) => ({
  backgroundColor: theme.colors.background,
  borderColor: theme.colors.error,
})
```

### 3.4 No Hardcoded Spacing (ERROR)

**Why**: Inconsistent spacing breaks visual rhythm and design system.

```tsx
// BAD
const $container: ViewStyle = {
  padding: 16,
  marginBottom: 8,
  gap: 24,
}

// GOOD - use spacing constants
import { spacing } from "@/theme"
const $container: ViewStyle = {
  padding: spacing.md,
  marginBottom: spacing.xs,
  gap: spacing.lg,
}

// OR with themed style
const $container: ThemedStyle<ViewStyle> = (theme) => ({
  padding: theme.spacing.md,
  marginBottom: theme.spacing.xs,
  gap: theme.spacing.lg,
})
```

**Spacing Scale**:
- `xxxs`: 2
- `xxs`: 4
- `xs`: 8
- `sm`: 12
- `md`: 16
- `lg`: 24
- `xl`: 32
- `xxl`: 48
- `xxxl`: 64

### 3.5 Use ThemedStyle for Theme-Dependent Styles (WARNING)

```tsx
// BAD - won't respond to theme changes
const $card: ViewStyle = {
  backgroundColor: colors.background,
}

// GOOD
const $card: ThemedStyle<ViewStyle> = (theme) => ({
  backgroundColor: theme.colors.background,
})

// Usage
const { themed } = useAppTheme()
<View style={themed($card)} />
```

### 3.6 Colocate Styles at File Bottom (WARNING)

```tsx
// BAD - styles scattered throughout file
const $header: ViewStyle = { ... }

function MyComponent() { ... }

const $footer: ViewStyle = { ... }

// GOOD - all styles at bottom
function MyComponent() {
  // component code
}

// Styles
const $container: ViewStyle = { ... }
const $header: ViewStyle = { ... }
const $footer: ViewStyle = { ... }
```

---

## 4. Navigation Rules

### 4.1 Register Screen Types First (ERROR)

**Why**: Type safety for navigation params and screen props.

```tsx
// In app/navigators/navigationTypes.ts
export type AppStackParamList = {
  Welcome: undefined
  Login: undefined
  // Add new screen types here
  Profile: { userId: string }  // with params
  Settings: undefined          // without params
}
```

### 4.2 Use Auth-Based Conditional Rendering (WARNING)

**Why**: Cleaner than imperative navigation, prevents flash of wrong screen.

```tsx
// BAD - imperative navigation in useEffect
useEffect(() => {
  if (isAuthenticated) {
    navigation.navigate("Home")
  } else {
    navigation.navigate("Login")
  }
}, [isAuthenticated])

// GOOD - conditional rendering in navigator
function AppNavigator() {
  const { isAuthenticated } = useAuth()

  return (
    <Stack.Navigator>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  )
}
```

### 4.3 Use Typed Screen Props (WARNING)

```tsx
// BAD
function ProfileScreen({ navigation, route }: any) { ... }

// GOOD
import { AppStackScreenProps } from "@/navigators"

function ProfileScreen({ navigation, route }: AppStackScreenProps<"Profile">) {
  const { userId } = route.params // typed!
  navigation.navigate("Settings") // typed!
}
```

---

## 5. i18n Rules

### 5.1 Translation Key Format (WARNING)

**Format**: `namespace:path.to.key`

```tsx
// BAD
tx="submit"
tx="form.email.label"

// GOOD
tx="common:submit"
tx="form:email.label"
```

### 5.2 Provide txOptions for Dynamic Values (INFO)

```tsx
// Translation file
{
  "greeting": "Hello, {{name}}!"
}

// BAD
<Text text={`Hello, ${name}!`} />

// GOOD
<Text tx="common:greeting" txOptions={{ name }} />
```

---

## 6. Services/API Rules

### 6.1 Use Discriminated Unions for Results (WARNING)

```tsx
// BAD
async function getUser(id: string): Promise<User | null> {
  const response = await api.get(`/users/${id}`)
  return response.ok ? response.data : null
}

// GOOD
async function getUser(id: string): Promise<{ kind: "ok"; user: User } | GeneralApiProblem> {
  const response = await api.get<UserResponse>(`/users/${id}`)

  if (!response.ok) {
    return getGeneralApiProblem(response)
  }

  return { kind: "ok", user: transformUser(response.data) }
}
```

### 6.2 Handle All API Error Types (INFO)

```tsx
// Ensure you handle these cases:
switch (result.kind) {
  case "ok":
    // success
    break
  case "timeout":
    // network timeout
    break
  case "cannot-connect":
    // no network
    break
  case "server":
    // 5xx error
    break
  case "unauthorized":
    // 401
    break
  case "forbidden":
    // 403
    break
  case "not-found":
    // 404
    break
  case "rejected":
    // other 4xx
    break
  case "bad-data":
    // invalid response
    break
}
```

---

## 7. Development Rules

### 7.1 No Reactotron in Production (ERROR)

```tsx
// BAD
console.tron.log("Debug info")

// GOOD
if (__DEV__) {
  console.tron.log("Debug info")
}
```

### 7.2 Use __DEV__ for Debug Code (WARNING)

```tsx
// BAD - debug code in production
console.log("API Response:", response)

// GOOD
if (__DEV__) {
  console.log("API Response:", response)
}
```

---

## 8. Testing Rules

### 8.1 Co-locate Tests (WARNING)

```
// BAD
app/
  components/
    Button.tsx
tests/
  components/
    Button.test.tsx

// GOOD
app/
  components/
    Button.tsx
    Button.test.tsx
```

### 8.2 Use Provider Wrappers (WARNING)

```tsx
// BAD
render(<MyComponent />)

// GOOD
const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      <NavigationContainer>
        {component}
      </NavigationContainer>
    </ThemeProvider>
  )
}

renderWithProviders(<MyComponent />)
```

---

## 9. Error Handling Rules

### 9.1 Use ErrorBoundary for Critical Sections (INFO)

**Why**: Prevents full app crashes and provides recovery options.

```tsx
// BAD - no error boundary around risky component
function DashboardScreen() {
  return (
    <Screen>
      <ThirdPartyChart data={data} />
    </Screen>
  )
}

// GOOD - wrapped in ErrorBoundary
import { ErrorBoundary } from "@/screens/ErrorScreen/ErrorBoundary"

function DashboardScreen() {
  return (
    <Screen>
      <ErrorBoundary catchErrors="always">
        <ThirdPartyChart data={data} />
      </ErrorBoundary>
    </Screen>
  )
}
```

### 9.2 Configure catchErrors Appropriately (WARNING)

**Why**: Different environments need different error handling strategies.

```tsx
// BAD - always showing error boundary in development (hides useful stack traces)
<ErrorBoundary catchErrors="always">
  <ExperimentalFeature />
</ErrorBoundary>

// GOOD - show error boundary only in production
<ErrorBoundary catchErrors="prod">
  <ExperimentalFeature />
</ErrorBoundary>

// GOOD - always catch for critical paths
<ErrorBoundary catchErrors="always">
  <PaymentFlow />
</ErrorBoundary>
```

### 9.3 Integrate Crash Reporting in Production (INFO)

**Why**: Production errors need to be tracked for debugging.

```tsx
// BAD - errors silently caught with no reporting
componentDidCatch(error: Error, errorInfo: ErrorInfo) {
  this.setState({ error, errorInfo })
}

// GOOD - report to crash monitoring service
componentDidCatch(error: Error, errorInfo: ErrorInfo) {
  this.setState({ error, errorInfo })

  if (!__DEV__) {
    Sentry.captureException(error, { extra: errorInfo })
  }
}
```

### 9.4 Handle Non-Boundary Errors (WARNING)

**Why**: Error boundaries don't catch event handlers or async errors.

```tsx
// BAD - unhandled async error
const handleSubmit = async () => {
  await api.submitForm(data)
}

// GOOD - proper error handling
const handleSubmit = async () => {
  try {
    await api.submitForm(data)
  } catch (error) {
    reportError(error as Error)
    showErrorToast("Failed to submit")
  }
}

// BAD - unhandled promise rejection
useEffect(() => {
  fetchData()
}, [])

// GOOD
useEffect(() => {
  fetchData().catch((error) => {
    reportError(error)
    setErrorState(error)
  })
}, [])
```

---

## 10. TypeScript Rules

### 10.1 Explicit Return Types for Exports (INFO)

```tsx
// BAD
export function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0)
}

// GOOD
export function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price, 0)
}
```

### 10.2 Use Type Imports (INFO)

```tsx
// BAD
import { ViewStyle } from "react-native"
import { User } from "@/models"

// GOOD (when only used as types)
import type { ViewStyle } from "react-native"
import type { User } from "@/models"
```

---

## 11. File Organization Rules

### 11.1 Component File Structure (INFO)

```tsx
// 1. Imports (in correct order)
import { useState } from "react"
import { View } from "react-native"
import { Screen, Text, Button } from "@/components"

// 2. Types
interface MyComponentProps {
  title: string
}

// 3. Component
export function MyComponent({ title }: MyComponentProps) {
  // hooks
  const [value, setValue] = useState("")
  const { themed } = useAppTheme()

  // handlers
  const handlePress = () => { ... }

  // render
  return (
    <Screen preset="scroll">
      <Text text={title} />
    </Screen>
  )
}

// 4. Styles (at bottom)
const $container: ViewStyle = { ... }
```

---

## Review Checklist

Use this checklist when reviewing code:

### Imports
- [ ] No banned imports (RN Text/Button/TextInput/SafeAreaView, default React)
- [ ] Imports in correct order
- [ ] Using path aliases for app/ imports

### Components
- [ ] Screens use Screen component wrapper
- [ ] Using Ignite components (Text, Button, TextField, etc.)
- [ ] Button accessories are memoized
- [ ] Using tx props for static text

### Styling
- [ ] No StyleSheet.create()
- [ ] Styles prefixed with $
- [ ] No hardcoded colors (use theme)
- [ ] No hardcoded spacing (use theme.spacing)
- [ ] ThemedStyle used for theme-dependent styles
- [ ] Styles colocated at file bottom

### Navigation
- [ ] Screen types registered in navigationTypes.ts
- [ ] Using typed screen props
- [ ] Auth-based conditional rendering (not imperative)

### i18n
- [ ] Translation keys use namespace:key format
- [ ] Using txOptions for dynamic values

### Development
- [ ] No console.tron without __DEV__ check
- [ ] No debug console.log in production code

### Error Handling
- [ ] Critical components wrapped in ErrorBoundary
- [ ] catchErrors configured appropriately (dev/prod/always)
- [ ] Async errors handled with try/catch or .catch()
- [ ] Crash reporting integrated for production

### Testing
- [ ] Tests co-located with source
- [ ] Provider wrappers used in tests

### TypeScript
- [ ] Exported functions have explicit return types
- [ ] Using type imports where appropriate
