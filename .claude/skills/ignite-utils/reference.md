# Ignite Utils Reference

Complete documentation for Ignite boilerplate utility hooks and functions.

---

## useSafeAreaInsetsStyle

**Purpose**: Generate safe-area-aware style objects for Views, handling notches, home indicators, and curved corners on modern devices.

**Location**: `app/utils/useSafeAreaInsetsStyle.ts`

### Signature

```tsx
function useSafeAreaInsetsStyle<
  Property extends "padding" | "margin" = "padding",
  Edges extends Array<ExtendedEdge> = [],
>(
  safeAreaEdges: Edges,
  property?: Property,
): SafeAreaInsetsStyle<Property, Edges>
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `safeAreaEdges` | `ExtendedEdge[]` | `[]` | Edges to apply safe area insets to |
| `property` | `"padding"` \| `"margin"` | `"padding"` | CSS property prefix for returned style |

### ExtendedEdge Values

| Edge | Description |
|------|-------------|
| `top` | Top edge (status bar, notch area) |
| `bottom` | Bottom edge (home indicator area) |
| `left` | Left edge |
| `right` | Right edge |
| `start` | RTL-aware, maps to `left` |
| `end` | RTL-aware, maps to `right` |

### Return Value

Returns a style object with property names based on the `property` parameter:
- `paddingTop`, `paddingBottom`, `paddingStart`, `paddingEnd` (for padding)
- `marginTop`, `marginBottom`, `marginStart`, `marginEnd` (for margin)

### Examples

```tsx
// Basic: top padding for notch
const $topInset = useSafeAreaInsetsStyle(["top"])
// Result: { paddingTop: 47 } (on iPhone with notch)

// Bottom margin for home indicator
const $bottomInset = useSafeAreaInsetsStyle(["bottom"], "margin")
// Result: { marginBottom: 34 }

// Multiple edges
const $containerInsets = useSafeAreaInsetsStyle(["top", "bottom"])
// Result: { paddingTop: 47, paddingBottom: 34 }

// RTL-aware horizontal insets
const $horizontalInsets = useSafeAreaInsetsStyle(["start", "end"], "padding")
// Result: { paddingStart: 0, paddingEnd: 0 }
```

### Full Screen Example

```tsx
import { View } from "react-native"
import { useSafeAreaInsetsStyle } from "@/utils/useSafeAreaInsetsStyle"

function FullScreenContent() {
  const $insets = useSafeAreaInsetsStyle(["top", "bottom"], "padding")

  return (
    <View style={[$container, $insets]}>
      {/* Content safely avoids notch and home indicator */}
    </View>
  )
}

const $container = {
  flex: 1,
  backgroundColor: "#fff",
}
```

### When to Use

- When you need manual control over safe area handling (not using `Screen` component)
- For custom layouts that need specific edge handling
- When combining safe area insets with other styles

### Best Practices

1. Prefer RTL-aware edges (`start`, `end`) for horizontal insets
2. Use the `Screen` component when possible (it handles safe areas automatically)
3. Apply insets to the outermost container for consistent behavior

---

## useHeader

**Purpose**: Dynamically configure navigation headers from within screen components, providing a co-located approach to header management.

**Location**: `app/utils/useHeader.tsx`

### Signature

```tsx
function useHeader(
  headerProps: HeaderProps,
  deps?: DependencyList,
): void
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `headerProps` | `HeaderProps` | - | Props passed to the `Header` component |
| `deps` | `DependencyList` | `[]` | Dependencies that trigger header updates |

### HeaderProps Reference

#### Title Properties

| Prop | Type | Description |
|------|------|-------------|
| `title` | `string` | Direct title text |
| `titleTx` | `TxKeyPath` | i18n translation key for title |
| `titleTxOptions` | `object` | Interpolation values for i18n |
| `titleMode` | `"center"` \| `"flex"` | Title alignment mode |
| `titleStyle` | `StyleProp<TextStyle>` | Custom title text style |
| `titleContainerStyle` | `StyleProp<ViewStyle>` | Custom title container style |

#### Left Action Properties

| Prop | Type | Description |
|------|------|-------------|
| `leftIcon` | `IconTypes` | Icon to display (e.g., `"back"`, `"menu"`) |
| `leftIconColor` | `string` | Tint color for left icon |
| `leftText` | `string` | Text for left button |
| `leftTx` | `TxKeyPath` | i18n key for left text |
| `leftTxOptions` | `object` | Interpolation values for left text |
| `LeftActionComponent` | `ReactElement` | Custom left component |
| `onLeftPress` | `() => void` | Left action press handler |

#### Right Action Properties

