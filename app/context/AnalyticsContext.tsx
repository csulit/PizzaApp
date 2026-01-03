import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react"
import PostHog from "posthog-react-native"

import Config from "@/config"

import { useAuth } from "./AuthContext"

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }
type EventProperties = Record<string, JsonValue>

export type AnalyticsContextType = {
  track: (eventName: string, properties?: EventProperties) => void
  screen: (screenName: string, properties?: EventProperties) => void
  identify: (userId: string, properties?: EventProperties) => void
  reset: () => void
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null)

// No-op implementation when PostHog is not configured
const noopAnalytics: AnalyticsContextType = {
  track: () => {},
  screen: () => {},
  identify: () => {},
  reset: () => {},
}

export interface AnalyticsProviderProps {}

/**
 * Provides PostHog analytics functionality throughout the app.
 * Uses manual initialization to avoid React Navigation hook conflicts.
 *
 * Features:
 * - Automatic user identification on auth state changes
 * - Screen view tracking
 * - Custom event tracking
 */
export const AnalyticsProvider: FC<PropsWithChildren<AnalyticsProviderProps>> = ({ children }) => {
  const posthogRef = useRef<PostHog | null>(null)
  const { isAuthenticated, authEmail } = useAuth()

  const isConfigured = Config.posthog.apiKey.length > 0

  // Initialize PostHog once
  useEffect(() => {
    if (!isConfigured) {
      if (__DEV__) {
        console.warn(
          "[Analytics] PostHog is not configured. Set EXPO_PUBLIC_POSTHOG_API_KEY in .env",
        )
      }
      return
    }

    if (!posthogRef.current) {
      posthogRef.current = new PostHog(Config.posthog.apiKey, {
        host: Config.posthog.host,
        captureAppLifecycleEvents: true,
      })
    }
  }, [isConfigured])

  // Identify user when authenticated
  useEffect(() => {
    if (!posthogRef.current) return

    if (isAuthenticated && authEmail) {
      posthogRef.current.identify(authEmail, { email: authEmail })
    } else {
      posthogRef.current.reset()
    }
  }, [isAuthenticated, authEmail])

  const track = useCallback((eventName: string, properties?: EventProperties) => {
    posthogRef.current?.capture(eventName, properties)
  }, [])

  const screen = useCallback((screenName: string, properties?: EventProperties) => {
    posthogRef.current?.screen(screenName, properties)
  }, [])

  const identify = useCallback((userId: string, properties?: EventProperties) => {
    posthogRef.current?.identify(userId, properties)
  }, [])

  const reset = useCallback(() => {
    posthogRef.current?.reset()
  }, [])

  const value: AnalyticsContextType = isConfigured
    ? { track, screen, identify, reset }
    : noopAnalytics

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>
}

/**
 * Hook to access analytics functions.
 * Must be used within an AnalyticsProvider.
 *
 * @example
 * const { track, screen } = useAnalytics()
 * track('button_clicked', { button: 'submit' })
 * screen('HomeScreen')
 */
export const useAnalytics = () => {
  const context = useContext(AnalyticsContext)
  if (!context) throw new Error("useAnalytics must be used within an AnalyticsProvider")
  return context
}
