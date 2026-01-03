# Ignite Screens Reference

Complete documentation for creating screens in Ignite React Native apps.

---

## File Structure and Organization

### Location
Screens are located in `app/screens/` following a flat structure.

### Naming Convention
- Files follow `*Screen.tsx` pattern (e.g., `LoginScreen.tsx`, `WelcomeScreen.tsx`)
- Complex screens can use folders: `app/screens/MyScreen/MyScreen.tsx`

### Component Co-location Pattern

```
app/screens/
  LoginScreen.tsx                 # Simple screen
  OrderScreen/
    OrderScreen.tsx               # Main screen
    OrderItem.tsx                 # Screen-specific component
    OrderSummary.tsx              # Screen-specific component
  ProfileScreen.tsx
```

**Rule:** Screen-specific components go with their screens. Reusable components go in `app/components/`.

---

## Screen Component

The `Screen` component (`app/components/Screen.tsx`) wraps all screens handling scrolling, safe areas, and keyboard behavior.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `preset` | `"fixed"` \| `"scroll"` \| `"auto"` | - | Scroll behavior |
| `safeAreaEdges` | `Array<"top" \| "bottom" \| "left" \| "right">` | - | Safe area edges |
| `backgroundColor` | `string` | `colors.background` | Background color |
| `systemBarStyle` | `"light"` \| `"dark"` | `"dark"` | Status bar style |
| `keyboardOffset` | `number` | `0` | Keyboard offset |
| `keyboardBottomOffset` | `number` | `50` | Scroll offset when keyboard shows |
| `keyboardShouldPersistTaps` | `"handled"` \| `"always"` \| `"never"` | `"handled"` | Keyboard tap behavior |
| `style` | `StyleProp<ViewStyle>` | - | Outer container style |
| `contentContainerStyle` | `StyleProp<ViewStyle>` | - | Inner content style |

### Presets

| Preset | Description | Use Case |
|--------|-------------|----------|
| `"fixed"` | No scrolling | Screens with FlatList, SectionList, or custom scroll |
| `"scroll"` | Always scrollable | Forms, content needing keyboard avoidance |
| `"auto"` | Conditional scrolling | General screens, scrolls only if content exceeds viewport |

---

## Navigation Props Types

### Stack Screen Props

```typescript
// In navigationTypes.ts
export type AppStackParamList = {
  Welcome: undefined
  Login: undefined
  Profile: { userId: string }
  OrderDetails: { orderId: string; showActions?: boolean }
}

export type AppStackScreenProps<T extends keyof AppStackParamList> =
  NativeStackScreenProps<AppStackParamList, T>
```

### Tab Screen Props (Composite)

```typescript
export type DemoTabParamList = {
  DemoCommunity: undefined
  DemoShowroom: { queryIndex?: string; itemIndex?: string }
}

export type DemoTabScreenProps<T extends keyof DemoTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<DemoTabParamList, T>,
  AppStackScreenProps<keyof AppStackParamList>
>
```

### Using Props in Screens

```typescript
// Stack screen
interface ProfileScreenProps extends AppStackScreenProps<"Profile"> {}

export const ProfileScreen: FC<ProfileScreenProps> = ({ route, navigation }) => {
  const { userId } = route.params  // Typed as string
  navigation.navigate("OrderDetails", { orderId: "123" })  // Fully typed
}

// Tab screen
interface DemoShowroomScreenProps extends DemoTabScreenProps<"DemoShowroom"> {}

export const DemoShowroomScreen: FC<DemoShowroomScreenProps> = ({ route, navigation }) => {
  // Can access both tab and stack navigation
}
```

---

## Theming and Styling

### useAppTheme Hook

```typescript
import { useAppTheme } from "@/theme"
import type { ThemedStyle } from "@/theme"

const MyScreen: FC<Props> = () => {
  const {
    themed,                      // Function to apply theme to styles
    theme,                       // Direct theme object access
    themeContext,               // "light" | "dark"
    setThemeContextOverride,    // Manually set theme
  } = useAppTheme()

  const { colors, spacing } = theme

  return (
    <View style={themed($container)}>
      <Text style={{ color: colors.text }}>Hello</Text>
    </View>
  )
}
```

### ThemedStyle Pattern

```typescript
import { ViewStyle, TextStyle, ImageStyle } from "react-native"
import type { ThemedStyle } from "@/theme"

// Theme-responsive style
const $container: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flex: 1,
  backgroundColor: colors.background,
  padding: spacing.lg,
})

const $heading: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.text,
  marginBottom: spacing.md,
})

// Static style (no theme dependency)
const $image: ImageStyle = {
  width: 200,
  height: 150,
  resizeMode: "contain",
}
```

### Combining Styles

```typescript
// Multiple themed styles
<View style={themed([$container, $extraPadding])} />

// Conditional styles
<Button style={themed([$button, isActive && $activeButton])} />

// Mixing static and themed
<View style={[themed($container), $staticStyles]} />
```

### Style Naming Convention

Use `$` prefix for all style variables:
- `$container`, `$heading`, `$textField`, `$button`