| Prop | Type | Description |
|------|------|-------------|
| `rightIcon` | `IconTypes` | Icon to display on right |
| `rightIconColor` | `string` | Tint color for right icon |
| `rightText` | `string` | Text for right button |
| `rightTx` | `TxKeyPath` | i18n key for right text |
| `rightTxOptions` | `object` | Interpolation values for right text |
| `RightActionComponent` | `ReactElement` | Custom right component |
| `onRightPress` | `() => void` | Right action press handler |

#### Style Properties

| Prop | Type | Description |
|------|------|-------------|
| `backgroundColor` | `string` | Header background color |
| `style` | `StyleProp<ViewStyle>` | Inner header wrapper style |
| `containerStyle` | `StyleProp<ViewStyle>` | Outer header container style |
| `safeAreaEdges` | `ExtendedEdge[]` | Safe area edges (default: `["top"]`) |

### Examples

#### Basic Header with Back Button

```tsx
import { useNavigation } from "@react-navigation/native"
import { useHeader } from "@/utils/useHeader"

function DetailsScreen() {
  const navigation = useNavigation()

  useHeader({
    titleTx: "details:title",
    leftIcon: "back",
    onLeftPress: () => navigation.goBack(),
  })

  return <Screen>{/* content */}</Screen>
}
```

#### Header with Right Action

```tsx
function SettingsScreen() {
  const handleSave = () => { /* save logic */ }

  useHeader({
    titleTx: "settings:title",
    leftIcon: "back",
    onLeftPress: goBack,
    rightTx: "common:save",
    onRightPress: handleSave,
  })

  return <Screen>{/* content */}</Screen>
}
```

#### Dynamic Header with Dependencies

```tsx
function CartScreen() {
  const [itemCount, setItemCount] = useState(0)

  useHeader(
    {
      title: `Cart (${itemCount})`,
      leftIcon: "back",
      onLeftPress: goBack,
    },
    [itemCount], // Header updates when itemCount changes
  )

  return <Screen>{/* content */}</Screen>
}
```

#### Header with Logout (from WelcomeScreen)

```tsx
function WelcomeScreen() {
  const { logout } = useAuth()

  useHeader(
    {
      rightTx: "common:logOut",
      onRightPress: logout,
    },
    [logout],
  )

  return (
    <Screen preset="fixed" contentContainerStyle={$styles.flex1}>
      {/* Welcome content */}
    </Screen>
  )
}
```

#### Custom Header Components

```tsx
function ProfileScreen() {
  useHeader({
    title: "Profile",
    RightActionComponent: (
      <TouchableOpacity onPress={openSettings}>
        <Icon icon="settings" />
      </TouchableOpacity>
    ),
  })

  return <Screen>{/* content */}</Screen>
}
```

### How It Works

1. Uses `useLayoutEffect` on mobile (prevents header "jump") and `useEffect` on web (prevents render loop)
2. Calls `navigation.setOptions()` to configure the screen header
3. Renders Ignite's `Header` component with the provided props
4. Re-runs when dependencies in `deps` array change

### Platform Behavior

| Platform | Effect Hook | Reason |
|----------|-------------|--------|
| iOS/Android | `useLayoutEffect` | Applies before render to prevent visible header changes |
| Web | `useEffect` | Avoids rendering loop issues |

### Best Practices

1. **Always include function dependencies** - If `onRightPress` or similar handlers reference external values, include them in `deps`
2. **Use i18n props** - Prefer `titleTx`, `leftTx`, `rightTx` over direct text for localization
3. **Keep headers simple** - Complex interactions should use custom `LeftActionComponent` or `RightActionComponent`

### When to Use

- When header content depends on screen state
- When you want co-located header configuration with screen logic
- When headers need to update dynamically based on data

### Alternative: Navigation Options

For static headers, you can still use navigator-level options:

```tsx
// In navigator
<Stack.Screen
  name="Profile"
  component={ProfileScreen}
  options={{ title: "Profile" }}
/>
```

Use `useHeader` when you need dynamic control from within the screen component.

---

## Storage Utilities

**Purpose**: MMKV-based persistent storage for app data.

**Location**: `app/utils/storage/`

### Functions

| Function | Signature | Description |
|----------|-----------|-------------|
| `load` | `<T>(key: string) => T \| null` | Load and parse JSON data |
| `save` | `<T>(key: string, value: T) => void` | Save data as JSON |
| `loadString` | `(key: string) => string \| null` | Load raw string |
| `saveString` | `(key: string, value: string) => void` | Save raw string |
| `remove` | `(key: string) => void` | Remove a key |
| `clear` | `() => void` | Clear all storage |

### Examples

```tsx
import { load, save, remove } from "@/utils/storage"

// Save user preferences
save("preferences", { theme: "dark", notifications: true })

// Load user preferences
const prefs = load<{ theme: string; notifications: boolean }>("preferences")

// Remove specific key
remove("preferences")
```

### Use Cases

- Persisting authentication tokens
- Saving user preferences
- Caching API responses
- Storing app state between sessions
