# Ignite Components Reference

Complete documentation for all Ignite boilerplate components.

---

## Screen

**Purpose**: Top-level wrapper for all screens handling scrolling, safe areas, and keyboard behavior.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `preset` | `"scroll"` \| `"fixed"` \| `"auto"` | - | Controls scroll behavior |
| `safeAreaEdges` | `Array<"top" \| "bottom" \| "left" \| "right">` | `undefined` | Safe area edges to respect |
| `backgroundColor` | `string` | `colors.background` | Background color |
| `systemBarStyle` | `"light"` \| `"dark"` | `"dark"` | Status bar style |
| `keyboardOffset` | `number` | `0` | Keyboard offset |
| `keyboardShouldPersistTaps` | `"handled"` \| `"always"` \| `"never"` | `"handled"` | Keyboard tap behavior |
| `style` | `StyleProp<ViewStyle>` | - | Outer view styling |
| `contentContainerStyle` | `StyleProp<ViewStyle>` | - | Inner content styling |

### Presets

- **`scroll`**: Enables scrolling - ideal for forms
- **`fixed`**: Disables scrolling - use with FlatList/SectionList
- **`auto`**: Conditional scrolling based on content size

### Example

```tsx
<Screen
  preset="scroll"
  safeAreaEdges={["top", "bottom"]}
  keyboardOffset={16}
>
  {/* Screen content */}
</Screen>
```

---

## Text

**Purpose**: Enhanced text component with i18n support and presets. **ALWAYS use instead of RN Text.**

### Props

| Prop | Type | Description |
|------|------|-------------|
| `text` | `string` | Direct text content |
| `tx` | `TxKeyPath` | i18n translation key (preferred) |
| `txOptions` | `object` | Interpolation values for i18n |
| `preset` | `Presets` | Named style configuration |
| `weight` | `TextStyle["fontWeight"]` | Font weight |
| `size` | `Sizes` | Font size preset |
| `style` | `StyleProp<TextStyle>` | Custom styling |

### Presets

- `default` - Standard body text
- `bold` - Bold text
- `heading` - Large heading
- `subheading` - Smaller heading
- `formLabel` - Form field labels
- `formHelper` - Form helper text

### Examples

```tsx
// With translation
<Text tx="welcomeScreen:title" />

// With interpolation
<Text tx="profile:greeting" txOptions={{ name: "John" }} />

// With preset
<Text preset="heading" tx="screen:title" />

// Direct text (use sparingly)
<Text text="Hello World" />
```

---

## Button

**Purpose**: Interactive button with presets, accessories, and press states.

### Props

| Prop | Type | Description |
|------|------|-------------|
| `text` | `string` | Button text |
| `tx` | `TxKeyPath` | i18n key for text |
| `preset` | `"default"` \| `"filled"` \| `"reversed"` | Visual preset |
| `disabled` | `boolean` | Disable interaction |
| `LeftAccessory` | `ComponentType` | Left component |
| `RightAccessory` | `ComponentType` | Right component |
| `style` | `StyleProp<ViewStyle>` | Container style |
| `textStyle` | `StyleProp<TextStyle>` | Text style |
| `pressedStyle` | `StyleProp<ViewStyle>` | Style when pressed |
| `disabledStyle` | `StyleProp<ViewStyle>` | Style when disabled |

### Examples

```tsx
// Basic button
<Button tx="common:submit" onPress={handleSubmit} />

// Filled preset
<Button tx="common:save" preset="filled" onPress={handleSave} />

// With accessory (MEMOIZE!)
const RightIcon = useMemo(() =>
  (props) => <Icon icon="check" color={props.pressableState.pressed ? "gray" : "black"} />,
  []
)
<Button tx="common:confirm" RightAccessory={RightIcon} />
```

---

## TextField

**Purpose**: Form input with label, helper text, and validation states.

### Props

| Prop | Type | Description |
|------|------|-------------|
| `label` / `labelTx` | `string` / `TxKeyPath` | Field label |
| `placeholder` / `placeholderTx` | `string` / `TxKeyPath` | Placeholder text |
| `helper` / `helperTx` | `string` / `TxKeyPath` | Helper text below input |
| `status` | `"error"` \| `"disabled"` \| `null` | Field status |
| `style` | `StyleProp<ViewStyle>` | Input styling |
| `containerStyle` | `StyleProp<ViewStyle>` | Outer container |
| `inputWrapperStyle` | `StyleProp<ViewStyle>` | Input wrapper |
| `LeftAccessory` | `ComponentType` | Left accessory |
| `RightAccessory` | `ComponentType` | Right accessory |

