# Ignite Plugins Reference

Detailed reference for the Ignite plugin system using Expo Config Plugins.

## Architecture Overview

```
app.config.ts          # Dynamic config - imports and registers plugins
├── plugins/           # Custom plugin directory
│   ├── withFoo.ts     # Individual plugin files
│   └── withBar.ts
└── node_modules/      # Third-party plugins from npm
```

## How Plugins Work

### Execution Flow

1. **Config Evaluation**: When you run `expo prebuild` or `expo start`
2. **Plugin Registration**: Plugins in `plugins` array are loaded in order
3. **Config Modification**: Each plugin receives and modifies the ExpoConfig
4. **Mod Execution**: During prebuild, mods modify actual native files
5. **Native Generation**: Modified configuration generates native code

### Plugin Function Signature

```typescript
import { ConfigPlugin, ExpoConfig } from "expo/config-plugins"

// Basic plugin (no options)
const withBasicPlugin: ConfigPlugin = (config: ExpoConfig) => {
  // Modify config
  return config
}

// Plugin with options
const withOptionsPlugin: ConfigPlugin<PluginOptions> = (config, options) => {
  // Use options to customize behavior
  return config
}
```

## app.config.ts Integration

### Full Example

```typescript
import { ExpoConfig, ConfigContext } from "@expo/config"

// Enable TypeScript for plugins
import "tsx/cjs"

module.exports = ({ config }: ConfigContext): Partial<ExpoConfig> => {
  const existingPlugins = config.plugins ?? []

  return {
    ...config,
    plugins: [
      ...existingPlugins,

      // Local plugin (no options)
      require("./plugins/withMyFeature").withMyFeature,

      // Local plugin with options
      [require("./plugins/withCamera").withCamera, {
        usageMessage: "We need camera access for photos"
      }],

      // NPM package plugin
      "expo-camera",

      // NPM package with options
      ["expo-build-properties", {
        android: { compileSdkVersion: 34 },
        ios: { deploymentTarget: "15.0" }
      }],
    ],
  }
}
```

## Creating Custom Plugins

### Basic Plugin Template

```typescript
// plugins/withMyPlugin.ts
import { ConfigPlugin } from "expo/config-plugins"

const withMyPlugin: ConfigPlugin = (config) => {
  // Modify the Expo config object
  // This runs during config evaluation

  return config
}

export { withMyPlugin }
```

### iOS-Specific Plugins

#### Modify Info.plist

```typescript
// plugins/withCustomPlist.ts
import { ConfigPlugin, withInfoPlist } from "expo/config-plugins"

interface PlistOptions {
  customKey: string
  customValue: string
}

const withCustomPlist: ConfigPlugin<PlistOptions> = (config, { customKey, customValue }) => {
  return withInfoPlist(config, (config) => {
    config.modResults[customKey] = customValue
    return config
  })
}

export { withCustomPlist }
```

#### Modify Entitlements

```typescript
// plugins/withPushNotifications.ts
import { ConfigPlugin, withEntitlementsPlist } from "expo/config-plugins"

const withPushNotifications: ConfigPlugin = (config) => {
  return withEntitlementsPlist(config, (config) => {
    config.modResults["aps-environment"] = "development"
    return config
  })
}

export { withPushNotifications }
```

#### Modify Xcode Project

```typescript
// plugins/withBuildSettings.ts
import { ConfigPlugin, withXcodeProject } from "expo/config-plugins"

const withBuildSettings: ConfigPlugin = (config) => {
  return withXcodeProject(config, (config) => {
    const xcodeProject = config.modResults

    // Modify build settings
    xcodeProject.addBuildProperty("SWIFT_VERSION", "5.0")

    return config
  })
}

export { withBuildSettings }
```

#### Modify Podfile

```typescript
// plugins/withPodfileConfig.ts
import { ConfigPlugin, withPodfile } from "expo/config-plugins"

const withPodfileConfig: ConfigPlugin = (config) => {
  return withPodfile(config, (config) => {
    const podfile = config.modResults

    // Add content to Podfile
    const newContent = `
  pod 'SomePrivatePod', :git => 'https://github.com/example/pod.git'
`
    config.modResults.contents = podfile.contents.replace(
      /target '\w+' do/,
      `$&${newContent}`
    )

    return config
  })
}

export { withPodfileConfig }
```

