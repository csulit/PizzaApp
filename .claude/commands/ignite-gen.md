---
description: Generate Ignite scaffolding (components, screens, models, navigators)
argument-hint: [type] [name]
allowed-tools: Bash(npx:ignite-cli)
---

# Ignite Generator

Generate new Ignite scaffolding using the Ignite CLI.

## Available Generator Types

| Type | Description | Output Location |
|------|-------------|-----------------|
| `component` | React Native component with theming support | `app/components/` |
| `screen` | Screen with navigation integration | `app/screens/` |
| `model` | MobX-State-Tree model | `app/models/` |
| `navigator` | Navigation configuration | `app/navigators/` |

## Usage

```
/ignite-gen [type] [Name]
```

Where:
- `type` = one of: component, screen, model, navigator
- `Name` = PascalCase name for the generated item

## Examples

```
/ignite-gen component PizzaCard
/ignite-gen screen OrderHistory
/ignite-gen model Product
/ignite-gen navigator CheckoutNavigator
```

## Command Execution

Run the Ignite CLI generator:

```bash
npx ignite-cli generate $ARGUMENTS
```

After generation:
1. Review the created files
2. Add any necessary imports to the barrel exports (index.ts)
3. For screens, add navigation in `AppNavigator.tsx` at the `IGNITE_GENERATOR_ANCHOR` comment
