# Ignite Generator Slash Command

Generate Ignite scaffolding quickly using Claude Code.

## Quick Start

```
/ignite-gen [type] [Name]
```

## Generator Types

### Component

Creates a new React Native component with theming support.

```
/ignite-gen component PizzaCard
```

**Output:** `app/components/PizzaCard.tsx`

The generated component includes:
- TypeScript interface for props
- Themed styling with `useAppTheme()`
- Basic component structure

**After generation:**
1. Export from `app/components/index.ts`
2. Import in your screens as needed

---

### Screen

Creates a new screen with navigation integration.

```
/ignite-gen screen OrderHistory
```

**Output:** `app/screens/OrderHistoryScreen.tsx`

The generated screen includes:
- Screen component with `Screen` wrapper
- Navigation typing
- Themed styling

**After generation:**
1. Export from `app/screens/index.ts`
2. Add to `AppNavigator.tsx` at the `IGNITE_GENERATOR_ANCHOR_APP_STACK_SCREENS` comment:

```tsx
<Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
```

3. Add the route to `AppStackParamList` type

---

### Model

Creates a MobX-State-Tree model.

```
/ignite-gen model Product
```

**Output:** `app/models/Product.ts`

The generated model includes:
- MST model definition
- TypeScript types
- Basic properties and actions

**After generation:**
1. Export from `app/models/index.ts`
2. Add to RootStore if needed

---

### Navigator

Creates a navigation configuration.

```
/ignite-gen navigator CheckoutNavigator
```

**Output:** `app/navigators/CheckoutNavigator.tsx`

The generated navigator includes:
- Stack or Tab navigator setup
- Screen configuration
- TypeScript navigation types

**After generation:**
1. Export from `app/navigators/index.ts`
2. Integrate into `AppNavigator.tsx`

---

## Naming Conventions

| Type | Input | Output File |
|------|-------|-------------|
| component | `PizzaCard` | `PizzaCard.tsx` |
| screen | `OrderHistory` | `OrderHistoryScreen.tsx` |
| model | `Product` | `Product.ts` |
| navigator | `Checkout` | `CheckoutNavigator.tsx` |

**Always use PascalCase** for names.

## Examples

```
# Components
/ignite-gen component Button
/ignite-gen component PizzaMenuItem
/ignite-gen component CartItem

# Screens
/ignite-gen screen Home
/ignite-gen screen ProductDetail
/ignite-gen screen Checkout

# Models
/ignite-gen model User
/ignite-gen model Order
/ignite-gen model CartItem

# Navigators
/ignite-gen navigator Auth
/ignite-gen navigator MainTabs
```

## Troubleshooting

### Command not found

Ensure you're in the project root directory and have Ignite CLI available:

```bash
npx ignite-cli --version
```

### Generated files not appearing

Check that the generator ran successfully. Look for output in the terminal.

### TypeScript errors after generation

1. Run `pnpm run compile` to check for type errors
2. Ensure all exports are added to barrel files (`index.ts`)
3. Add missing navigation types to `AppStackParamList`
