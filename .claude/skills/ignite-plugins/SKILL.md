---
name: ignite-plugins
description: Guide for creating and managing Expo Config Plugins in Ignite React Native apps. Use when customizing native app configuration, adding native modules, modifying Info.plist, AndroidManifest.xml, or other native files without ejecting. Triggers on native config changes, plugin creation, prebuild customization.
---

# Ignite Plugins Guide

This skill provides guidance on using Ignite's plugin system for Expo Config Plugins.

## What Are Plugins?

Plugins in Ignite are a dedicated space for managing Expo Config Plugins. They enable customization of native app configuration without directly modifying native code. Changes are applied during `expo prebuild`.

## Directory Structure

```
plugins/
├── withCustomFont.ts      # Custom font configuration
├── withAppIcon.ts         # App icon modifications
├── withSplashScreen.ts    # Splash screen customization
└── withPermissions.ts     # Custom permissions
```

## Creating a Plugin

### Step 1: Create the Plugin File

```typescript
// plugins/withMyPlugin.ts
import { ConfigPlugin, withInfoPlist } from "expo/config-plugins"

const withMyPlugin: ConfigPlugin = (config) => {
  return withInfoPlist(config, (config) => {
    // Modify Info.plist
    config.modResults.MyCustomKey = "MyValue"
    return config
  })
}

export { withMyPlugin }
```

### Step 2: Register in app.config.ts

```typescript
// app.config.ts
import "tsx/cjs"

module.exports = ({ config }: ConfigContext): Partial<ExpoConfig> => {
  const existingPlugins = config.plugins ?? []

  return {
    ...config,
    plugins: [
      ...existingPlugins,
      require("./plugins/withMyPlugin").withMyPlugin,
    ],
  }
}
```

## Critical Rules

1. **Naming convention**: Always prefix with `with` (e.g., `withCamera`, `withNotifications`)
2. **TypeScript support**: Use `import "tsx/cjs"` in app.config.ts for TypeScript plugins
3. **Pure functions**: Plugins must be synchronous and return modified config
4. **Serializable output**: Return values must be serializable (except mods)
5. **Run prebuild**: After adding/modifying plugins, run `npx expo prebuild`

## Common Plugin Patterns

### iOS Info.plist Modification

```typescript
import { ConfigPlugin, withInfoPlist } from "expo/config-plugins"

const withCameraUsage: ConfigPlugin<{ message: string }> = (config, { message }) => {
  return withInfoPlist(config, (config) => {
    config.modResults.NSCameraUsageDescription = message
    return config
  })
}

export { withCameraUsage }
```

### Android Manifest Modification

```typescript
import { ConfigPlugin, withAndroidManifest } from "expo/config-plugins"

const withClearTextTraffic: ConfigPlugin = (config) => {
  return withAndroidManifest(config, (config) => {
    const application = config.modResults.manifest.application?.[0]
    if (application) {
      application.$["android:usesCleartextTraffic"] = "true"
    }
    return config
  })
}

export { withClearTextTraffic }
```

### Plugin with Options

```typescript
import { ConfigPlugin } from "expo/config-plugins"

interface MyPluginOptions {
  enableFeature?: boolean
  customValue?: string
}

const withMyPlugin: ConfigPlugin<MyPluginOptions> = (config, options = {}) => {
  const { enableFeature = true, customValue = "default" } = options

  // Apply config based on options
  return config
}

export { withMyPlugin }
```

## Available Mods

| Mod | Platform | Purpose |
|-----|----------|---------|
| `withInfoPlist` | iOS | Modify Info.plist |
| `withEntitlementsPlist` | iOS | Modify entitlements |
| `withXcodeProject` | iOS | Modify Xcode project |
| `withPodfile` | iOS | Modify Podfile |
| `withAndroidManifest` | Android | Modify AndroidManifest.xml |
| `withMainActivity` | Android | Modify MainActivity |
| `withMainApplication` | Android | Modify MainApplication |
| `withGradleProperties` | Android | Modify gradle.properties |
| `withAppBuildGradle` | Android | Modify app/build.gradle |
| `withStringsXml` | Android | Modify strings.xml |

## Testing Plugins

1. Run `npx expo prebuild --clean` to regenerate native projects
2. Check generated files in `ios/` and `android/` directories
3. Build with `pnpm run build:ios:sim` or `pnpm run build:android:sim`

## Security Warning

- Plugins can modify any native file - review carefully
- Don't expose secrets in plugin configurations
- Use environment variables for sensitive values

## Additional Resources

- For detailed implementation, see [reference.md](reference.md)
- Expo Config Plugins docs: https://docs.expo.dev/config-plugins/introduction/
- Plugin source files: `plugins/`
