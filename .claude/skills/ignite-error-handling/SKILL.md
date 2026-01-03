---
name: ignite-error-handling
description: Guide for implementing error boundaries and crash reporting in Ignite React Native apps. Use when handling runtime errors, customizing error screens, integrating crash reporting services, or implementing graceful error recovery. Triggers on error handling, crash reporting, error boundary setup.
---

# Ignite Error Handling Guide

This skill provides guidance on using Ignite's error boundary pattern for catching and handling runtime errors gracefully.

## Quick Reference

| File | Purpose |
|------|---------|
| `ErrorBoundary.tsx` | Class component that catches JS errors in child components |
| `ErrorDetails.tsx` | Fallback UI displayed when an error is caught |
| `crashReporting.ts` | Utility for integrating crash reporting services (optional) |

## Critical Rules

1. **ErrorBoundary must be a Class Component** - React only supports `componentDidCatch` in class components
2. **Wrap critical screens/components** with ErrorBoundary to prevent full app crashes
3. **Configure `catchErrors` prop** appropriately: `"always"`, `"dev"`, `"prod"`, or `"never"`
4. **Integrate crash reporting** in `componentDidCatch` for production error monitoring
5. **Provide reset functionality** to allow users to recover from errors

## Import Pattern

```tsx
import { ErrorBoundary } from "@/screens/ErrorScreen/ErrorBoundary"
import { ErrorDetails } from "@/screens/ErrorScreen/ErrorDetails"
```

## Additional Resources

- For detailed props and examples, see [reference.md](reference.md)
- Error boundary source: `app/screens/ErrorScreen/`
- [React Error Boundaries Documentation](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)

## Common Patterns

### Basic Usage (App Root)

The ErrorBoundary is already configured in `app/app.tsx`:

```tsx
<ErrorBoundary catchErrors="always">
  <AppNavigator />
</ErrorBoundary>
```

### Environment-Specific Error Catching

```tsx
// Only catch in development
<ErrorBoundary catchErrors="dev">
  <ExperimentalFeature />
</ErrorBoundary>

// Only catch in production
<ErrorBoundary catchErrors="prod">
  <CriticalFeature />
</ErrorBoundary>
```

### Wrapping Critical Components

```tsx
function PaymentScreen() {
  return (
    <Screen preset="scroll">
      <ErrorBoundary catchErrors="always">
        <PaymentForm />
      </ErrorBoundary>
    </Screen>
  )
}
```

### Integrating Crash Reporting

Add to `componentDidCatch` in `ErrorBoundary.tsx`:

```tsx
componentDidCatch(error: Error, errorInfo: ErrorInfo) {
  if (!this.isEnabled()) return

  this.setState({ error, errorInfo })

  // Report to crash monitoring service
  if (!__DEV__) {
    // Sentry example
    Sentry.captureException(error, { extra: errorInfo })

    // Bugsnag example
    Bugsnag.notify(error, (event) => {
      event.addMetadata("react", { componentStack: errorInfo.componentStack })
    })

    // Crashlytics example
    crashlytics().recordError(error)
  }
}
```
