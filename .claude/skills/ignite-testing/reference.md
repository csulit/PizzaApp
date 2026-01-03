# Ignite Testing Reference

Detailed reference for testing in Ignite apps using Jest and React Native Testing Library.

## Jest Configuration

### jest.config.js

```javascript
/** @type {import('@jest/types').Config.ProjectConfig} */
module.exports = {
  preset: "jest-expo",
  setupFiles: ["<rootDir>/test/setup.ts"],
}
```

The `jest-expo` preset provides:
- React Native transformer configuration
- Asset mocking (images, fonts)
- Platform-specific module resolution
- TypeScript support via babel

### Custom Configuration Options

```javascript
module.exports = {
  preset: "jest-expo",
  setupFiles: ["<rootDir>/test/setup.ts"],

  // Add setup after env (for Testing Library)
  setupFilesAfterEnv: ["@testing-library/jest-native/extend-expect"],

  // Custom module paths
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/app/$1",
    "^@assets/(.*)$": "<rootDir>/assets/$1",
  },

  // Coverage configuration
  collectCoverageFrom: [
    "app/**/*.{ts,tsx}",
    "!app/**/*.d.ts",
    "!app/**/index.ts",
  ],

  // Test match patterns
  testMatch: ["**/*.test.ts", "**/*.test.tsx"],

  // Transform ignore patterns
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)",
  ],
}
```

## Test Setup (test/setup.ts)

### Full Setup File Reference

```typescript
// Always import react-native first
// eslint-disable-next-line no-restricted-imports
import * as ReactNative from "react-native"

import mockFile from "./mockFile"

// Mock react-native Image methods
jest.doMock("react-native", () => {
  return Object.setPrototypeOf(
    {
      Image: {
        ...ReactNative.Image,
        resolveAssetSource: jest.fn((_source) => mockFile),
        getSize: jest.fn(
          (
            uri: string,
            success: (width: number, height: number) => void,
            failure?: (_error: any) => void,
          ) => success(100, 100),
        ),
      },
    },
    ReactNative,
  )
})

// Mock i18next
jest.mock("i18next", () => ({
  currentLocale: "en",
  t: (key: string, params: Record<string, string>) => {
    return `${key} ${JSON.stringify(params)}`
  },
  translate: (key: string, params: Record<string, string>) => {
    return `${key} ${JSON.stringify(params)}`
  },
}))

// Mock expo-localization
jest.mock("expo-localization", () => ({
  ...jest.requireActual("expo-localization"),
  getLocales: () => [{ languageTag: "en-US", textDirection: "ltr" }],
}))

// Mock app i18n module
jest.mock("../app/i18n/index.ts", () => ({
  i18n: {
    isInitialized: true,
    language: "en",
    t: (key: string, params: Record<string, string>) => {
      return `${key} ${JSON.stringify(params)}`
    },
    numberToCurrency: jest.fn(),
  },
}))

declare global {
  let __TEST__: boolean
}
```

### Mock File (test/mockFile.ts)

```typescript
export default {
  height: 100,
  width: 100,
  scale: 2.0,
  uri: "https://placecats.com/200/200",
}
```

## Component Testing

### Basic Component Test

```tsx
import { render } from "@testing-library/react-native"
import { NavigationContainer } from "@react-navigation/native"

import { Button } from "./Button"
import { ThemeProvider } from "@/theme/context"

describe("Button", () => {
  const renderButton = (props = {}) => {
    return render(
      <ThemeProvider>
        <NavigationContainer>
          <Button text="Press Me" {...props} />
        </NavigationContainer>
      </ThemeProvider>
    )
  }

  it("renders text correctly", () => {
    const { getByText } = renderButton()
    expect(getByText("Press Me")).toBeDefined()
  })

  it("calls onPress when pressed", () => {
    const onPress = jest.fn()
    const { getByText } = renderButton({ onPress })

    fireEvent.press(getByText("Press Me"))
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it("is disabled when disabled prop is true", () => {
    const onPress = jest.fn()
    const { getByText } = renderButton({ onPress, disabled: true })

    fireEvent.press(getByText("Press Me"))
    expect(onPress).not.toHaveBeenCalled()
  })
})
```

