export interface ConfigBaseProps {
  persistNavigation: "always" | "dev" | "prod" | "never"
  catchErrors: "always" | "dev" | "prod" | "never"
  exitRoutes: string[]
  posthog: {
    apiKey: string
    host: string
  }
}

export type PersistNavigationConfig = ConfigBaseProps["persistNavigation"]

const BaseConfig: ConfigBaseProps = {
  // This feature is particularly useful in development mode, but
  // can be used in production as well if you prefer.
  persistNavigation: "dev",

  /**
   * Only enable if we're catching errors in the right environment
   */
  catchErrors: "always",

  /**
   * This is a list of all the route names that will exit the app if the back button
   * is pressed while in that screen. Only affects Android.
   */
  exitRoutes: ["Welcome"],

  /**
   * PostHog analytics configuration.
   * Set EXPO_PUBLIC_POSTHOG_API_KEY and EXPO_PUBLIC_POSTHOG_HOST in your .env file.
   * Get your API key from: https://app.posthog.com/project/settings
   */
  posthog: {
    apiKey: process.env.EXPO_PUBLIC_POSTHOG_API_KEY ?? "",
    host: process.env.EXPO_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
  },
}

export default BaseConfig
