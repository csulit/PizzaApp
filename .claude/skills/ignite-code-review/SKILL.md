---
name: ignite-code-review
description: Code review agent enforcing Ignite React Native best practices. Use when reviewing PRs, auditing code quality, or validating patterns. Triggers on code review requests, PR reviews, pattern validation, lint-like checks.
invocation: /code-review
---

# Ignite Code Review Agent

This skill performs comprehensive code reviews enforcing Ignite boilerplate best practices, patterns, and conventions.

## How to Use

Invoke with `/code-review` followed by:
- A file path: `/code-review app/screens/HomeScreen.tsx`
- A directory: `/code-review app/screens/`
- "staged" for git staged files: `/code-review staged`
- "changed" for all changed files: `/code-review changed`
- No args to review entire `app/` directory: `/code-review`

## Review Categories

| Category | What It Checks |
|----------|----------------|
| **Imports** | Banned imports, import order, path aliases |
| **Components** | Correct component usage, required wrappers |
| **Styling** | $ prefix, ThemedStyle patterns, no StyleSheet.create |
| **Navigation** | Type registration, auth-based routing patterns |
| **i18n** | tx prop usage, translation key formats |
| **Theme** | Spacing constants, color usage, themed() function |
| **Services** | API error handling, discriminated unions |
| **Error Handling** | ErrorBoundary usage, catchErrors config, crash reporting |
| **Testing** | Test co-location, provider wrappers |
| **TypeScript** | Type safety, proper typing patterns |

## Severity Levels

- **ERROR** - Must fix before merge (violations of enforced rules)
- **WARNING** - Should fix (best practice deviations)
- **INFO** - Consider fixing (suggestions for improvement)

## Quick Rules Reference

### Critical (ERROR)

1. **No React Native Text/Button/TextInput** - Use `@/components`
2. **No RN SafeAreaView** - Use `react-native-safe-area-context`
3. **No default React import** - Use named imports
4. **Screens must use Screen component** - Required wrapper
5. **No StyleSheet.create()** - Use plain objects
6. **No hardcoded colors** - Use theme.colors
7. **No hardcoded spacing** - Use theme.spacing
8. **No console.tron in production** - Wrap in `__DEV__`

### Important (WARNING)

1. **Style names should start with $** - Convention: `$container`
2. **Prefer tx prop over text** - For i18n support
3. **Memoize button accessories** - Prevent flickering
4. **Use ThemedStyle for dynamic styles** - Theme-aware
5. **Colocate styles at file bottom** - Organization
6. **Tests should live next to source** - Co-location
7. **Use path aliases** - `@/` instead of relative

### Suggestions (INFO)

1. **Consider component presets** - Before custom styling
2. **Consider EmptyState** - For empty lists
3. **Consider typed navigation** - AppStackScreenProps
4. **Consider ErrorBoundary for critical components** - Graceful error recovery

## Output Format

```
## Code Review Results

### file/path.tsx

#### ERRORS (must fix)
- **Line 5**: Using `Text` from react-native. Use `Text` from `@/components` instead.
- **Line 23**: Hardcoded color `#FF0000`. Use `theme.colors.error` instead.

#### WARNINGS (should fix)
- **Line 45**: Style `container` should be prefixed with `$`. Rename to `$container`.

#### INFO (suggestions)
- **Line 67**: Consider using `tx` prop instead of `text` for i18n support.

### Summary
- Files reviewed: 3
- Errors: 2
- Warnings: 5
- Suggestions: 3
```

## Additional Resources

- For detailed violation patterns and fixes, see [reference.md](reference.md)
- ESLint config: `.eslintrc.js`
- All Ignite skills: `.claude/skills/`
