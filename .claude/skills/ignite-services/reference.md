# Ignite Services Reference

Complete documentation for implementing API services using Ignite's patterns.

---

## Architecture Overview

The services directory houses code for specific tasks, primarily API clients. Ignite uses **apisauce** (an Axios wrapper by Infinite Red) with a class-based singleton pattern.

```
app/services/
└── api/
    ├── index.ts        # Main Api class and singleton
    ├── types.ts        # TypeScript interfaces
    ├── apiProblem.ts   # Error handling utilities
    └── apiProblem.test.ts
```

---

## Api Class Structure

### Configuration

```typescript
// services/api/types.ts
export interface ApiConfig {
  url: string      // Base URL for API
  timeout: number  // Request timeout in ms
}
```

```typescript
// services/api/index.ts
import { ApiResponse, ApisauceInstance, create } from "apisauce"
import Config from "@/config"
import { GeneralApiProblem, getGeneralApiProblem } from "./apiProblem"
import type { ApiConfig } from "./types"

export const DEFAULT_API_CONFIG: ApiConfig = {
  url: Config.API_URL,
  timeout: 10000,
}

export class Api {
  apisauce: ApisauceInstance
  config: ApiConfig

  constructor(config: ApiConfig = DEFAULT_API_CONFIG) {
    this.config = config
    this.apisauce = create({
      baseURL: this.config.url,
      timeout: this.config.timeout,
      headers: {
        Accept: "application/json",
      },
    })
  }

  // API methods go here...
}

// Singleton instance
export const api = new Api()
```

---

## Adding API Methods

### Template for GET Requests

```typescript
async getItems(): Promise<{ kind: "ok"; items: Item[] } | GeneralApiProblem> {
  // 1. Make the request
  const response: ApiResponse<ItemsResponse> = await this.apisauce.get("items")

  // 2. Handle HTTP/network errors
  if (!response.ok) {
    const problem = getGeneralApiProblem(response)
    if (problem) return problem
  }

  // 3. Transform and validate data
  try {
    const items: Item[] = response.data?.items ?? []
    return { kind: "ok", items }
  } catch (e) {
    if (__DEV__ && e instanceof Error) {
      console.error(`Bad data: ${e.message}\n${response.data}`, e.stack)
    }
    return { kind: "bad-data" }
  }
}
```

### Template for GET Single Item

```typescript
async getItem(id: string): Promise<{ kind: "ok"; item: Item } | GeneralApiProblem> {
  const response: ApiResponse<ItemResponse> = await this.apisauce.get(`items/${id}`)

  if (!response.ok) {
    const problem = getGeneralApiProblem(response)
    if (problem) return problem
  }

  try {
    if (!response.data?.item) {
      return { kind: "bad-data" }
    }
    return { kind: "ok", item: response.data.item }
  } catch (e) {
    if (__DEV__ && e instanceof Error) {
      console.error(`Bad data: ${e.message}`, e.stack)
    }
    return { kind: "bad-data" }
  }
}
```

### Template for POST Requests

```typescript
async createItem(data: CreateItemRequest): Promise<{ kind: "ok"; item: Item } | GeneralApiProblem> {
  const response: ApiResponse<ItemResponse> = await this.apisauce.post("items", data)

  if (!response.ok) {
    const problem = getGeneralApiProblem(response)
    if (problem) return problem
  }

  try {
    if (!response.data?.item) {
      return { kind: "bad-data" }
    }
    return { kind: "ok", item: response.data.item }
  } catch (e) {
    if (__DEV__ && e instanceof Error) {
      console.error(`Bad data: ${e.message}`, e.stack)
    }
    return { kind: "bad-data" }
  }
}
```

### Template for PUT/PATCH Requests

```typescript
async updateItem(id: string, data: UpdateItemRequest): Promise<{ kind: "ok"; item: Item } | GeneralApiProblem> {
  const response: ApiResponse<ItemResponse> = await this.apisauce.put(`items/${id}`, data)

  if (!response.ok) {
    const problem = getGeneralApiProblem(response)
    if (problem) return problem
  }

  try {
    if (!response.data?.item) {
      return { kind: "bad-data" }
    }
    return { kind: "ok", item: response.data.item }
  } catch (e) {
    if (__DEV__ && e instanceof Error) {
      console.error(`Bad data: ${e.message}`, e.stack)
    }
    return { kind: "bad-data" }
  }
}
```

