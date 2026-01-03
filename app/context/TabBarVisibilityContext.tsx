import { createContext, useCallback, useContext, useMemo, type PropsWithChildren } from "react"
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native"
import {
  interpolate,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from "react-native-reanimated"

import { TAB_BAR_HEIGHT } from "@/navigators/constants"

interface TabBarVisibilityContextValue {
  /** Animated value: 0 = visible, 1 = hidden */
  tabBarProgress: SharedValue<number>
  /** Call this to show the tab bar */
  showTabBar: () => void
  /** Call this to hide the tab bar */
  hideTabBar: () => void
}

const TabBarVisibilityContext = createContext<TabBarVisibilityContextValue | null>(null)

/**
 * Provider for tab bar visibility state.
 * Wrap your tab navigator with this to enable hide-on-scroll functionality.
 */
export function TabBarVisibilityProvider({ children }: PropsWithChildren) {
  // 0 = visible, 1 = hidden
  const tabBarProgress = useSharedValue(0)

  const showTabBar = useCallback(() => {
    tabBarProgress.value = withTiming(0, { duration: 250 })
  }, [tabBarProgress])

  const hideTabBar = useCallback(() => {
    tabBarProgress.value = withTiming(1, { duration: 200 })
  }, [tabBarProgress])

  const value = useMemo(
    () => ({
      tabBarProgress,
      showTabBar,
      hideTabBar,
    }),
    [tabBarProgress, showTabBar, hideTabBar],
  )

  return (
    <TabBarVisibilityContext.Provider value={value}>{children}</TabBarVisibilityContext.Provider>
  )
}

/**
 * Hook to access tab bar visibility controls.
 */
export function useTabBarVisibility() {
  const context = useContext(TabBarVisibilityContext)
  if (!context) {
    throw new Error("useTabBarVisibility must be used within a TabBarVisibilityProvider")
  }
  return context
}

interface UseHideTabBarOnScrollOptions {
  /** Minimum scroll offset before hiding starts (default: 50) */
  threshold?: number
  /** Minimum velocity to trigger hide/show (default: 0.5) */
  velocityThreshold?: number
}

/**
 * Hook that returns scroll event handlers to hide/show the tab bar based on scroll direction.
 *
 * @example
 * ```tsx
 * const { onScroll, onScrollBeginDrag, onScrollEndDrag } = useHideTabBarOnScroll()
 *
 * return (
 *   <FlatList
 *     onScroll={onScroll}
 *     onScrollBeginDrag={onScrollBeginDrag}
 *     onScrollEndDrag={onScrollEndDrag}
 *     scrollEventThrottle={16}
 *     // ... rest of props
 *   />
 * )
 * ```
 */
export function useHideTabBarOnScroll(options: UseHideTabBarOnScrollOptions = {}) {
  const { threshold = 50, velocityThreshold = 0.5 } = options
  const { tabBarProgress } = useTabBarVisibility()

  // Track scroll state
  const lastScrollY = useSharedValue(0)
  const isScrolling = useSharedValue(false)
  const scrollDirection = useSharedValue<"up" | "down" | null>(null)

  // React to scroll direction changes
  useAnimatedReaction(
    () => scrollDirection.value,
    (direction, prevDirection) => {
      if (direction !== prevDirection) {
        if (direction === "down") {
          tabBarProgress.value = withTiming(1, { duration: 200 })
        } else if (direction === "up") {
          tabBarProgress.value = withTiming(0, { duration: 250 })
        }
      }
    },
    [tabBarProgress],
  )

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const currentY = event.nativeEvent.contentOffset.y
      const velocity = event.nativeEvent.velocity?.y ?? 0
      const contentHeight = event.nativeEvent.contentSize.height
      const layoutHeight = event.nativeEvent.layoutMeasurement.height

      // Don't hide when at the very top
      if (currentY <= threshold) {
        scrollDirection.value = "up"
        lastScrollY.value = currentY
        return
      }

      // Don't hide when at the very bottom (bounce area)
      const maxScroll = contentHeight - layoutHeight
      if (currentY >= maxScroll - 10) {
        lastScrollY.value = currentY
        return
      }

      const diff = currentY - lastScrollY.value
      const hasSignificantMovement = Math.abs(diff) > 2

      if (hasSignificantMovement && isScrolling.value) {
        // Check velocity for more responsive feel
        if (velocity > velocityThreshold || diff > 10) {
          scrollDirection.value = "down"
        } else if (velocity < -velocityThreshold || diff < -10) {
          scrollDirection.value = "up"
        }
      }

      lastScrollY.value = currentY
    },
    [threshold, velocityThreshold, scrollDirection, lastScrollY, isScrolling],
  )

  const onScrollBeginDrag = useCallback(() => {
    isScrolling.value = true
  }, [isScrolling])

  const onScrollEndDrag = useCallback(() => {
    isScrolling.value = false
  }, [isScrolling])

  const onMomentumScrollEnd = useCallback(() => {
    isScrolling.value = false
  }, [isScrolling])

  return {
    onScroll,
    onScrollBeginDrag,
    onScrollEndDrag,
    onMomentumScrollEnd,
    tabBarProgress,
  }
}

/**
 * Hook that returns animated styles for bottom inset that adjusts based on tab bar visibility.
 *
 * @example
 * ```tsx
 * // For FlatList/ScrollView contentContainerStyle (use paddingBottom)
 * const { animatedPaddingStyle } = useAnimatedTabBarInset(bottom)
 * <Animated.FlatList contentContainerStyle={animatedPaddingStyle} />
 *
 * // For spacer View at end of scroll content (use height)
 * const { animatedSpacerStyle } = useAnimatedTabBarInset(bottom)
 * <Animated.View style={animatedSpacerStyle} />
 * ```
 */
export function useAnimatedTabBarInset(bottomInset: number) {
  const { tabBarProgress } = useTabBarVisibility()

  const totalHeight = TAB_BAR_HEIGHT + bottomInset

  // For contentContainerStyle with paddingBottom
  const animatedPaddingStyle = useAnimatedStyle(() => {
    // When tabBarProgress is 0 (visible), padding is full height
    // When tabBarProgress is 1 (hidden), padding is just the safe area
    const paddingBottom = interpolate(tabBarProgress.value, [0, 1], [totalHeight, bottomInset])

    return {
      paddingBottom,
    }
  }, [totalHeight, bottomInset])

  // For spacer View with height
  const animatedSpacerStyle = useAnimatedStyle(() => {
    // When tabBarProgress is 0 (visible), height is full tab bar height
    // When tabBarProgress is 1 (hidden), height is just the safe area
    const height = interpolate(tabBarProgress.value, [0, 1], [totalHeight, bottomInset])

    return {
      height,
    }
  }, [totalHeight, bottomInset])

  return {
    animatedPaddingStyle,
    animatedSpacerStyle,
    animatedContentStyle: animatedPaddingStyle, // alias for backward compat
    tabBarProgress,
  }
}
