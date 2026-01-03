# Ignite Error Handling Reference

Complete documentation for error boundaries and crash reporting in Ignite apps.

---

## ErrorBoundary

**Purpose**: Class component that catches JavaScript errors in child components and displays a fallback UI instead of crashing the entire app.

**Location**: `app/screens/ErrorScreen/ErrorBoundary.tsx`

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `children` | `ReactNode` | Yes | Child components to render |
| `catchErrors` | `"always"` \| `"dev"` \| `"prod"` \| `"never"` | Yes | When to catch errors |

### catchErrors Options

| Value | Behavior |
|-------|----------|
| `"always"` | Catch errors in all environments |
| `"dev"` | Only catch errors when `__DEV__` is true |
| `"prod"` | Only catch errors when `__DEV__` is false |
| `"never"` | Never catch errors (errors will propagate) |

### State

| Property | Type | Description |
|----------|------|-------------|
| `error` | `Error \| null` | The caught error object |
| `errorInfo` | `ErrorInfo \| null` | React error info with component stack |

### Methods

| Method | Description |
|--------|-------------|
| `componentDidCatch(error, errorInfo)` | React lifecycle method called when an error is caught |
| `resetError()` | Clears error state to allow retry |
| `isEnabled()` | Returns whether error catching is enabled |

### Example

```tsx
import { ErrorBoundary } from "@/screens/ErrorScreen/ErrorBoundary"

function App() {
  return (
    <ErrorBoundary catchErrors="always">
      <MainNavigator />
    </ErrorBoundary>
  )
}
```

---

## ErrorDetails

**Purpose**: Fallback UI component displayed when an error is caught. Shows error message, component stack trace, and a reset button.

**Location**: `app/screens/ErrorScreen/ErrorDetails.tsx`

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `error` | `Error` | Yes | The caught error object |
| `errorInfo` | `ErrorInfo \| null` | Yes | React error info with component stack |
| `onReset` | `() => void` | Yes | Callback to reset error state |

### UI Elements

- **Icon**: Ladybug icon indicating an error occurred
- **Title**: Uses `errorScreen:title` translation key
- **Subtitle**: Uses `errorScreen:friendlySubtitle` translation key
- **Error Message**: Displays the error message in red
- **Stack Trace**: Scrollable component stack trace (selectable for copying)
- **Reset Button**: Calls `onReset` to attempt recovery

### Customizing the Error Screen

To customize the error UI, modify `ErrorDetails.tsx`:

```tsx
export function ErrorDetails(props: ErrorDetailsProps) {
  const { themed } = useAppTheme()

  return (
    <Screen preset="fixed" safeAreaEdges={["top", "bottom"]}>
      {/* Custom header */}
      <View style={$header}>
        <Icon icon="ladybug" size={64} />
        <Text preset="heading" tx="errorScreen:title" />
      </View>

      {/* Error details */}
      <ScrollView style={themed($errorSection)}>
        <Text weight="bold" text={`${props.error}`.trim()} />
        <Text selectable text={props.errorInfo?.componentStack ?? ""} />
      </ScrollView>

      {/* Action buttons */}
      <View style={$actions}>
        <Button tx="errorScreen:reset" onPress={props.onReset} />
        <Button tx="errorScreen:reportBug" onPress={reportBug} />
      </View>
    </Screen>
  )
}
```

---

## Crash Reporting Integration

**Purpose**: Report errors to monitoring services for production debugging.

### Recommended Services

- **Sentry** - Full-featured error tracking
- **Bugsnag** - Error monitoring with release tracking
- **Firebase Crashlytics** - Free crash reporting for Firebase apps
- **Honeybadger** - Developer-focused error monitoring

### Setup Pattern

Create `app/utils/crashReporting.ts`:

```tsx
import * as Sentry from "@sentry/react-native"

export function initCrashReporting() {
  if (!__DEV__) {
    Sentry.init({
      dsn: "YOUR_SENTRY_DSN",
      tracesSampleRate: 1.0,
    })
  }
}

export function reportError(error: Error, context?: Record<string, unknown>) {
  if (__DEV__) {
    console.error("Error:", error)
    return
  }

  Sentry.captureException(error, {
    extra: context,
  })
}
```

