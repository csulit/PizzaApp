---
name: ignite-testing
description: Guide for writing tests in Ignite React Native apps using Jest and React Native Testing Library. Use when writing unit tests, component tests, integration tests, or setting up mocks. Triggers on test creation, test debugging, mocking setup, and test configuration.
---

# Ignite Testing Guide

This skill provides guidance on testing in Ignite apps using Jest and React Native Testing Library.

## Test Commands

```bash
# Run all tests
pnpm run test

# Watch mode (re-run on changes)
pnpm run test:watch

# Run single test file
npx jest path/to/test.ts

# Run tests matching pattern
npx jest --testNamePattern="should render"

# Run with coverage
npx jest --coverage
```

## Directory Structure

```
test/
├── setup.ts          # Jest setup with global mocks
├── mockFile.ts       # Mock for image assets
├── i18n.test.ts      # Global i18n key validation test
└── test-tsconfig.json

app/
├── components/
│   └── Text.test.tsx      # Component test (co-located)
├── services/api/
│   └── apiProblem.test.ts # Service test (co-located)
└── utils/storage/
    └── storage.test.ts    # Utility test (co-located)
```

## Test File Naming

- Place tests next to source files: `Component.tsx` → `Component.test.tsx`
- Use `.test.ts` for pure logic, `.test.tsx` for components
- Global tests go in `test/` directory

## Component Testing Pattern

```tsx
import { NavigationContainer } from "@react-navigation/native"
import { render, fireEvent, waitFor } from "@testing-library/react-native"

import { MyComponent } from "./MyComponent"
import { ThemeProvider } from "@/theme/context"

// Wrapper with required providers
const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      <NavigationContainer>
        {component}
      </NavigationContainer>
    </ThemeProvider>
  )
}

describe("MyComponent", () => {
  it("renders correctly", () => {
    const { getByText } = renderWithProviders(<MyComponent title="Hello" />)
    expect(getByText("Hello")).toBeDefined()
  })

  it("handles press events", () => {
    const onPress = jest.fn()
    const { getByTestId } = renderWithProviders(
      <MyComponent onPress={onPress} testID="my-button" />
    )

    fireEvent.press(getByTestId("my-button"))
    expect(onPress).toHaveBeenCalled()
  })
})
```

## Critical Rules

1. **Wrap with providers**: Components using theme/navigation need `ThemeProvider` and `NavigationContainer`
2. **Co-locate tests**: Place test files next to source files, not in separate test folders
3. **Use testID**: Add `testID` props for reliable element selection
4. **Mock external modules**: Use `test/setup.ts` for global mocks
5. **Avoid implementation details**: Test behavior, not internal state

## Common Query Methods

| Method | Use Case |
|--------|----------|
| `getByText` | Find by visible text |
| `getByTestId` | Find by testID prop |
| `getByRole` | Find by accessibility role |
| `getByPlaceholderText` | Find input by placeholder |
| `queryByText` | Check if element exists (returns null if not found) |
| `findByText` | Async find (waits for element) |

## Mocking Patterns

### Mock a Module

```typescript
// In your test file
jest.mock("@/services/api", () => ({
  api: {
    get: jest.fn().mockResolvedValue({ ok: true, data: [] }),
  },
}))
```

### Mock Navigation

```typescript
const mockNavigate = jest.fn()
jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: () => ({ navigate: mockNavigate }),
}))
```

### Mock Async Storage/MMKV

```typescript
jest.mock("@/utils/storage", () => ({
  load: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
}))
```

## Async Testing

```tsx
import { render, waitFor } from "@testing-library/react-native"

it("loads data asynchronously", async () => {
  const { getByText, findByText } = renderWithProviders(<DataComponent />)

  // Initially shows loading
  expect(getByText("Loading...")).toBeDefined()

  // Wait for data to load
  const dataElement = await findByText("Loaded Data")
  expect(dataElement).toBeDefined()
})

it("handles async actions", async () => {
  const { getByTestId } = renderWithProviders(<FormComponent />)

  fireEvent.press(getByTestId("submit-button"))

  await waitFor(() => {
    expect(mockSubmit).toHaveBeenCalled()
  })
})
```

## Pre-configured Mocks (test/setup.ts)

The setup file includes mocks for:
- `react-native` Image methods
- `i18next` translation functions
- `expo-localization` locale detection
- `app/i18n` module

## Additional Resources

- For detailed implementation, see [reference.md](reference.md)
- React Native Testing Library: https://callstack.github.io/react-native-testing-library/
- Jest docs: https://jestjs.io/docs/getting-started