---

## Utility Hooks

### useHeader

Configure native header from within screen:

```typescript
import { useHeader } from "@/utils/useHeader"

const MyScreen: FC<Props> = ({ navigation }) => {
  const { logout } = useAuth()

  useHeader(
    {
      title: "My Screen",           // or titleTx for i18n
      leftIcon: "back",
      onLeftPress: navigation.goBack,
      rightTx: "common:logOut",
      onRightPress: logout,
    },
    [logout],  // Dependencies
  )

  return <Screen preset="scroll">...</Screen>
}
```

### useSafeAreaInsetsStyle

Get safe area insets as style object:

```typescript
import { useSafeAreaInsetsStyle } from "@/utils/useSafeAreaInsetsStyle"

const MyScreen: FC<Props> = () => {
  // Returns { paddingBottom: <value> }
  const $bottomInsets = useSafeAreaInsetsStyle(["bottom"])

  // With margin instead of padding
  const $topMargin = useSafeAreaInsetsStyle(["top"], "margin")

  return (
    <Screen preset="fixed">
      <View style={$content}>...</View>
      <View style={[$footer, $bottomInsets]}>...</View>
    </Screen>
  )
}
```

---

## Common Screen Patterns

### Form Screen

```typescript
import { FC, useRef, useState } from "react"
import { TextInput, ViewStyle } from "react-native"
import { Screen, Text, TextField, Button } from "@/components"
import { AppStackScreenProps } from "@/navigators/navigationTypes"
import { useAppTheme } from "@/theme"
import type { ThemedStyle } from "@/theme"

interface LoginScreenProps extends AppStackScreenProps<"Login"> {}

export const LoginScreen: FC<LoginScreenProps> = function LoginScreen({ navigation }) {
  const passwordInput = useRef<TextInput>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  const { themed } = useAppTheme()

  function handleSubmit() {
    setIsSubmitted(true)
    // Validate and submit
  }

  return (
    <Screen
      preset="auto"
      contentContainerStyle={themed($container)}
      safeAreaEdges={["top", "bottom"]}
      keyboardShouldPersistTaps="handled"
    >
      <Text tx="loginScreen:title" preset="heading" style={themed($heading)} />

      <TextField
        value={email}
        onChangeText={setEmail}
        containerStyle={themed($textField)}
        labelTx="loginScreen:emailLabel"
        placeholderTx="loginScreen:emailPlaceholder"
        status={errors.email ? "error" : undefined}
        helper={errors.email}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        returnKeyType="next"
        onSubmitEditing={() => passwordInput.current?.focus()}
      />

      <TextField
        ref={passwordInput}
        value={password}
        onChangeText={setPassword}
        containerStyle={themed($textField)}
        labelTx="loginScreen:passwordLabel"
        secureTextEntry
        status={errors.password ? "error" : undefined}
        helper={errors.password}
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
      />

      <Button
        tx="loginScreen:submit"
        preset="filled"
        style={themed($button)}
        onPress={handleSubmit}
      />
    </Screen>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingVertical: spacing.xxl,
  paddingHorizontal: spacing.lg,
})

const $heading: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.xl,
})

const $textField: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.lg,
})

const $button: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.md,
})
```

### List Screen

```typescript
import { FC, useState, useCallback } from "react"
import { FlatList, ViewStyle, ActivityIndicator } from "react-native"
import { Screen, Text, EmptyState, Header } from "@/components"
import { AppStackScreenProps } from "@/navigators/navigationTypes"
import { useAppTheme } from "@/theme"
import type { ThemedStyle } from "@/theme"
import { $styles } from "@/theme"

interface OrdersScreenProps extends AppStackScreenProps<"Orders"> {}

export const OrdersScreen: FC<OrdersScreenProps> = function OrdersScreen({ navigation }) {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const { themed } = useAppTheme()

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    // Fetch data
    setRefreshing(false)
  }, [])

  const renderItem = useCallback(({ item }: { item: Order }) => (
    <OrderCard
      order={item}
      onPress={() => navigation.navigate("OrderDetails", { orderId: item.id })}
    />
  ), [navigation])

  return (
    <Screen preset="fixed" safeAreaEdges={["top"]} contentContainerStyle={$styles.flex1}>
      <Header titleTx="orders:title" leftIcon="back" onLeftPress={navigation.goBack} />

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={themed($listContent)}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator style={themed($loading)} />
          ) : (
            <EmptyState
              preset="generic"
              headingTx="orders:empty"
              contentTx="orders:emptyDescription"
              buttonTx="orders:browse"
              buttonOnPress={() => navigation.navigate("Menu")}
            />
          )
        }
      />
    </Screen>
  )
}

const $listContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingBottom: spacing.xl,
})

const $loading: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.xxl,
})
```

### Detail Screen

