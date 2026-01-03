---
name: ignite-i18n
description: Guide for internationalization in Ignite React Native apps. Use when adding translations, supporting new languages, handling RTL layouts, or using i18n in components. Triggers on translation work, multi-language support, localization.
---

# Ignite i18n Guide

This skill provides guidance on using Ignite's internationalization system with i18next and react-i18next.

## Supported Languages

| Code | Language | RTL |
|------|----------|-----|
| `en` | English | No |
| `ar` | Arabic | Yes |
| `es` | Spanish | No |
| `fr` | French | No |
| `hi` | Hindi | No |
| `ja` | Japanese | No |
| `ko` | Korean | No |

## Critical Rules

1. **Use `tx` prop over `text` prop** for all user-facing strings
2. **English is the source of truth** - `en.ts` exports the `Translations` type
3. **Keep translation keys organized** by screen/feature namespace
4. **Use interpolation** for dynamic values: `{{name}}`
5. **All languages must match** the English structure exactly

## Quick Usage

### In Components (Preferred)

```tsx
import { Text, Button, TextField } from "@/components"

// Text component
<Text tx="common:ok" />
<Text tx="welcomeScreen:greeting" txOptions={{ name: "John" }} />

// Button
<Button tx="loginScreen:tapToLogIn" onPress={login} />

// TextField
<TextField
  labelTx="loginScreen:emailFieldLabel"
  placeholderTx="loginScreen:emailFieldPlaceholder"
  helperTx="errors:invalidEmail"
/>
```

### In JavaScript (when needed)

```tsx
import { translate } from "@/i18n"

const message = translate("common:ok")
const greeting = translate("welcomeScreen:greeting", { name: "John" })
```

## Translation Key Format

Keys use `namespace:path.to.key` format:

```typescript
// en.ts
const en = {
  common: {           // namespace
    ok: "OK!",        // common:ok
    cancel: "Cancel", // common:cancel
  },
  loginScreen: {
    title: "Login",           // loginScreen:title
    form: {
      email: "Email",         // loginScreen:form.email
      password: "Password",   // loginScreen:form.password
    },
  },
}
```

## Adding Translations

### Step 1: Add to English (en.ts)

```typescript
// app/i18n/en.ts
const en = {
  // ... existing translations
  myNewScreen: {
    title: "My New Screen",
    description: "Welcome to {{name}}",
    buttons: {
      save: "Save",
      cancel: "Cancel",
    },
  },
}
```

### Step 2: Add to Other Languages

```typescript
// app/i18n/es.ts
const es: Translations = {
  // ... existing translations
  myNewScreen: {
    title: "Mi Nueva Pantalla",
    description: "Bienvenido a {{name}}",
    buttons: {
      save: "Guardar",
      cancel: "Cancelar",
    },
  },
}
```

## RTL Support

RTL is automatic for Arabic. Check RTL status:

```typescript
import { isRTL } from "@/i18n"

const style = {
  flexDirection: isRTL ? "row-reverse" : "row",
}
```

## Type Safety

Keys are type-checked via `TxKeyPath`:

```typescript
import { TxKeyPath } from "@/i18n"

// TypeScript will error on invalid keys
const key: TxKeyPath = "common:ok" // Valid
const bad: TxKeyPath = "invalid:key" // Error!
```

## Additional Resources

- For detailed patterns, see [reference.md](reference.md)
- Translation files: `app/i18n/`
- i18next docs: https://www.i18next.com/
