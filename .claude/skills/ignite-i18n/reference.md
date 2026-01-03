# Ignite i18n Reference

Detailed reference for the Ignite internationalization system.

## File Architecture

```
app/i18n/
├── index.ts       # i18next setup, RTL handling, type exports
├── translate.ts   # translate() function wrapper
├── en.ts          # English (source of truth, exports Translations type)
├── ar.ts          # Arabic (RTL)
├── es.ts          # Spanish
├── fr.ts          # French
├── hi.ts          # Hindi
├── ja.ts          # Japanese
├── ko.ts          # Korean
├── demo-en.ts     # Demo screen translations (English)
├── demo-ar.ts     # Demo screen translations (Arabic)
└── demo-*.ts      # Demo translations for other languages
```

## Core Concepts

### Translation Structure

English file defines the structure and exports the type:

```typescript
// en.ts
const en = {
  common: {
    ok: "OK!",
    cancel: "Cancel",
    back: "Back",
    logOut: "Log Out",
  },
  welcomeScreen: {
    readyForLaunch: "Your app, almost ready for launch!",
    exciting: "(ohh, this is exciting!)",
    letsGo: "Let's go!",
  },
  errors: {
    invalidEmail: "Invalid email address.",
  },
}

export default en
export type Translations = typeof en
```

### Other Language Files

Must match the English structure exactly:

```typescript
// es.ts
import { Translations } from "./en"

const es: Translations = {
  common: {
    ok: "OK!",
    cancel: "Cancelar",
    back: "Atrás",
    logOut: "Cerrar Sesión",
  },
  welcomeScreen: {
    readyForLaunch: "¡Tu aplicación, casi lista para el lanzamiento!",
    exciting: "(¡ohh, esto es emocionante!)",
    letsGo: "¡Vamos!",
  },
  errors: {
    invalidEmail: "Dirección de correo electrónico no válida.",
  },
}

export default es
```

## i18next Initialization

### index.ts Setup

```typescript
import { I18nManager } from "react-native"
import * as Localization from "expo-localization"
import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import "intl-pluralrules"

// Import all language files
import ar from "./ar"
import en, { Translations } from "./en"
import es from "./es"
// ... more imports

const fallbackLocale = "en-US"
const resources = { ar, en, ko, es, fr, ja, hi }

// Auto-detect device language
const systemLocales = Localization.getLocales()

export const initI18n = async () => {
  i18n.use(initReactI18next)
  await i18n.init({
    resources,
    lng: locale?.languageTag ?? fallbackLocale,
    fallbackLng: fallbackLocale,
    interpolation: {
      escapeValue: false,
    },
  })
  return i18n
}
```

### Type-Safe Keys (TxKeyPath)

```typescript
export type TxKeyPath = RecursiveKeyOf<Translations>

// This creates a union type of all valid key paths:
// "common:ok" | "common:cancel" | "welcomeScreen:title" | ...
```

## translate() Function

### Definition

```typescript
// translate.ts
import i18n from "i18next"
import type { TOptions } from "i18next"
import { TxKeyPath } from "."

export function translate(key: TxKeyPath, options?: TOptions): string {
  if (i18n.isInitialized) {
    return i18n.t(key, options)
  }
  return key
}
```

### Usage

```typescript
import { translate } from "@/i18n"

// Simple translation
const okText = translate("common:ok")

// With interpolation
const greeting = translate("welcomeScreen:greeting", { name: "John" })

// With pluralization
const itemCount = translate("cart:itemCount", { count: 5 })
```

## Component Props

### tx Props in Ignite Components

All Ignite text-displaying components support `tx` props:

| Component | tx Props |
|-----------|----------|
| `Text` | `tx`, `txOptions` |
| `Button` | `tx`, `txOptions` |
| `TextField` | `labelTx`, `placeholderTx`, `helperTx` |
| `Header` | `titleTx`, `leftTx`, `rightTx` |
| `Card` | `headingTx`, `contentTx`, `footerTx` |
| `EmptyState` | `headingTx`, `contentTx`, `buttonTx` |
| `ListItem` | `tx`, `txOptions` |
| `Toggle` | `labelTx`, `helperTx` |

### tx vs text Props

```tsx
// PREFERRED: Use tx for i18n support
<Text tx="common:ok" />

// FALLBACK: Use text only for truly static text
<Text text="v1.0.0" />

// Both can be used (tx takes priority if present)
<Text tx="common:greeting" text="Hello" />
```

### txOptions for Interpolation

```tsx
// Translation: "Hello, {{name}}!"
<Text tx="welcomeScreen:greeting" txOptions={{ name: userName }} />

// Translation: "{{count}} items in cart"
<Text tx="cart:itemCount" txOptions={{ count: cartItems.length }} />
```

## RTL (Right-to-Left) Support

### Automatic RTL Detection

```typescript
// index.ts
export let isRTL = false

if (locale?.languageTag && locale?.textDirection === "rtl") {
  I18nManager.allowRTL(true)
  isRTL = true
} else {
  I18nManager.allowRTL(false)
}
```