```typescript
import { FC } from "react"
import { View, ViewStyle, Image, ImageStyle } from "react-native"
import { Screen, Text, Header, Button, Card } from "@/components"
import { AppStackScreenProps } from "@/navigators/navigationTypes"
import { useAppTheme } from "@/theme"
import { useSafeAreaInsetsStyle } from "@/utils/useSafeAreaInsetsStyle"
import type { ThemedStyle } from "@/theme"

interface ProductDetailsScreenProps extends AppStackScreenProps<"ProductDetails"> {}

export const ProductDetailsScreen: FC<ProductDetailsScreenProps> = function ProductDetailsScreen({
  route,
  navigation,
}) {
  const { productId } = route.params
  const { themed, theme: { colors } } = useAppTheme()
  const $bottomInsets = useSafeAreaInsetsStyle(["bottom"])

  // Fetch product data using productId

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]}>
      <Header leftIcon="back" onLeftPress={navigation.goBack} />

      <Image source={{ uri: product.imageUrl }} style={$image} />

      <View style={themed($content)}>
        <Text text={product.name} preset="heading" />
        <Text text={product.description} style={themed($description)} />

        <Card
          headingTx="product:ingredients"
          content={product.ingredients.join(", ")}
          style={themed($card)}
        />
      </View>

      <View style={[themed($footer), $bottomInsets]}>
        <Text text={`$${product.price.toFixed(2)}`} preset="subheading" />
        <Button
          tx="product:addToCart"
          preset="filled"
          onPress={handleAddToCart}
        />
      </View>
    </Screen>
  )
}

const $image: ImageStyle = {
  width: "100%",
  height: 250,
  resizeMode: "cover",
}

const $content: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.lg,
})

const $description: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.sm,
})

const $card: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.lg,
})

const $footer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  padding: spacing.lg,
  borderTopWidth: 1,
  borderTopColor: colors.border,
  backgroundColor: colors.background,
})
```

### Welcome/Landing Screen

```typescript
import { FC } from "react"
import { View, ViewStyle, Image, ImageStyle } from "react-native"
import { Screen, Text, Button } from "@/components"
import { AppStackScreenProps } from "@/navigators/navigationTypes"
import { useAppTheme } from "@/theme"
import { useHeader } from "@/utils/useHeader"
import { useSafeAreaInsetsStyle } from "@/utils/useSafeAreaInsetsStyle"
import { useAuth } from "@/context/AuthContext"
import type { ThemedStyle } from "@/theme"
import { $styles } from "@/theme"

const logo = require("@assets/images/logo.png")

interface WelcomeScreenProps extends AppStackScreenProps<"Welcome"> {}

export const WelcomeScreen: FC<WelcomeScreenProps> = function WelcomeScreen({ navigation }) {
  const { themed } = useAppTheme()
  const { logout } = useAuth()
  const $bottomInsets = useSafeAreaInsetsStyle(["bottom"])

  useHeader({ rightTx: "common:logOut", onRightPress: logout }, [logout])

  return (
    <Screen preset="fixed" contentContainerStyle={$styles.flex1}>
      <View style={themed($topContainer)}>
        <Image source={logo} style={$logo} resizeMode="contain" />
        <Text tx="welcomeScreen:title" preset="heading" style={themed($heading)} />
        <Text tx="welcomeScreen:subtitle" style={themed($subtitle)} />
      </View>

      <View style={[themed($bottomContainer), $bottomInsets]}>
        <Button
          tx="welcomeScreen:getStarted"
          preset="filled"
          onPress={() => navigation.navigate("Menu")}
        />
      </View>
    </Screen>
  )
}

const $topContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  paddingHorizontal: spacing.lg,
})

const $logo: ImageStyle = {
  width: 150,
  height: 150,
}

const $heading: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.xl,
  textAlign: "center",
})

const $subtitle: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.sm,
  textAlign: "center",
})

const $bottomContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.lg,
})
```

---

## Best Practices

1. **Screen Organization**
   - Keep screen-specific components co-located with screens
   - Use flat structure unless screen has multiple sub-components
   - Follow `*Screen.tsx` naming convention

2. **Type Safety**
   - Always extend `AppStackScreenProps<"ScreenName">`
   - Use `FC<Props>` for screen components
   - Destructure `route` and `navigation` from props

3. **Theming**
   - Define styles outside components using `ThemedStyle<T>`
   - Use `$` prefix for style variable names
   - Access theme via `useAppTheme()` hook
   - Use `themed()` function to apply styles

4. **Screen Component**
   - Always use `Screen` as root wrapper
   - Choose appropriate preset for content type
   - Use `safeAreaEdges` for device notches
   - Apply `contentContainerStyle` for inner padding

5. **Performance**
   - Define styles outside components
   - Use `useCallback` for list renderItem functions
   - Use `useMemo` for expensive computations
   - Use `useRef` for form input refs

6. **Accessibility & i18n**
   - Use `tx` props for translations
   - Include `testID` for testing
   - Use semantic components (`Text`, `Button`)

7. **Imports**
   - Use path aliases: `@/components`, `@/theme`, `@/navigators`
   - Follow import order: react, react-native, expo, @/ aliases, relative
   - Use named imports from 'react'