### Template for DELETE Requests

```typescript
async deleteItem(id: string): Promise<{ kind: "ok" } | GeneralApiProblem> {
  const response: ApiResponse<void> = await this.apisauce.delete(`items/${id}`)

  if (!response.ok) {
    const problem = getGeneralApiProblem(response)
    if (problem) return problem
  }

  return { kind: "ok" }
}
```

---

## Types Definition

### Defining Response Types

```typescript
// services/api/types.ts

// Request payload types
export interface CreatePizzaRequest {
  name: string
  description: string
  price: number
  toppings: string[]
}

export interface UpdatePizzaRequest {
  name?: string
  description?: string
  price?: number
  toppings?: string[]
}

// Domain model types
export interface Pizza {
  id: string
  name: string
  description: string
  price: number
  toppings: string[]
  imageUrl: string
  createdAt: string
}

// API response wrapper types
export interface PizzaResponse {
  pizza: Pizza
}

export interface PizzaListResponse {
  pizzas: Pizza[]
  total: number
  page: number
  limit: number
}

// Paginated request params
export interface PaginationParams {
  page?: number
  limit?: number
}
```

---

## Error Handling

### GeneralApiProblem Type

```typescript
// services/api/apiProblem.ts
export type GeneralApiProblem =
  | { kind: "timeout"; temporary: true }
  | { kind: "cannot-connect"; temporary: true }
  | { kind: "server" }
  | { kind: "unauthorized" }
  | { kind: "forbidden" }
  | { kind: "not-found" }
  | { kind: "rejected" }
  | { kind: "unknown"; temporary: true }
  | { kind: "bad-data" }
```

### Error Detection Function

```typescript
export function getGeneralApiProblem(response: ApiResponse<any>): GeneralApiProblem | null {
  switch (response.problem) {
    case "CONNECTION_ERROR":
    case "NETWORK_ERROR":
      return { kind: "cannot-connect", temporary: true }
    case "TIMEOUT_ERROR":
      return { kind: "timeout", temporary: true }
    case "SERVER_ERROR":
      return { kind: "server" }
    case "UNKNOWN_ERROR":
      return { kind: "unknown", temporary: true }
    case "CLIENT_ERROR":
      switch (response.status) {
        case 401:
          return { kind: "unauthorized" }
        case 403:
          return { kind: "forbidden" }
        case 404:
          return { kind: "not-found" }
        default:
          return { kind: "rejected" }
      }
    case "CANCEL_ERROR":
      return null
  }
  return null
}
```

---

## Consuming API in Components

### Basic Usage

```typescript
import { api } from "@/services/api"

async function loadPizzas() {
  const response = await api.getPizzas()

  if (response.kind === "ok") {
    setPizzas(response.pizzas)
  } else {
    handleError(response)
  }
}
```

### Error Handling Patterns

```typescript
function handleError(error: GeneralApiProblem) {
  switch (error.kind) {
    case "timeout":
    case "cannot-connect":
    case "unknown":
      // Temporary errors - suggest retry
      showToast("Network issue. Please check your connection and try again.")
      break

    case "unauthorized":
      // Redirect to login
      navigation.navigate("Login")
      break

    case "forbidden":
      showToast("You don't have permission to access this resource.")
      break

    case "not-found":
      showToast("The requested item was not found.")
      break

    case "server":
      showToast("Server error. Please try again later.")
      break

    case "rejected":
    case "bad-data":
      showToast("Something went wrong. Please try again.")
      break
  }
}
```

### With Loading States

```typescript
const [loading, setLoading] = useState(false)
const [error, setError] = useState<GeneralApiProblem | null>(null)
const [pizzas, setPizzas] = useState<Pizza[]>([])

async function loadPizzas() {
  setLoading(true)
  setError(null)

  const response = await api.getPizzas()

  if (response.kind === "ok") {
    setPizzas(response.pizzas)
  } else {
    setError(response)
  }

  setLoading(false)
}
```

---

## Advanced Patterns

### Adding Authentication Headers

```typescript
// In Api class constructor or separate method
setAuthToken(token: string) {
  this.apisauce.setHeader("Authorization", `Bearer ${token}`)
}

clearAuthToken() {
  this.apisauce.deleteHeader("Authorization")
}
```

### Request with Query Parameters