### Using isRTL in Components

```tsx
import { isRTL } from "@/i18n"

const $container: ViewStyle = {
  flexDirection: isRTL ? "row-reverse" : "row",
  paddingLeft: isRTL ? 0 : 16,
  paddingRight: isRTL ? 16 : 0,
}

// Or conditionally
<Icon name={isRTL ? "arrow-left" : "arrow-right"} />
```

### RTL-Aware Styles

```tsx
import { I18nManager } from "react-native"

const $text: TextStyle = {
  textAlign: I18nManager.isRTL ? "right" : "left",
  writingDirection: I18nManager.isRTL ? "rtl" : "ltr",
}
```

## Adding a New Language

### Step 1: Create Language File

```typescript
// app/i18n/de.ts (German)
import { Translations } from "./en"

const de: Translations = {
  common: {
    ok: "OK!",
    cancel: "Abbrechen",
    back: "Zurück",
    logOut: "Abmelden",
  },
  // ... all other translations
}

export default de
```

### Step 2: Register in index.ts

```typescript
// app/i18n/index.ts
import de from "./de"

const resources = { ar, en, ko, es, fr, ja, hi, de }
```

### Step 3: (Optional) Add Demo Translations

```typescript
// app/i18n/demo-de.ts
const demoGerman = {
  demoShowroomScreen: {
    jumpStart: "Komponenten für einen schnellen Start!",
    // ...
  },
}
export default demoGerman

// Then import in de.ts
import demoGerman from "./demo-de"
const de: Translations = {
  // ... translations
  ...demoGerman,
}
```

## Interpolation Patterns

### Basic Interpolation

```typescript
// en.ts
greeting: "Hello, {{name}}!"

// Usage
translate("greeting", { name: "John" }) // "Hello, John!"
```

### Multiple Variables

```typescript
// en.ts
orderStatus: "Order #{{orderId}} is {{status}}"

// Usage
translate("orderStatus", { orderId: "12345", status: "shipped" })
```

### Nested Interpolation

```typescript
// en.ts
duration: "Duration: {{hours}} hours {{minutes}} minutes"

// Usage
translate("duration", { hours: 2, minutes: 30 })
```

## Pluralization

### Basic Pluralization

```typescript
// en.ts
items: {
  one: "{{count}} item",
  other: "{{count}} items",
}

// Usage
translate("items", { count: 1 }) // "1 item"
translate("items", { count: 5 }) // "5 items"
```

### With Zero Case

```typescript
// en.ts
cart: {
  zero: "Your cart is empty",
  one: "{{count}} item in cart",
  other: "{{count}} items in cart",
}
```

## Best Practices

### 1. Organize by Feature/Screen

```typescript
const en = {
  common: { /* shared strings */ },
  loginScreen: { /* login-specific */ },
  profileScreen: { /* profile-specific */ },
  errors: { /* error messages */ },
  validation: { /* form validation */ },
}
```

### 2. Use Descriptive Keys

```typescript
// Good
loginScreen: {
  emailFieldLabel: "Email",
  emailFieldPlaceholder: "Enter your email",
  submitButton: "Log In",
}

// Avoid
login: {
  label1: "Email",
  placeholder1: "Enter your email",
  btn: "Log In",
}
```

### 3. Keep Translations Flat When Possible

```typescript
// Prefer this
loginScreen: {
  title: "Log In",
  emailLabel: "Email",
  passwordLabel: "Password",
}

// Over deeply nested
loginScreen: {
  header: {
    title: "Log In",
  },
  form: {
    fields: {
      email: {
        label: "Email",
      },
    },
  },
}
```

### 4. Handle Missing Translations

The `translate()` function returns the key if i18n isn't initialized:

```typescript
export function translate(key: TxKeyPath, options?: TOptions): string {
  if (i18n.isInitialized) {
    return i18n.t(key, options)
  }
  return key // Fallback to key
}
```

### 5. Testing Translations

```typescript
// Verify all keys exist in all languages
Object.keys(en).forEach((namespace) => {
  Object.keys(en[namespace]).forEach((key) => {
    expect(es[namespace]?.[key]).toBeDefined()
    expect(fr[namespace]?.[key]).toBeDefined()
    // ... other languages
  })
})
```

## Language Switching

### Programmatic Language Change

```typescript
import i18n from "i18next"

const changeLanguage = async (langCode: string) => {
  await i18n.changeLanguage(langCode)
  // Note: RTL changes require app restart
}
```

### Using react-i18next Hook

```tsx
import { useTranslation } from "react-i18next"

function LanguagePicker() {
  const { i18n } = useTranslation()

  return (
    <Button
      text="Español"
      onPress={() => i18n.changeLanguage("es")}
    />
  )
}
```

## Removing i18n (If Not Needed)

If your app doesn't need internationalization:

1. Replace all `tx` props with `text` props
2. Delete `app/i18n/` directory
3. Remove i18n initialization from `app/app.tsx`
4. Remove i18next dependencies from `package.json`
