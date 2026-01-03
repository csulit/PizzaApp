# Ignite Navigation Reference

Complete documentation for Ignite's navigation system using React Navigation v7.

---

## File Structure

| File | Location | Purpose |
|------|----------|---------|
| `AppNavigator.tsx` | `app/navigators/` | Main stack navigator, root configuration |
| `navigationTypes.ts` | `app/navigators/` | TypeScript type definitions |
| `navigationUtilities.ts` | `app/navigators/` | Helper functions and hooks |

---

## AppNavigator Structure

### Root Component

```typescript
export const AppNavigator = (props: NavigationProps) => {
  const { navigationTheme } = useAppTheme()

  useBackButtonHandler((routeName) => exitRoutes.includes(routeName))

  return (
    <NavigationContainer ref={navigationRef} theme={navigationTheme} {...props}>
      <AnalyticsProvider>
        <ErrorBoundary catchErrors={Config.catchErrors}>
          <AppStack />
        </ErrorBoundary>
      </AnalyticsProvider>
    </NavigationContainer>
  )
}
```

### AppStack with Authentication

```typescript
const Stack = createNativeStackNavigator<AppStackParamList>()

const AppStack = () => {
  const { isAuthenticated } = useAuth()
  const { theme: { colors } } = useAppTheme()

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        navigationBarColor: colors.background,
        contentStyle: { backgroundColor: colors.background },
      }}
      initialRouteName={isAuthenticated ? "Welcome" : "Login"}
    >
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          {/* Add authenticated screens here */}
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
        </>
      )}

      {/* Shared screens (available regardless of auth state) */}
      {/* IGNITE_GENERATOR_ANCHOR_APP_STACK_SCREENS */}
    </Stack.Navigator>
  )
}
```

---

## Type Definitions

### ParamList Types

```typescript
// navigationTypes.ts

// Tab navigator params (if using tabs)
export type DemoTabParamList = {
  DemoCommunity: undefined
  DemoShowroom: { queryIndex?: string; itemIndex?: string }
  DemoDebug: undefined
  DemoPodcastList: undefined
}

// Main stack params
export type AppStackParamList = {
  Welcome: undefined                                    // No params
  Login: undefined                                      // No params
  Demo: NavigatorScreenParams<DemoTabParamList>        // Nested navigator
  Profile: { userId: string }                          // Required params
  Settings: { section?: string }                       // Optional params
  // IGNITE_GENERATOR_ANCHOR_APP_STACK_PARAM_LIST
}
```

### Screen Props Types

```typescript
// For stack screens
export type AppStackScreenProps<T extends keyof AppStackParamList> =
  NativeStackScreenProps<AppStackParamList, T>

// For tab screens (composite with parent stack)
export type DemoTabScreenProps<T extends keyof DemoTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<DemoTabParamList, T>,
    AppStackScreenProps<keyof AppStackParamList>
  >

// Navigation container props
export interface NavigationProps extends Partial<
  ComponentProps<typeof NavigationContainer<AppStackParamList>>
> {}
```

### Using Typed Props in Screens

```typescript
import { FC } from "react"
import { AppStackScreenProps } from "@/navigators/navigationTypes"

interface ProfileScreenProps extends AppStackScreenProps<"Profile"> {}

export const ProfileScreen: FC<ProfileScreenProps> = ({ route, navigation }) => {
  const { userId } = route.params  // Fully typed as string

  // navigation.navigate is fully typed
  navigation.navigate("Settings", { section: "privacy" })
}
```

---

## Navigation Utilities

### navigationRef

Reference to the root navigation container for navigating outside React components:

```typescript
import { createNavigationContainerRef } from "@react-navigation/native"

export const navigationRef = createNavigationContainerRef<AppStackParamList>()
```

### navigate(name, params?)

Navigate to a screen from outside React components:

```typescript
export function navigate(name: unknown, params?: unknown) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name as never, params as never)
  }
}

// Usage
import { navigate } from "@/navigators/navigationUtilities"
navigate("Profile", { userId: "123" })
```

### goBack()

Go back in the navigation stack:

```typescript
export function goBack() {
  if (navigationRef.isReady() && navigationRef.canGoBack()) {
    navigationRef.goBack()
  }
}
```

### resetRoot(state?)

Reset the entire navigation state (e.g., after logout):

```typescript
export function resetRoot(
  state: Parameters<typeof navigationRef.resetRoot>[0] = { index: 0, routes: [] },
) {
  if (navigationRef.isReady()) {
    navigationRef.resetRoot(state)
  }
}

// Usage: Reset to login after logout
resetRoot({
  index: 0,
  routes: [{ name: "Login" }],
})
```

### getActiveRouteName(state)

Get the current screen name (handles nested navigators):

```typescript
export function getActiveRouteName(
  state: NavigationState | PartialState<NavigationState>
): string {
  const route = state.routes[state.index ?? 0]
  if (!route.state) return route.name as keyof AppStackParamList
  return getActiveRouteName(route.state as NavigationState<AppStackParamList>)
}
```

---

## Hooks

### useBackButtonHandler(canExit)

Handle Android hardware back button:

```typescript
export function useBackButtonHandler(canExit: (routeName: string) => boolean)

// Usage in AppNavigator
const exitRoutes = Config.exitRoutes // ["Welcome"]
useBackButtonHandler((routeName) => exitRoutes.includes(routeName))
```

