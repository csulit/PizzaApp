---
name: ignite-services
description: Guide for implementing API services using Ignite's services pattern. Use when creating API endpoints, HTTP requests, backend integrations, or data fetching. Triggers on API implementation, service creation, backend integration, data fetching.
---

# Ignite Services Guide

This skill provides guidance on implementing API services following Ignite's battle-tested patterns.

## Quick Reference

| File | Purpose |
|------|---------|
| `services/api/index.ts` | Main `Api` class with singleton instance |
| `services/api/types.ts` | TypeScript interfaces for API data shapes |
| `services/api/apiProblem.ts` | Standardized error handling |

## Critical Rules

1. **Use discriminated unions** for return types (`{ kind: "ok"; data } | GeneralApiProblem`)
2. **Handle all error states** using `getGeneralApiProblem()` before processing data
3. **Transform data in API methods** - convert raw responses to app-expected shapes
4. **Use the singleton** `api` instance from `@/services/api`
5. **Keep constructor lightweight** - configuration only, no heavy initialization

## Import Pattern

```tsx
import { api } from "@/services/api"
import type { GeneralApiProblem } from "@/services/api/apiProblem"
```

## Additional Resources

- For detailed implementation patterns, see [reference.md](reference.md)
- API service files: `app/services/api/`

## Common Patterns

### Adding a New API Method

```typescript
// In services/api/index.ts
async getPizzas(): Promise<{ kind: "ok"; pizzas: Pizza[] } | GeneralApiProblem> {
  const response: ApiResponse<PizzaListResponse> = await this.apisauce.get("pizzas")

  if (!response.ok) {
    const problem = getGeneralApiProblem(response)
    if (problem) return problem
  }

  try {
    const pizzas: Pizza[] = response.data?.pizzas ?? []
    return { kind: "ok", pizzas }
  } catch (e) {
    if (__DEV__ && e instanceof Error) {
      console.error(`Bad data: ${e.message}`, e.stack)
    }
    return { kind: "bad-data" }
  }
}
```

### Consuming API in Components

```typescript
const response = await api.getPizzas()
if (response.kind === "ok") {
  setPizzas(response.pizzas)
} else {
  // Handle error by kind
  if (response.temporary) {
    showToast("Network issue, please try again")
  } else {
    showToast("Failed to load pizzas")
  }
}
```

### POST/PUT/DELETE Requests

```typescript
async createOrder(order: CreateOrderRequest): Promise<{ kind: "ok"; order: Order } | GeneralApiProblem> {
  const response: ApiResponse<OrderResponse> = await this.apisauce.post("orders", order)

  if (!response.ok) {
    const problem = getGeneralApiProblem(response)
    if (problem) return problem
  }

  try {
    return { kind: "ok", order: response.data!.order }
  } catch (e) {
    if (__DEV__ && e instanceof Error) {
      console.error(`Bad data: ${e.message}`, e.stack)
    }
    return { kind: "bad-data" }
  }
}
```

## Error Handling Reference

| Kind | HTTP Status | Temporary | Description |
|------|-------------|-----------|-------------|
| `timeout` | - | Yes | Request timed out |
| `cannot-connect` | - | Yes | Network/connection error |
| `server` | 5xx | No | Server error |
| `unauthorized` | 401 | No | Not authenticated |
| `forbidden` | 403 | No | Not authorized |
| `not-found` | 404 | No | Resource not found |
| `rejected` | 4xx | No | Other client errors |
| `unknown` | - | Yes | Unexpected error |
| `bad-data` | - | No | Response parsing failed |