```typescript
async getPizzas(params?: PaginationParams): Promise<{ kind: "ok"; pizzas: Pizza[]; total: number } | GeneralApiProblem> {
  const response: ApiResponse<PizzaListResponse> = await this.apisauce.get("pizzas", params)

  if (!response.ok) {
    const problem = getGeneralApiProblem(response)
    if (problem) return problem
  }

  try {
    return {
      kind: "ok",
      pizzas: response.data?.pizzas ?? [],
      total: response.data?.total ?? 0,
    }
  } catch (e) {
    if (__DEV__ && e instanceof Error) {
      console.error(`Bad data: ${e.message}`, e.stack)
    }
    return { kind: "bad-data" }
  }
}
```

### File Upload

```typescript
async uploadImage(file: FormData): Promise<{ kind: "ok"; url: string } | GeneralApiProblem> {
  const response: ApiResponse<{ url: string }> = await this.apisauce.post("upload", file, {
    headers: { "Content-Type": "multipart/form-data" },
  })

  if (!response.ok) {
    const problem = getGeneralApiProblem(response)
    if (problem) return problem
  }

  try {
    if (!response.data?.url) {
      return { kind: "bad-data" }
    }
    return { kind: "ok", url: response.data.url }
  } catch (e) {
    if (__DEV__ && e instanceof Error) {
      console.error(`Bad data: ${e.message}`, e.stack)
    }
    return { kind: "bad-data" }
  }
}
```

### Response Transformers

```typescript
async getPizzas(): Promise<{ kind: "ok"; pizzas: Pizza[] } | GeneralApiProblem> {
  const response: ApiResponse<RawPizzaListResponse> = await this.apisauce.get("pizzas")

  if (!response.ok) {
    const problem = getGeneralApiProblem(response)
    if (problem) return problem
  }

  try {
    // Transform raw API data to app model
    const pizzas: Pizza[] = response.data?.items.map((raw) => ({
      id: raw.pizza_id,
      name: raw.pizza_name,
      description: raw.pizza_description,
      price: raw.price_cents / 100, // Convert cents to dollars
      toppings: raw.topping_list.split(","),
      imageUrl: raw.image_url,
      createdAt: new Date(raw.created_at).toISOString(),
    })) ?? []

    return { kind: "ok", pizzas }
  } catch (e) {
    if (__DEV__ && e instanceof Error) {
      console.error(`Bad data: ${e.message}`, e.stack)
    }
    return { kind: "bad-data" }
  }
}
```

---

## Testing API Methods

```typescript
// services/api/api.test.ts
import { Api } from "./index"
import { GeneralApiProblem } from "./apiProblem"

describe("Api", () => {
  let api: Api

  beforeEach(() => {
    api = new Api({ url: "https://api.test.com", timeout: 5000 })
  })

  it("returns pizzas on success", async () => {
    // Mock apisauce response
    jest.spyOn(api.apisauce, "get").mockResolvedValue({
      ok: true,
      data: { pizzas: [{ id: "1", name: "Margherita" }] },
    } as any)

    const result = await api.getPizzas()

    expect(result.kind).toBe("ok")
    if (result.kind === "ok") {
      expect(result.pizzas).toHaveLength(1)
    }
  })

  it("returns error on network failure", async () => {
    jest.spyOn(api.apisauce, "get").mockResolvedValue({
      ok: false,
      problem: "NETWORK_ERROR",
    } as any)

    const result = await api.getPizzas()

    expect(result.kind).toBe("cannot-connect")
    expect((result as GeneralApiProblem).temporary).toBe(true)
  })
})
```

---

## Environment Configuration

### Config Files

```typescript
// config/config.dev.ts
export default {
  API_URL: "https://api.dev.example.com/v1/",
}

// config/config.prod.ts
export default {
  API_URL: "https://api.example.com/v1/",
}

// config/index.ts
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

---

## Checklist for New API Methods

When adding a new API method:

- [ ] Define request/response types in `types.ts`
- [ ] Add method to `Api` class in `index.ts`
- [ ] Use correct HTTP method (`get`, `post`, `put`, `patch`, `delete`)
- [ ] Handle errors with `getGeneralApiProblem()`
- [ ] Transform raw data to app model if needed
- [ ] Return discriminated union (`{ kind: "ok"; ... } | GeneralApiProblem`)
- [ ] Add `__DEV__` error logging for data parsing failures
- [ ] Export new types if needed for consumers
