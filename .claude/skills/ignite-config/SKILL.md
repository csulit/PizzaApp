---
name: ignite-config
description: Guide for managing configuration in Ignite React Native apps. Use when adding new config values, setting up environment-specific settings, or working with API URLs, feature flags, and app settings. Triggers on config changes, environment setup, API configuration.
---

# Ignite Config Guide

This skill provides guidance on using Ignite's configuration system following best practices.

## File Structure

| File | Purpose |
|------|---------|
| `config.base.ts` | Shared config for all environments (navigation, error handling, exit routes) |
| `config.dev.ts` | Development-only config (dev API URLs, debug settings) |
| `config.prod.ts` | Production-only config (prod API URLs, analytics) |
| `index.ts` | Auto-merges base + dev/prod based on `__DEV__` |

## How It Works

```typescript
// index.ts merges configs automatically
const Config = { ...BaseConfig, ...ExtraConfig }
// ExtraConfig = DevConfig when __DEV__ is true
// ExtraConfig = ProdConfig when __DEV__ is false
```

## Critical Rules

1. **NEVER store secrets in config files** - they ship in the JS bundle
2. **Use environment variables** for sensitive data via `process.env.EXPO_PUBLIC_*`
3. **Shared settings go in `config.base.ts`** - don't duplicate across dev/prod
4. **Keep dev and prod configs in sync** - same keys, different values
5. **Type your config** - extend `ConfigBaseProps` interface when adding new keys

## Import Pattern

```typescript
import Config from "@/config"

// Usage
const apiUrl = Config.API_URL
const shouldPersist = Config.persistNavigation === "always"
```

## Adding New Config Values

### For Shared Settings (both environments)

```typescript
// config.base.ts
export interface ConfigBaseProps {
  // ... existing props
  featureFlags: {
    newFeature: boolean
  }
}

const BaseConfig: ConfigBaseProps = {
  // ... existing config
  featureFlags: {
    newFeature: true,
  },
}
```

### For Environment-Specific Settings

```typescript
// config.dev.ts
export default {
  API_URL: "https://api-staging.example.com/",
  DEBUG_MODE: true,
}

// config.prod.ts
export default {
  API_URL: "https://api.example.com/",
  DEBUG_MODE: false,
}
```

## Security Warning

Config values are NOT secure:
- Shipped in plain text in JS bundle
- Anyone can extract them from downloaded app
- Use secure storage (Keychain/Keystore) for sensitive data
- Read: https://reactnative.dev/docs/security#storing-sensitive-info

## Common Config Patterns

### API Configuration
```typescript
// config.dev.ts / config.prod.ts
export default {
  API_URL: "https://api.example.com/v1/",
  API_TIMEOUT: 30000,
}
```

### Feature Flags
```typescript
// config.base.ts
featureFlags: {
  darkMode: true,
  analytics: true,
  debugMenu: __DEV__,
}
```

### Navigation Persistence
```typescript
// config.base.ts
persistNavigation: "dev", // "always" | "dev" | "prod" | "never"
```

### Exit Routes (Android back button)
```typescript
// config.base.ts
exitRoutes: ["Welcome", "Home"], // Screens that exit app on back press
```

## Additional Resources

- For detailed implementation, see [reference.md](reference.md)
- Config source files: `app/config/`