### Testing with Theme Variants

```tsx
import { render } from "@testing-library/react-native"
import { ThemeProvider, useThemeContext } from "@/theme/context"

const TestWrapper = ({ children, isDark = false }) => (
  <ThemeProvider initialTheme={isDark ? "dark" : "light"}>
    <NavigationContainer>
      {children}
    </NavigationContainer>
  </ThemeProvider>
)

describe("ThemedComponent", () => {
  it("renders correctly in light mode", () => {
    const { getByTestId } = render(
      <TestWrapper isDark={false}>
        <ThemedComponent testID="themed" />
      </TestWrapper>
    )
    // Assert light mode styles
  })

  it("renders correctly in dark mode", () => {
    const { getByTestId } = render(
      <TestWrapper isDark={true}>
        <ThemedComponent testID="themed" />
      </TestWrapper>
    )
    // Assert dark mode styles
  })
})
```

### Testing Forms

```tsx
import { render, fireEvent, waitFor } from "@testing-library/react-native"

describe("LoginForm", () => {
  it("submits form with valid data", async () => {
    const onSubmit = jest.fn()
    const { getByPlaceholderText, getByTestId } = render(
      <TestWrapper>
        <LoginForm onSubmit={onSubmit} />
      </TestWrapper>
    )

    // Fill in form
    fireEvent.changeText(getByPlaceholderText("Email"), "test@example.com")
    fireEvent.changeText(getByPlaceholderText("Password"), "password123")

    // Submit
    fireEvent.press(getByTestId("submit-button"))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      })
    })
  })

  it("shows validation errors", async () => {
    const { getByTestId, findByText } = render(
      <TestWrapper>
        <LoginForm onSubmit={jest.fn()} />
      </TestWrapper>
    )

    // Submit without filling form
    fireEvent.press(getByTestId("submit-button"))

    // Wait for error message
    const errorMessage = await findByText("Email is required")
    expect(errorMessage).toBeDefined()
  })
})
```

### Testing Lists

```tsx
import { render } from "@testing-library/react-native"

describe("ItemList", () => {
  const mockItems = [
    { id: "1", title: "Item 1" },
    { id: "2", title: "Item 2" },
    { id: "3", title: "Item 3" },
  ]

  it("renders all items", () => {
    const { getAllByTestId } = render(
      <TestWrapper>
        <ItemList items={mockItems} />
      </TestWrapper>
    )

    const items = getAllByTestId(/^item-/)
    expect(items).toHaveLength(3)
  })

  it("renders empty state when no items", () => {
    const { getByText } = render(
      <TestWrapper>
        <ItemList items={[]} />
      </TestWrapper>
    )

    expect(getByText("No items found")).toBeDefined()
  })
})
```

## Service/Utility Testing

### API Service Tests

```typescript
import { ApiErrorResponse } from "apisauce"
import { getGeneralApiProblem } from "./apiProblem"

describe("API Problem Handler", () => {
  test("handles connection errors", () => {
    const response = { problem: "CONNECTION_ERROR" } as ApiErrorResponse<null>
    expect(getGeneralApiProblem(response)).toEqual({
      kind: "cannot-connect",
      temporary: true,
    })
  })

  test("handles timeout errors", () => {
    const response = { problem: "TIMEOUT_ERROR" } as ApiErrorResponse<null>
    expect(getGeneralApiProblem(response)).toEqual({
      kind: "timeout",
      temporary: true,
    })
  })

  test("handles 401 unauthorized", () => {
    const response = {
      problem: "CLIENT_ERROR",
      status: 401
    } as ApiErrorResponse<null>
    expect(getGeneralApiProblem(response)).toEqual({
      kind: "unauthorized",
    })
  })

  test("handles 404 not found", () => {
    const response = {
      problem: "CLIENT_ERROR",
      status: 404
    } as ApiErrorResponse<null>
    expect(getGeneralApiProblem(response)).toEqual({
      kind: "not-found",
    })
  })
})
```