**Behavior:**
- iOS: Does nothing (iOS handles back navigation differently)
- Android exit routes: Exits the app
- Android other routes: Navigates back or does nothing

### useNavigationPersistence(storage, persistenceKey)

Persist and restore navigation state across app restarts:

```typescript
export function useNavigationPersistence(storage: Storage, persistenceKey: string) {
  return {
    onNavigationStateChange,  // Callback for state changes
    restoreState,             // Function to restore saved state
    isRestored,               // Boolean indicating restoration complete
    initialNavigationState    // The restored state
  }
}

// Usage
const {
  initialNavigationState,
  onNavigationStateChange,
  isRestored
} = useNavigationPersistence(storage, "NAVIGATION_STATE")

if (!isRestored) return <LoadingIndicator />

return (
  <NavigationContainer
    initialState={initialNavigationState}
    onStateChange={onNavigationStateChange}
  >
    {/* ... */}
  </NavigationContainer>
)
```

---

## Tab Navigator Pattern

Example bottom tab navigation:

```typescript
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"

const Tab = createBottomTabNavigator<DemoTabParamList>()

export function DemoNavigator() {
  const { bottom } = useSafeAreaInsets()
  const { themed, theme: { colors } } = useAppTheme()

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: themed([$tabBar, { height: bottom + 70 }]),
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.text,
        tabBarLabelStyle: themed($tabBarLabel),
        tabBarItemStyle: themed($tabBarItem),
      }}
    >
      <Tab.Screen
        name="DemoShowroom"
        component={DemoShowroomScreen}
        options={{
          tabBarLabel: translate("demoNavigator:componentsTab"),
          tabBarIcon: ({ focused }) => (
            <Icon
              icon="components"
              color={focused ? colors.tint : colors.tintInactive}
              size={30}
            />
          ),
        }}
      />
      {/* More tabs... */}
    </Tab.Navigator>
  )
}
```

---

## Configuration Options

In `config/config.base.ts`:

```typescript
export interface ConfigBaseProps {
  persistNavigation: "always" | "dev" | "prod" | "never"
  catchErrors: "always" | "dev" | "prod" | "never"
  exitRoutes: string[]
}

const BaseConfig: ConfigBaseProps = {
  persistNavigation: "dev",      // When to persist navigation state
  catchErrors: "always",         // Error boundary behavior
  exitRoutes: ["Welcome"],       // Screens that exit app on back press (Android)
}
```

---

## Complete Example: Adding a New Screen

### 1. Define Route Type

```typescript
// navigationTypes.ts
export type AppStackParamList = {
  Welcome: undefined
  Login: undefined
  OrderDetails: { orderId: string; showActions?: boolean }  // New screen
  // IGNITE_GENERATOR_ANCHOR_APP_STACK_PARAM_LIST
}
```

### 2. Register the Screen

```typescript
// AppNavigator.tsx
import { OrderDetailsScreen } from "@/screens/OrderDetailsScreen"

const AppStack = () => {
  const { isAuthenticated } = useAuth()

  return (
    <Stack.Navigator initialRouteName={isAuthenticated ? "Welcome" : "Login"}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
      {/* IGNITE_GENERATOR_ANCHOR_APP_STACK_SCREENS */}
    </Stack.Navigator>
  )
}
```

### 3. Create the Screen

```typescript
// screens/OrderDetailsScreen.tsx
import { FC } from "react"
import { observer } from "mobx-react-lite"
import { Screen, Text, Header, Button } from "@/components"
import { AppStackScreenProps } from "@/navigators/navigationTypes"
import { useAppTheme } from "@/theme"

interface OrderDetailsScreenProps extends AppStackScreenProps<"OrderDetails"> {}

export const OrderDetailsScreen: FC<OrderDetailsScreenProps> = observer(
  function OrderDetailsScreen({ route, navigation }) {
    const { orderId, showActions = true } = route.params
    const { themed } = useAppTheme()

    return (
      <Screen preset="scroll" safeAreaEdges={["top"]}>
        <Header
          titleTx="orderDetails:title"
          leftIcon="back"
          onLeftPress={navigation.goBack}
        />
        <Text text={`Order ID: ${orderId}`} />
        {showActions && (
          <Button
            tx="orderDetails:reorder"
            onPress={() => navigation.navigate("Welcome")}
          />
        )}
      </Screen>
    )
  }
)
```

### 4. Navigate to the Screen

```typescript
// From another screen
navigation.navigate("OrderDetails", { orderId: "12345", showActions: true })

// From outside components
import { navigate } from "@/navigators/navigationUtilities"
navigate("OrderDetails", { orderId: "12345" })
```

---

## Best Practices

1. **Define types first** - Always add to `AppStackParamList` before registering screens

2. **Use conditional rendering for auth** - Don't use imperative navigation for auth flows

3. **Prefer `useNavigation` hook** - Only use `navigationRef` outside React components

4. **Use generator anchors** - Add screens at `IGNITE_GENERATOR_ANCHOR_*` comments for CLI compatibility

5. **Theme integration** - Use themed colors for navigation styling

6. **Type your props** - Use `AppStackScreenProps<"ScreenName">` for full type safety

7. **Configure exit routes** - Define which screens exit the app in `config.base.ts`

8. **Use translations** - Use `translate()` for tab bar labels and accessibility

9. **Safe areas** - Use `useSafeAreaInsets()` for tab bars and headers

10. **Nested navigators** - Use `NavigatorScreenParams<NestedParamList>` for type safety