### Integrating with ErrorBoundary

Modify `componentDidCatch` in `ErrorBoundary.tsx`:

```tsx
import { reportError } from "@/utils/crashReporting"

componentDidCatch(error: Error, errorInfo: ErrorInfo) {
  if (!this.isEnabled()) return

  this.setState({ error, errorInfo })

  // Report to crash monitoring
  reportError(error, {
    componentStack: errorInfo.componentStack,
    // Add additional context
    screen: getCurrentRouteName(),
    userId: getCurrentUserId(),
  })
}
```

---

## i18n Keys

Add these translations to your `app/i18n/en.ts`:

```tsx
errorScreen: {
  title: "Something went wrong!",
  friendlySubtitle: "This is the screen your users will see in production when an error is thrown. You'll want to customize this message and probably the layout as well.",
  reset: "Reset App",
  // Optional additions
  reportBug: "Report Bug",
  tryAgain: "Try Again",
}
```

---

## Best Practices

### 1. Strategic Placement

Place ErrorBoundary around:
- The entire app (in `app.tsx`)
- Critical feature areas (payments, checkout)
- Experimental or third-party components
- Complex data-driven screens

```tsx
// App-level (already configured)
<ErrorBoundary catchErrors="always">
  <AppNavigator />
</ErrorBoundary>

// Feature-level
<ErrorBoundary catchErrors="always">
  <CheckoutFlow />
</ErrorBoundary>
```

### 2. Granular Error Handling

Use multiple boundaries for better UX:

```tsx
function DashboardScreen() {
  return (
    <Screen>
      <Header />

      {/* Widget errors don't crash the whole screen */}
      <ErrorBoundary catchErrors="always">
        <AnalyticsWidget />
      </ErrorBoundary>

      <ErrorBoundary catchErrors="always">
        <RecentOrdersWidget />
      </ErrorBoundary>
    </Screen>
  )
}
```

### 3. Development vs Production

```tsx
// Show full error details in dev, friendly message in prod
<ErrorBoundary catchErrors="always">
  {__DEV__ ? <DeveloperErrorView /> : <UserFriendlyErrorView />}
</ErrorBoundary>
```

### 4. Error Recovery

Implement retry logic in ErrorDetails:

```tsx
function ErrorDetails({ onReset, error }: ErrorDetailsProps) {
  const handleRetry = async () => {
    // Clear any cached state that might have caused the error
    await clearCache()

    // Reset the error boundary
    onReset()
  }

  return (
    <Screen>
      {/* ... */}
      <Button tx="errorScreen:tryAgain" onPress={handleRetry} />
    </Screen>
  )
}
```

---

## Limitations

1. **Cannot catch all errors**: Error boundaries do not catch:
   - Event handlers (use try/catch)
   - Asynchronous code (use `.catch()` or try/catch with async/await)
   - Server-side rendering
   - Errors in the error boundary itself

2. **Class component required**: Error boundaries must be class components due to React's `componentDidCatch` API.

### Handling Non-Boundary Errors

```tsx
// Event handlers - use try/catch
const handlePress = async () => {
  try {
    await submitForm()
  } catch (error) {
    reportError(error as Error)
    showErrorToast("Failed to submit")
  }
}

// Async operations - use .catch()
useEffect(() => {
  fetchData().catch((error) => {
    reportError(error)
    setErrorState(error)
  })
}, [])
```

---

## Testing Error Boundaries

```tsx
import { render, fireEvent } from "@testing-library/react-native"
import { ErrorBoundary } from "@/screens/ErrorScreen/ErrorBoundary"

const ThrowError = () => {
  throw new Error("Test error")
}

describe("ErrorBoundary", () => {
  it("catches errors and displays fallback UI", () => {
    const { getByText } = render(
      <ErrorBoundary catchErrors="always">
        <ThrowError />
      </ErrorBoundary>
    )

    expect(getByText(/something went wrong/i)).toBeTruthy()
  })

  it("resets error state when reset button is pressed", () => {
    // Test implementation
  })
})
```