### Storage Tests

```typescript
import { load, loadString, save, saveString, clear, remove, storage } from "."

describe("MMKV Storage", () => {
  beforeEach(() => {
    storage.clearAll()
  })

  it("saves and loads strings", () => {
    saveString("key", "value")
    expect(loadString("key")).toEqual("value")
  })

  it("saves and loads objects", () => {
    const obj = { foo: "bar", num: 42 }
    save("key", obj)
    expect(load("key")).toEqual(obj)
  })

  it("removes items", () => {
    saveString("key", "value")
    remove("key")
    expect(loadString("key")).toBeNull()
  })

  it("clears all data", () => {
    saveString("key1", "value1")
    saveString("key2", "value2")
    clear()
    expect(storage.getAllKeys()).toEqual([])
  })
})
```

## Mocking Patterns

### Mock Navigation

```typescript
const mockNavigate = jest.fn()
const mockGoBack = jest.fn()
const mockReset = jest.fn()

jest.mock("@react-navigation/native", () => {
  const actual = jest.requireActual("@react-navigation/native")
  return {
    ...actual,
    useNavigation: () => ({
      navigate: mockNavigate,
      goBack: mockGoBack,
      reset: mockReset,
    }),
    useRoute: () => ({
      params: { id: "123" },
    }),
    useFocusEffect: jest.fn(),
  }
})

beforeEach(() => {
  mockNavigate.mockClear()
  mockGoBack.mockClear()
})
```

### Mock API Calls

```typescript
import { api } from "@/services/api"

jest.mock("@/services/api", () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}))

const mockApi = api as jest.Mocked<typeof api>

describe("DataFetcher", () => {
  beforeEach(() => {
    mockApi.get.mockClear()
  })

  it("fetches data successfully", async () => {
    mockApi.get.mockResolvedValue({
      ok: true,
      data: [{ id: 1, name: "Item" }],
    })

    const result = await fetchItems()
    expect(result).toHaveLength(1)
    expect(mockApi.get).toHaveBeenCalledWith("/items")
  })

  it("handles API errors", async () => {
    mockApi.get.mockResolvedValue({
      ok: false,
      problem: "SERVER_ERROR",
    })

    await expect(fetchItems()).rejects.toThrow("Failed to fetch")
  })
})
```

### Mock Async Storage

```typescript
jest.mock("@/utils/storage", () => {
  let store: Record<string, any> = {}

  return {
    load: jest.fn((key: string) => store[key] ?? null),
    loadString: jest.fn((key: string) => store[key] ?? null),
    save: jest.fn((key: string, value: any) => { store[key] = value }),
    saveString: jest.fn((key: string, value: string) => { store[key] = value }),
    remove: jest.fn((key: string) => { delete store[key] }),
    clear: jest.fn(() => { store = {} }),
  }
})
```

### Mock Context

```typescript
const mockAuthContext = {
  isAuthenticated: true,
  user: { id: "1", email: "test@example.com" },
  login: jest.fn(),
  logout: jest.fn(),
}

jest.mock("@/context/AuthContext", () => ({
  useAuth: () => mockAuthContext,
  AuthProvider: ({ children }) => children,
}))

describe("ProtectedComponent", () => {
  it("shows content when authenticated", () => {
    const { getByText } = render(<ProtectedComponent />)
    expect(getByText("Welcome")).toBeDefined()
  })

  it("calls logout when button pressed", () => {
    const { getByTestId } = render(<ProtectedComponent />)
    fireEvent.press(getByTestId("logout-button"))
    expect(mockAuthContext.logout).toHaveBeenCalled()
  })
})
```

### Mock Timers

```typescript
describe("Debounced Search", () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it("debounces search input", () => {
    const onSearch = jest.fn()
    const { getByPlaceholderText } = render(
      <SearchInput onSearch={onSearch} debounceMs={300} />
    )

    const input = getByPlaceholderText("Search...")
    fireEvent.changeText(input, "test")

    // Not called immediately
    expect(onSearch).not.toHaveBeenCalled()

    // Fast forward time
    jest.advanceTimersByTime(300)

    expect(onSearch).toHaveBeenCalledWith("test")
  })
})
```

