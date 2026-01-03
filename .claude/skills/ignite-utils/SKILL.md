---
name: ignite-utils
description: Guide for using Ignite React Native utility hooks and functions. Use when handling safe area insets, setting navigation headers dynamically, or implementing common utility patterns. Triggers on screen layouts, header configuration, safe area handling.
---

# Ignite Utils Guide

This skill provides guidance on using Ignite's utility hooks and functions.

## Quick Reference

| Utility | Use Case |
|---------|----------|
| `useSafeAreaInsetsStyle` | Generate safe-area-aware styles for Views (notches, home indicators) |
| `useHeader` | Set navigation headers dynamically from within screen components |
| `storage` | MMKV-based persistent storage (load, save, remove, clear) |

## Critical Rules

1. **Use `useSafeAreaInsetsStyle`** for device-specific safe area handling instead of hardcoded values
2. **Use `useHeader`** to configure headers within screens rather than navigator options
3. **Include dependencies** in `useHeader` when header content is dynamic
4. **Prefer RTL-aware edges** (`start`, `end`) over `left`, `right` for internationalization

## Import Pattern

```tsx
import { useSafeAreaInsetsStyle } from "@/utils/useSafeAreaInsetsStyle"
import { useHeader } from "@/utils/useHeader"
```

## Additional Resources

- For detailed props and examples, see [reference.md](reference.md)
- Utility source files: `app/utils/`

## Common Patterns

### Safe Area with Screen

```tsx
function MyScreen() {
  const $containerInsets = useSafeAreaInsetsStyle(["top", "bottom"], "padding")

  return (
    <View style={$containerInsets}>
      {/* content respects safe areas */}
    </View>
  )
}
```

### Dynamic Header with Actions

```tsx
function ProfileScreen() {
  const { logout } = useAuth()

  useHeader(
    {
      titleTx: "profile:title",
      rightTx: "common:logOut",
      onRightPress: logout,
    },
    [logout],
  )

  return <Screen preset="scroll">{/* content */}</Screen>
}
```

### Header with Back Navigation

```tsx
function DetailsScreen() {
  const navigation = useNavigation()

  useHeader({
    title: "Details",
    leftIcon: "back",
    onLeftPress: () => navigation.goBack(),
  })

  return <Screen>{/* content */}</Screen>
}
```
