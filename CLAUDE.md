# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React Native app built with the [Ignite](https://github.com/infinitered/ignite) boilerplate (v11.3.2). It uses Expo SDK 54 with a dev-client workflow (not Expo Go).

## Commands

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run start

# Run on platforms
pnpm run ios          # Requires dev build first
pnpm run android      # Requires dev build first
pnpm run web

# Build dev clients (required before running on devices/simulators)
pnpm run build:ios:sim      # iOS simulator
pnpm run build:android:sim  # Android emulator

# Type checking and linting
pnpm run compile      # TypeScript check (tsc --noEmit)
pnpm run lint         # ESLint with auto-fix
pnpm run lint:check   # ESLint without auto-fix

# Testing
pnpm run test              # Run all tests
pnpm run test:watch        # Watch mode
npx jest path/to/test.ts   # Run single test file

# E2E testing with Maestro
pnpm run test:maestro
```

## Architecture

### Path Aliases
- `@/*` → `./app/*`
- `@assets/*` → `./assets/*`

### App Structure (`app/`)

**Entry Point**: `app/app.tsx` - Root component with providers hierarchy:
- `SafeAreaProvider` → `KeyboardProvider` → `AuthProvider` → `ThemeProvider` → `ErrorBoundary` → `AppNavigator`

**Error Handling** (`screens/ErrorScreen/`):
- `ErrorBoundary.tsx` - Class component catching JS errors, configured with `catchErrors` prop
- `ErrorDetails.tsx` - Fallback UI with reset functionality
- Use `catchErrors="always"|"dev"|"prod"|"never"` to control error catching behavior

**Navigation** (`navigators/`):
- `AppNavigator.tsx` - Main stack navigator with auth-based routing (Login vs authenticated screens)
- `DemoNavigator.tsx` - Bottom tab navigator for demo screens
- Add new screens at the `IGNITE_GENERATOR_ANCHOR_APP_STACK_SCREENS` comment

**Contexts** (`context/`):
- `AuthContext` - Authentication state with MMKV persistence
- Theme context in `theme/context.tsx` - Light/dark theme with `useAppTheme()` hook

**Components** (`components/`):
- Pre-built components: `Button`, `Card`, `Header`, `Icon`, `ListItem`, `Screen`, `Text`, `TextField`, `Toggle`
- Use `Text` from components, not from react-native (enforced by ESLint)

**Theme** (`theme/`):
- Design tokens: colors, spacing, typography
- Themed styles via `ThemedStyle<T>` type and `themed()` function from `useAppTheme()`

**Services** (`services/api/`):
- API client using apisauce
- Singleton instance exported as `api`

**i18n** (`i18n/`):
- i18next with react-i18next
- Supported languages: en, ar, es, fr, hi, ja, ko
- Use `translate()` for translations

**Storage** (`utils/storage/`):
- MMKV-based storage with helpers: `load`, `save`, `loadString`, `saveString`, `remove`, `clear`

### Development Tools

**Reactotron** - Configured in `app/devtools/`. Access via `console.tron` in development:
```typescript
if (__DEV__) {
  console.tron.log('Debug message')
}
```

### ESLint Rules to Note
- Use named imports from 'react' (not default React import)
- Use `SafeAreaView` from 'react-native-safe-area-context'
- Use custom `Text`, `Button`, `TextInput` from `@/components`
- Import order is enforced (react → react-native → expo → @/ aliases → relative)

## Claude Code Skills

Skills are specialized capabilities that can be invoked using `/skill-name` syntax. Available skills:

### `/frontend-design`
Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when:
- Building new React Native components, screens, or pages
- Designing UI layouts with polished aesthetics
- Creating web components for the app's web target
- Avoiding generic AI-generated aesthetics in favor of creative, professional designs

### `/code-review`
Code review agent that enforces Ignite React Native best practices. Runs as a background agent for thorough analysis without cluttering the main conversation.

**Usage**:
- `/code-review` - Review all changed files
- `/code-review staged` - Review git staged files
- `/code-review app/screens/` - Review specific directory
- `/code-review app/screens/HomeScreen.tsx` - Review specific file

**Categories checked**: Imports, Components, Styling, Navigation, i18n, Theme, Services, Testing, TypeScript

**Severity levels**:
- **ERRORS** - Must fix (banned imports, hardcoded values, missing wrappers)
- **WARNINGS** - Should fix (style conventions, best practices)
- **INFO** - Suggestions (improvements, optimizations)

## Custom Agents

Agents run in separate contexts for complex tasks. Available in `.claude/agents/`:

### `code-reviewer`
Specialized agent for Ignite code reviews. Can be invoked directly:
- "Use the code-reviewer agent to check my changes"
- "Have code-reviewer analyze app/screens/"