### Examples

```tsx
// Basic input
<TextField
  labelTx="form:email"
  placeholderTx="form:emailPlaceholder"
  value={email}
  onChangeText={setEmail}
/>

// With validation error
<TextField
  labelTx="form:password"
  status={passwordError ? "error" : undefined}
  helper={passwordError}
  secureTextEntry
/>

// With accessory (MEMOIZE!)
const PasswordToggle = useMemo(() =>
  (props) => (
    <Icon
      icon={showPassword ? "view" : "hidden"}
      onPress={() => setShowPassword(!showPassword)}
    />
  ),
  [showPassword]
)
<TextField RightAccessory={PasswordToggle} secureTextEntry={!showPassword} />
```

---

## Card

**Purpose**: Container for related content with heading, body, and footer sections.

### Props

| Prop | Type | Description |
|------|------|-------------|
| `preset` | `"default"` \| `"reversed"` | Border/background config |
| `verticalAlignment` | `"top"` \| `"center"` \| `"space-between"` \| `"force-footer-bottom"` | Content alignment |
| `heading` / `headingTx` | `string` / `TxKeyPath` | Heading text |
| `content` / `contentTx` | `string` / `TxKeyPath` | Body content |
| `footer` / `footerTx` | `string` / `TxKeyPath` | Footer text |
| `LeftComponent` | `ReactElement` | Left side component |
| `RightComponent` | `ReactElement` | Right side component |
| `HeadingComponent` | `ReactElement` | Custom heading |
| `ContentComponent` | `ReactElement` | Custom content |
| `FooterComponent` | `ReactElement` | Custom footer |

### Example

```tsx
<Card
  headingTx="card:title"
  contentTx="card:description"
  footerTx="card:timestamp"
  LeftComponent={<Icon icon="heart" />}
  RightComponent={<Button tx="card:action" />}
/>
```

---

## Header

**Purpose**: Navigation header with title and action buttons.

### Props

| Prop | Type | Description |
|------|------|-------------|
| `title` / `titleTx` | `string` / `TxKeyPath` | Header title |
| `titleMode` | `"center"` \| `"flex"` | Title alignment |
| `leftIcon` | `IconTypes` | Left icon (e.g., "back") |
| `rightIcon` | `IconTypes` | Right icon |
| `leftText` / `leftTx` | `string` / `TxKeyPath` | Left text button |
| `rightText` / `rightTx` | `string` / `TxKeyPath` | Right text button |
| `onLeftPress` | `() => void` | Left button handler |
| `onRightPress` | `() => void` | Right button handler |
| `LeftActionComponent` | `ReactElement` | Custom left component |
| `RightActionComponent` | `ReactElement` | Custom right component |
| `safeAreaEdges` | `Array<Edge>` | Safe area edges |
| `backgroundColor` | `string` | Background color |

### Examples

```tsx
// Basic with back navigation
<Header titleTx="screen:title" leftIcon="back" onLeftPress={navigation.goBack} />

// With right action
<Header
  titleTx="settings:title"
  leftIcon="back"
  onLeftPress={goBack}
  rightTx="common:save"
  onRightPress={handleSave}
/>
```

### Best Practice

Prefer `useHeader()` hook or `navigation.setOptions()` over direct rendering for performance.

---

## Icon

**Purpose**: Display registered icons. Use `PressableIcon` for interactive icons.

### Available Icons

`back`, `bell`, `caretLeft`, `caretRight`, `check`, `community`, `components`, `debug`, `heart`, `hidden`, `ladybug`, `lock`, `menu`, `more`, `pin`, `settings`, `view`, `x`

### Props

| Prop | Type | Description |
|------|------|-------------|
| `icon` | `IconTypes` | Icon name (required) |
| `color` | `string` | Tint color |
| `size` | `number` | Icon dimensions |
| `style` | `ImageStyle` | Icon styling |
| `containerStyle` | `ViewStyle` | Container styling |
| `onPress` | `() => void` | Press handler (PressableIcon only) |

### Examples

```tsx
// Static icon
<Icon icon="heart" color={colors.tint} size={24} />

// Pressable icon
<PressableIcon icon="settings" onPress={openSettings} />
```

### Adding Custom Icons

1. Add PNG to `assets/icons/`
2. Register in `iconRegistry` in `app/components/Icon.tsx`
3. Reference by registered name

---

## ListItem