## i18n Test (Global Validation)

The `test/i18n.test.ts` file validates translation keys:

```typescript
import { exec } from "child_process"
import en from "../app/i18n/en"

// Keys to exclude from validation
const EXCEPTIONS: string[] = [
  "hello", // Used in code comments
]

function iterate(obj, stack, array) {
  for (const property in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, property)) {
      if (typeof obj[property] === "object") {
        iterate(obj[property], `${stack}.${property}`, array)
      } else {
        array.push(`${stack.slice(1)}.${property}`)
      }
    }
  }
  return array
}

describe("i18n", () => {
  test("There are no missing keys", (done) => {
    // Grep for tx="" and translate("") usage
    const command = `grep "[T\\|t]x=[{]\\?\\"\\S*\\"[}]\\?\\|translate(\\"\\S*\\"" -ohr './app' | grep -o "\\".*\\""`

    exec(command, (_, stdout) => {
      const allTranslationsDefined = iterate(en, "", [])
        .map((key) => key.replace(".", ":"))

      const allTranslationsUsed = stdout
        .replace(/"/g, "")
        .split("\n")
        .filter(Boolean)

      for (const key of allTranslationsUsed) {
        if (!EXCEPTIONS.includes(key)) {
          expect(allTranslationsDefined).toContainEqual(key)
        }
      }
      done()
    })
  }, 240000)
})
```

## Snapshot Testing

```tsx
import { render } from "@testing-library/react-native"

describe("Card", () => {
  it("matches snapshot", () => {
    const tree = render(
      <TestWrapper>
        <Card title="Title" description="Description" />
      </TestWrapper>
    ).toJSON()

    expect(tree).toMatchSnapshot()
  })
})
```

**Note**: Use snapshots sparingly. They're best for stable UI components.

## Testing Best Practices

### Do's

1. **Test behavior, not implementation**
   ```tsx
   // Good: Test what user sees
   expect(getByText("Welcome")).toBeDefined()

   // Bad: Test internal state
   expect(component.state.isLoading).toBe(false)
   ```

2. **Use meaningful test descriptions**
   ```typescript
   // Good
   it("shows error message when form validation fails")

   // Bad
   it("works correctly")
   ```

3. **Arrange-Act-Assert pattern**
   ```typescript
   it("increments counter", () => {
     // Arrange
     const { getByTestId, getByText } = render(<Counter />)

     // Act
     fireEvent.press(getByTestId("increment"))

     // Assert
     expect(getByText("1")).toBeDefined()
   })
   ```

4. **Clean up between tests**
   ```typescript
   beforeEach(() => {
     jest.clearAllMocks()
   })
   ```

### Don'ts

1. **Don't test implementation details**
2. **Don't use arbitrary timeouts**
   ```typescript
   // Bad
   await new Promise(r => setTimeout(r, 1000))

   // Good
   await waitFor(() => expect(element).toBeDefined())
   ```

3. **Don't test third-party libraries**
4. **Don't write tests that pass when they should fail**

## Debugging Tests

### Run Single Test

```bash
npx jest path/to/file.test.ts -t "test name"
```

### Debug Output

```typescript
import { render, screen } from "@testing-library/react-native"

it("debugs output", () => {
  render(<MyComponent />)
  screen.debug() // Prints component tree
})
```

### Check Coverage

```bash
npx jest --coverage --collectCoverageFrom="app/**/*.{ts,tsx}"
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Cannot find module" | Check moduleNameMapper in jest.config.js |
| "Invariant Violation" | Ensure components are wrapped in providers |
| Async tests timeout | Use `findBy*` queries or increase timeout |
| Mock not working | Check mock path matches import path exactly |
| Navigation errors | Wrap in NavigationContainer |
| Theme errors | Wrap in ThemeProvider |
