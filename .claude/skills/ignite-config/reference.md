# Ignite Config Reference

Detailed reference for the Ignite configuration system.

## File Architecture

```
app/config/
├── index.ts          # Entry point - merges configs based on __DEV__
├── config.base.ts    # Shared configuration for all environments
├── config.dev.ts     # Development environment overrides
└── config.prod.ts    # Production environment overrides
```

## config.base.ts

The base config defines shared settings and the TypeScript interface for type safety.

### Interface Definition

```typescript
export interface ConfigBaseProps {
  /**
   * Navigation state persistence
   * - "always": Persist in all environments
   * - "dev": Only persist in development (recommended)
   * - "prod": Only persist in production
   * - "never": Never persist navigation state
   */
  persistNavigation: "always" | "dev" | "prod" | "never"

  /**
   * Error boundary behavior
   * - "always": Catch errors in all environments
   * - "dev": Only catch in development
   * - "prod": Only catch in production
   * - "never": Never catch (errors will crash app)
   */
  catchErrors: "always" | "dev" | "prod" | "never"

  /**
   * Routes that will exit the app when back button is pressed (Android only)
   * Typically your root/home screens
   */
  exitRoutes: string[]
}
```

### Type Export

```typescript
export type PersistNavigationConfig = ConfigBaseProps["persistNavigation"]
```

### Default Values

```typescript
const BaseConfig: ConfigBaseProps = {
  persistNavigation: "dev",
  catchErrors: "always",
  exitRoutes: ["Welcome"],
}
```

## config.dev.ts / config.prod.ts

Environment-specific configurations that override or extend base config.

### Structure

```typescript
/**
 * Development/Production configuration
 *
 * Do not include API secrets in this file or anywhere in your JS.
 * https://reactnative.dev/docs/security#storing-sensitive-info
 */
export default {
  API_URL: "https://api.example.com/v1/",
}
```

### Common Environment-Specific Values

| Key | Dev Example | Prod Example |
|-----|------------|--------------|
| `API_URL` | `https://staging-api.example.com/` | `https://api.example.com/` |
| `DEBUG_MODE` | `true` | `false` |
| `LOG_LEVEL` | `"debug"` | `"error"` |
| `ENABLE_DEVTOOLS` | `true` | `false` |

## index.ts - Config Merger

The index file handles environment detection and config merging:

```typescript
import BaseConfig from "./config.base"
import DevConfig from "./config.dev"
import ProdConfig from "./config.prod"

let ExtraConfig = ProdConfig

if (__DEV__) {
  ExtraConfig = DevConfig
}

const Config = { ...BaseConfig, ...ExtraConfig }

export default Config
```

### Merge Behavior

1. Base config is always applied first
2. Dev or Prod config spreads on top (overrides base values with same keys)
3. Final merged config is exported

## Usage Examples

### Basic Usage

```typescript
import Config from "@/config"

// Access any config value
console.log(Config.API_URL)
console.log(Config.persistNavigation)
```

### Conditional Logic

```typescript
import Config from "@/config"

// Check navigation persistence
if (Config.persistNavigation === "always" ||
    (Config.persistNavigation === "dev" && __DEV__)) {
  // Persist navigation state
}

// Check if current route should exit app
const shouldExitApp = Config.exitRoutes.includes(currentRouteName)
```

### API Service Usage

```typescript
import Config from "@/config"
import { create } from "apisauce"

const api = create({
  baseURL: Config.API_URL,
  timeout: Config.API_TIMEOUT ?? 30000,
})
```

## Extending Config

### Step 1: Update Interface (for base config additions)

```typescript
// config.base.ts
export interface ConfigBaseProps {
  // ... existing props

  // Add new typed property
  analytics: {
    enabled: boolean
    provider: "posthog" | "mixpanel" | "amplitude"
  }
}
```

### Step 2: Add Default Values

```typescript
// config.base.ts
const BaseConfig: ConfigBaseProps = {
  // ... existing config

  analytics: {
    enabled: true,
    provider: "posthog",
  },
}
```

### Step 3: Add Environment Overrides (if needed)

```typescript
// config.dev.ts
export default {
  API_URL: "https://staging-api.example.com/",
  ANALYTICS_DEBUG: true, // Dev-only setting
}

// config.prod.ts
export default {
  API_URL: "https://api.example.com/",
  ANALYTICS_DEBUG: false,
}
```

## Environment Variables

For sensitive or build-time configuration, use Expo environment variables:

### .env File

```bash
EXPO_PUBLIC_API_KEY=your_api_key_here
EXPO_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

### Usage in Config

```typescript
// config.base.ts
const BaseConfig: ConfigBaseProps = {
  posthog: {
    apiKey: process.env.EXPO_PUBLIC_POSTHOG_API_KEY ?? "",
    host: process.env.EXPO_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
  },
}
```

### Important Notes

- Prefix with `EXPO_PUBLIC_` for client-side access
- Still NOT secure - values are bundled in JS
- Use for non-sensitive configuration only
- Create `.env.example` with placeholder values for team

## Security Best Practices

### What NOT to Store in Config

- API secrets / private keys
- Database credentials
- OAuth client secrets
- Encryption keys
- User passwords or tokens

### Secure Alternatives

| Data Type | Recommended Storage |
|-----------|-------------------|
| User auth tokens | `@/utils/storage` (MMKV) + secure storage |
| API keys (public) | Environment variables (still visible) |
| API keys (private) | Backend proxy - never in app |
| Feature flags | Config files (not sensitive) |
| API URLs | Config files (environment-specific) |

### Backend Proxy Pattern

For truly sensitive API calls:

```typescript
// Instead of embedding secret in app
const response = await api.post("/proxy/third-party", { action: "getData" })

// Backend handles the secret key
// app/config only stores your own backend URL
```

## TypeScript Tips

### Accessing Config with Type Safety

```typescript
import Config from "@/config"

// Config type is inferred from merged result
type AppConfig = typeof Config

// For specific properties
const persist: PersistNavigationConfig = Config.persistNavigation
```

### Adding Type Declarations for Dev/Prod Config

If you need strict typing for environment configs:

```typescript
// types/config.d.ts
interface EnvironmentConfig {
  API_URL: string
  DEBUG_MODE?: boolean
}

// config.dev.ts
const config: EnvironmentConfig = {
  API_URL: "https://staging-api.example.com/",
  DEBUG_MODE: true,
}
export default config
```