### Android-Specific Plugins

#### Modify AndroidManifest.xml

```typescript
// plugins/withCustomPermission.ts
import { ConfigPlugin, withAndroidManifest, AndroidConfig } from "expo/config-plugins"

const withCustomPermission: ConfigPlugin = (config) => {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest

    // Add permission
    if (!manifest["uses-permission"]) {
      manifest["uses-permission"] = []
    }

    manifest["uses-permission"].push({
      $: { "android:name": "android.permission.VIBRATE" }
    })

    return config
  })
}

export { withCustomPermission }
```

#### Modify MainActivity

```typescript
// plugins/withMainActivity.ts
import { ConfigPlugin, withMainActivity } from "expo/config-plugins"

const withCustomMainActivity: ConfigPlugin = (config) => {
  return withMainActivity(config, (config) => {
    const contents = config.modResults.contents

    // Add import
    const importLine = "import com.example.MyLibrary;"
    if (!contents.includes(importLine)) {
      config.modResults.contents = contents.replace(
        /package .*;/,
        `$&\n${importLine}`
      )
    }

    return config
  })
}

export { withCustomMainActivity }
```

#### Modify build.gradle

```typescript
// plugins/withGradle.ts
import { ConfigPlugin, withAppBuildGradle } from "expo/config-plugins"

const withGradleDependency: ConfigPlugin = (config) => {
  return withAppBuildGradle(config, (config) => {
    const contents = config.modResults.contents

    // Add dependency
    const dependency = "    implementation 'com.example:library:1.0.0'"
    if (!contents.includes(dependency)) {
      config.modResults.contents = contents.replace(
        /dependencies\s*\{/,
        `dependencies {\n${dependency}`
      )
    }

    return config
  })
}

export { withGradleDependency }
```

#### Modify strings.xml

```typescript
// plugins/withStrings.ts
import { ConfigPlugin, withStringsXml, AndroidConfig } from "expo/config-plugins"

const withCustomStrings: ConfigPlugin = (config) => {
  return withStringsXml(config, (config) => {
    config.modResults = AndroidConfig.Strings.setStringItem(
      [{ $: { name: "app_name" }, _: "My Custom App Name" }],
      config.modResults
    )
    return config
  })
}

export { withCustomStrings }
```

## Composing Multiple Plugins

### Chain Plugins

```typescript
// plugins/withFullSetup.ts
import { ConfigPlugin } from "expo/config-plugins"
import { withCamera } from "./withCamera"
import { withNotifications } from "./withNotifications"
import { withDeepLinks } from "./withDeepLinks"

const withFullSetup: ConfigPlugin = (config) => {
  config = withCamera(config)
  config = withNotifications(config)
  config = withDeepLinks(config)
  return config
}

export { withFullSetup }
```

### Use createRunOncePlugin

```typescript
// plugins/withUniqueSetup.ts
import { ConfigPlugin, createRunOncePlugin } from "expo/config-plugins"

const withUniqueSetup: ConfigPlugin = (config) => {
  // This will only run once even if called multiple times
  return config
}

const pkg = require("./package.json")
export default createRunOncePlugin(withUniqueSetup, pkg.name, pkg.version)
```

## Dangerous Mods

For direct file modifications (use with caution):

```typescript
import { ConfigPlugin, withDangerousMod } from "expo/config-plugins"
import * as fs from "fs"
import * as path from "path"

const withCustomFile: ConfigPlugin = (config) => {
  return withDangerousMod(config, ["ios", async (config) => {
    const filePath = path.join(config.modRequest.projectRoot, "ios", "custom.json")
    fs.writeFileSync(filePath, JSON.stringify({ custom: true }))
    return config
  }])
}

export { withCustomFile }
```

## Plugin Options Patterns

### Required Options

```typescript
interface RequiredOptions {
  apiKey: string
  projectId: string
}

const withRequired: ConfigPlugin<RequiredOptions> = (config, options) => {
  if (!options?.apiKey || !options?.projectId) {
    throw new Error("withRequired requires apiKey and projectId")
  }
  // Use options
  return config
}
```

### Optional with Defaults

```typescript
interface OptionalOptions {
  enabled?: boolean
  timeout?: number
  mode?: "development" | "production"
}

const withOptional: ConfigPlugin<OptionalOptions> = (config, options = {}) => {
  const {
    enabled = true,
    timeout = 30000,
    mode = "production"
  } = options

  // Use merged options
  return config
}
```

### Validation

```typescript
const withValidation: ConfigPlugin<{ url: string }> = (config, options) => {
  if (!options?.url) {
    throw new Error("URL is required")
  }

  try {
    new URL(options.url)
  } catch {
    throw new Error(`Invalid URL: ${options.url}`)
  }

  return config
}
```

## Debugging Plugins

### Log Plugin Execution

```typescript
const withDebug: ConfigPlugin = (config) => {
  console.log("Plugin executing with config:", JSON.stringify(config, null, 2))
  return config
}
```

### Inspect Generated Files

After running prebuild:

```bash
# View iOS Info.plist
cat ios/PizzaApp/Info.plist

# View Android Manifest
cat android/app/src/main/AndroidManifest.xml

# View generated files
ls -la ios/
ls -la android/app/src/main/
```

### Clean Prebuild

```bash
# Full clean rebuild
npx expo prebuild --clean

# Platform-specific
npx expo prebuild --clean --platform ios
npx expo prebuild --clean --platform android
```

## Common Use Cases

### Custom App Icon

```typescript
// plugins/withAppIcon.ts
import { ConfigPlugin, withDangerousMod, IOSConfig } from "expo/config-plugins"

const withAppIcon: ConfigPlugin<{ iconPath: string }> = (config, { iconPath }) => {
  return withDangerousMod(config, ["ios", async (config) => {
    await IOSConfig.Icon.setIconAsync(iconPath, config.modRequest.projectRoot)
    return config
  }])
}

export { withAppIcon }
```

### Custom Splash Screen

```typescript
// plugins/withSplash.ts
import { ConfigPlugin, withInfoPlist } from "expo/config-plugins"

const withSplash: ConfigPlugin<{ backgroundColor: string }> = (config, { backgroundColor }) => {
  return withInfoPlist(config, (config) => {
    config.modResults.UILaunchStoryboardName = "SplashScreen"
    return config
  })
}

export { withSplash }
```

### Deep Linking

```typescript
// plugins/withDeepLinks.ts
import { ConfigPlugin, withInfoPlist, withAndroidManifest } from "expo/config-plugins"

interface DeepLinkOptions {
  scheme: string
  host: string
}

const withDeepLinks: ConfigPlugin<DeepLinkOptions> = (config, { scheme, host }) => {
  // iOS
  config = withInfoPlist(config, (config) => {
    const urlTypes = config.modResults.CFBundleURLTypes ?? []
    urlTypes.push({
      CFBundleURLSchemes: [scheme],
    })
    config.modResults.CFBundleURLTypes = urlTypes
    return config
  })

  // Android
  config = withAndroidManifest(config, (config) => {
    const mainActivity = config.modResults.manifest.application?.[0]?.activity?.find(
      (activity) => activity.$["android:name"] === ".MainActivity"
    )

    if (mainActivity) {
      const intentFilter = {
        action: [{ $: { "android:name": "android.intent.action.VIEW" } }],
        category: [
          { $: { "android:name": "android.intent.category.DEFAULT" } },
          { $: { "android:name": "android.intent.category.BROWSABLE" } },
        ],
        data: [{ $: { "android:scheme": scheme, "android:host": host } }],
      }

      mainActivity["intent-filter"] = mainActivity["intent-filter"] ?? []
      mainActivity["intent-filter"].push(intentFilter)
    }

    return config
  })

  return config
}

export { withDeepLinks }
```

## Best Practices

1. **Keep plugins focused**: One plugin = one concern
2. **Document options**: Add JSDoc comments for plugin options
3. **Handle errors gracefully**: Provide clear error messages
4. **Test thoroughly**: Run prebuild after changes
5. **Version control**: Track plugin changes in git
6. **Avoid side effects**: Plugins should only modify the config passed to them

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Plugin not applying | Check plugin is in `plugins` array and exported correctly |
| TypeScript errors | Ensure `tsx/cjs` import is at top of app.config.ts |
| Changes not visible | Run `npx expo prebuild --clean` |
| Build fails after plugin | Check generated native files for syntax errors |
| Mod not running | Mods only run during prebuild, not `expo start` |