**Purpose**: Individual list items with icons, text, and custom components.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` / `tx` | `string` / `TxKeyPath` | - | Item text |
| `height` | `number` | `56` | Item height |
| `topSeparator` | `boolean` | `false` | Show top divider |
| `bottomSeparator` | `boolean` | `false` | Show bottom divider |
| `leftIcon` / `rightIcon` | `IconTypes` | - | Side icons |
| `leftIconColor` / `rightIconColor` | `string` | - | Icon colors |
| `LeftComponent` / `RightComponent` | `ReactElement` | - | Custom side components |
| `onPress` | `() => void` | - | Press handler |

### Example

```tsx
<ListItem
  tx="settings:notifications"
  leftIcon="bell"
  rightIcon="caretRight"
  bottomSeparator
  onPress={() => navigate("NotificationSettings")}
/>
```

---

## EmptyState

**Purpose**: Display when no data is available.

### Props

| Prop | Type | Description |
|------|------|-------------|
| `preset` | `"generic"` | Container preset |
| `heading` / `headingTx` | `string` / `TxKeyPath` | Heading text |
| `content` / `contentTx` | `string` / `TxKeyPath` | Content text |
| `button` / `buttonTx` | `string` / `TxKeyPath` | Button text |
| `buttonOnPress` | `() => void` | Button handler |
| `imageSource` | `ImageSourcePropType` | Image to display |

### Example

```tsx
<EmptyState
  headingTx="orders:empty"
  contentTx="orders:emptyDescription"
  buttonTx="orders:browse"
  buttonOnPress={() => navigate("Menu")}
  imageSource={require("@assets/images/empty-cart.png")}
/>
```

---

## AutoImage

**Purpose**: Image that auto-resizes to fit constraints while maintaining aspect ratio.

### Props

| Prop | Type | Description |
|------|------|-------------|
| `source` | `ImageSourcePropType` | Image source (required) |
| `maxWidth` | `number` | Maximum width constraint |
| `maxHeight` | `number` | Maximum height constraint |
| `headers` | `object` | Request headers for remote images |
| `style` | `ImageStyle` | Image styling |

### Example

```tsx
<AutoImage
  source={{ uri: product.imageUrl }}
  maxWidth={200}
/>
```

### Note

For fixed dimensions, use React Native's standard `Image` component instead.

---

## Checkbox

**Purpose**: Boolean input with checkmark indicator.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `boolean` | `false` | Checked state |
| `onValueChange` | `(value: boolean) => void` | - | Change handler (required) |
| `icon` | `IconTypes` | - | Custom check icon |
| `status` | `"disabled"` \| `"error"` | `null` | Field status |
| `editable` | `boolean` | `true` | Allow interaction |
| `label` / `labelTx` | `string` / `TxKeyPath` | - | Label text |
| `labelPosition` | `"left"` \| `"right"` | `"right"` | Label position |
| `helper` / `helperTx` | `string` / `TxKeyPath` | - | Helper text |

### Example

```tsx
<Checkbox
  value={rememberMe}
  onValueChange={setRememberMe}
  labelTx="login:rememberMe"
/>
```

---

## Switch

**Purpose**: Boolean toggle switch.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `boolean` | `false` | Toggle state |
| `onValueChange` | `(value: boolean) => void` | - | Change handler (required) |
| `accessibilityMode` | `"text"` \| `"icon"` | - | Accessibility labels |
| `status` | `"disabled"` \| `"error"` | `null` | Field status |
| `label` / `labelTx` | `string` / `TxKeyPath` | - | Label text |
| `labelPosition` | `"left"` \| `"right"` | `"right"` | Label position |
| `helper` / `helperTx` | `string` / `TxKeyPath` | - | Helper text |

### Example

```tsx
<Switch
  value={darkMode}
  onValueChange={setDarkMode}
  labelTx="settings:darkMode"
/>
```

---

## Radio

**Purpose**: Radio button for single selection from multiple options.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `boolean` | `false` | Selected state |
| `onValueChange` | `(value: boolean) => void` | - | Change handler (required) |
| `status` | `"disabled"` \| `"error"` | `null` | Field status |
| `label` / `labelTx` | `string` / `TxKeyPath` | - | Label text |
| `labelPosition` | `"left"` \| `"right"` | `"right"` | Label position |
| `helper` / `helperTx` | `string` / `TxKeyPath` | - | Helper text |

### Example

```tsx
{sizes.map(size => (
  <Radio
    key={size.id}
    value={selectedSize === size.id}
    onValueChange={() => setSelectedSize(size.id)}
    label={size.name}
  />
))}
```

---

## Theming Components

All components support theming via `useAppTheme()`:

```tsx
const { themed } = useAppTheme()

<Text style={themed($text)} tx="screen:title" />

const $text: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.text,
  fontSize: theme.spacing.md,
})
```
