---
name: ignite-components
description: Guide for using Ignite React Native boilerplate components. Use when building UI screens, forms, lists, or any React Native interface in this project. Triggers on component creation, UI implementation, form building, screen layouts.
---

# Ignite Components Guide

This skill provides guidance on using Ignite's prebuilt components following best practices.

## Quick Reference

| Component | Use Case |
|-----------|----------|
| `Screen` | Top-level wrapper for all screens (handles scroll, safe areas, keyboard) |
| `Text` | ALL text display (replaces RN Text) - supports i18n |
| `Button` | Interactive buttons with presets and accessories |
| `TextField` | Form inputs with labels, helpers, validation states |
| `Card` | Container for related content (heading, body, footer) |
| `Header` | Navigation header with title and action buttons |
| `Icon` | Display registered icons (use `PressableIcon` for interactive) |
| `ListItem` | Individual list items with icons and separators |
| `EmptyState` | No-data states with heading, content, image, button |
| `AutoImage` | Auto-resizing images maintaining aspect ratio |
| `Checkbox` | Boolean input with checkmark |
| `Switch` | Boolean toggle switch |
| `Radio` | Radio button selection |

## Critical Rules

1. **ALWAYS use `Text` from `@/components`** - never from `react-native`
2. **ALWAYS wrap screens with `Screen`** component
3. **Use `tx` prop** for text over `text` prop (i18n support)
4. **Memoize accessories** with `useMemo` to prevent flickering
5. **Use presets** before custom styling

## Import Pattern

```tsx
import { Screen, Text, Button, TextField, Card, Header, Icon, ListItem, EmptyState, AutoImage } from "@/components"
```

## Additional Resources

- For detailed props and examples, see [reference.md](reference.md)
- Component source files: `app/components/`

## Common Patterns

### Screen with Header
```tsx
<Screen preset="scroll" safeAreaEdges={["top"]}>
  <Header title="Screen Title" leftIcon="back" onLeftPress={goBack} />
  {/* content */}
</Screen>
```

### Form with Validation
```tsx
<TextField
  labelTx="form:email"
  status={errors.email ? "error" : undefined}
  helper={errors.email}
  onChangeText={setEmail}
/>
<Button tx="form:submit" preset="filled" onPress={handleSubmit} />
```

### List with Empty State
```tsx
{items.length === 0 ? (
  <EmptyState
    headingTx="list:empty"
    buttonTx="list:refresh"
    buttonOnPress={refresh}
  />
) : (
  items.map(item => <ListItem key={item.id} text={item.name} />)
)}
```
