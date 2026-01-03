import { createContext, useCallback, useContext, useMemo, type PropsWithChildren } from "react"
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native"
import {
  Extrapolation,
  interpolate,
  useAnimatedReaction,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  type SharedValue,
  type WithSpringConfig,
} from "react-native-reanimated"

import { HEADER_HEIGHT, TAB_BAR_HEIGHT } from "@/navigators/constants"

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

/**
 * Hook that returns animated styles for header that hides on scroll.
 * Uses the same progress value as the tab bar so they animate together.
 *
 * @example
 * ```tsx
 * const { animatedHeaderStyle } = useAnimatedHeaderStyle(top)
 *
 * return (
 *   <Animated.View style={[styles.header, animatedHeaderStyle]}>
 *     <HeaderContent />
 *   </Animated.View>
 * )
 * ```
 */
export function useAnimatedHeaderStyle(topInset: number) {
  const { tabBarProgress } = useTabBarVisibility()

  const totalHeight = HEADER_HEIGHT + topInset

  // Animate header upward (negative translateY) when hiding
  const animatedHeaderStyle = useAnimatedStyle(() => {
    const translateY = interpolate(tabBarProgress.value, [0, 1], [0, -totalHeight])

    return {
      transform: [{ translateY }],
    }
  }, [totalHeight])

  // For content that needs to adjust its top padding when header hides
  const animatedTopPaddingStyle = useAnimatedStyle(() => {
    const paddingTop = interpolate(tabBarProgress.value, [0, 1], [totalHeight, topInset])

    return {
      paddingTop,
    }
  }, [totalHeight, topInset])

  return {
    animatedHeaderStyle,
    animatedTopPaddingStyle,
    tabBarProgress,
  }
}

// ============================================================================
// Twitter/X-Style Scroll-Driven Animation (2026 Style)
// ============================================================================

/**
 * Creates velocity-sensitive spring config.
 * Faster scrolls = snappier animations (higher stiffness, more damping)
 * Slower scrolls = softer animations (lower stiffness, less damping)
 */
function getVelocitySensitiveSpring(velocity: number): WithSpringConfig {
  "worklet"
  const absVelocity = Math.abs(velocity)

  // Normalize velocity to 0-1 range (0-2000 pixels/sec typical range)
  const normalizedVelocity = Math.min(absVelocity / 2000, 1)

  return {
    // Fast scroll: damping 25, slow scroll: damping 15
    damping: 15 + normalizedVelocity * 10,
    // Fast scroll: stiffness 400, slow scroll: stiffness 200
    stiffness: 200 + normalizedVelocity * 200,
    // Fast scroll: lighter mass 0.6, slow scroll: heavier mass 1.0
    mass: 1.0 - normalizedVelocity * 0.4,
    // Allow slight overshoot for natural feel
    overshootClamping: false,
  }
}

/** Default spring config for settle animation when no velocity info available */
const DEFAULT_SPRING_CONFIG: WithSpringConfig = {
  damping: 18,
  stiffness: 280,
  mass: 0.9,
  overshootClamping: false,
}

/** Spring config for rubber band bounce at edges */
const RUBBER_BAND_SPRING: WithSpringConfig = {
  damping: 12,
  stiffness: 180,
  mass: 0.7,
  overshootClamping: false,
}

interface UseScrollDrivenBarsOptions {
  /** Minimum scroll offset before hiding starts (default: 50) */
  threshold?: number
  /** Minimum delta to trigger direction change (warm-up threshold, default: 8) */
  directionChangeThreshold?: number
  /** Enable velocity-sensitive spring animations (default: true) */
  velocitySensitive?: boolean
  /** Enable rubber band effect at top edge (default: true) */
  rubberBandEnabled?: boolean
}

/**
 * Twitter/X-style scroll-driven animation hook (2026 style).
 *
 * Implements the modern "slowly appearing" effect where bars follow finger
 * movement with physics-based interpolation, not instant toggles.
 *
 * **IMPORTANT:** This hook returns a worklet-based scroll handler that only works with
 * Animated scroll components (e.g., `Animated.FlatList`, `Animated.ScrollView`).
 * For regular ScrollView/FlatList/SectionList, use `useHideTabBarOnScroll` instead.
 *
 * Key behaviors:
 * - **Scroll-Driven Interpolation**: Bar visibility maps 1:1 to finger movement
 * - **Direction Change Warm-up**: Small threshold before responding to direction changes
 * - **Velocity-Sensitive Springs**: Faster scrolls = snappier settle animations
 * - **Rubber Band Elasticity**: Slight overshoot at top before settling
 * - **Opacity Fading**: Linear opacity interpolation during movement
 *
 * @example
 * ```tsx
 * const { scrollHandler } = useScrollDrivenBars()
 *
 * return (
 *   <Animated.FlatList
 *     onScroll={scrollHandler}
 *     scrollEventThrottle={16}
 *     // ... rest of props
 *   />
 * )
 * ```
 */
export function useScrollDrivenBars(options: UseScrollDrivenBarsOptions = {}) {
  const {
    threshold = 50,
    directionChangeThreshold = 8,
    velocitySensitive = true,
    rubberBandEnabled = true,
  } = options

  const { tabBarProgress } = useTabBarVisibility()

  // Internal tracking values (all run on UI thread)
  const prevScrollY = useSharedValue(0)
  const isUserScrolling = useSharedValue(false)
  const lastVelocity = useSharedValue(0)

  // Direction tracking for warm-up effect
  const currentDirection = useSharedValue<"up" | "down" | "none">("none")
  const directionAccumulator = useSharedValue(0)

  // Combined height for 1:1 pixel mapping
  const barHeight = TAB_BAR_HEIGHT + HEADER_HEIGHT

  const scrollHandler = useAnimatedScrollHandler({
    onBeginDrag: () => {
      "worklet"
      isUserScrolling.value = true
      // Reset direction tracking on new gesture
      currentDirection.value = "none"
      directionAccumulator.value = 0
    },

    onScroll: (event) => {
      "worklet"
      const currentY = event.contentOffset.y
      const contentHeight = event.contentSize.height
      const layoutHeight = event.layoutMeasurement.height
      const maxScroll = contentHeight - layoutHeight
      const velocity = event.velocity?.y ?? 0

      // Store velocity for settle animation
      lastVelocity.value = velocity

      // Calculate delta since last frame
      const delta = currentY - prevScrollY.value

      // Skip tiny movements (noise filtering)
      if (Math.abs(delta) < 0.5) {
        prevScrollY.value = currentY
        return
      }

      // Determine intended direction
      const intendedDirection = delta < 0 ? "up" : "down"

      // === DIRECTION CHANGE WARM-UP ===
      // When direction changes, accumulate delta until threshold is met
      // This prevents jittery fingers from causing accidental triggers
      if (intendedDirection !== currentDirection.value && currentDirection.value !== "none") {
        // Direction changed - start accumulating
        directionAccumulator.value += Math.abs(delta)

        if (directionAccumulator.value < directionChangeThreshold) {
          // Haven't hit threshold yet - don't respond
          prevScrollY.value = currentY
          return
        }

        // Threshold met - commit to new direction
        currentDirection.value = intendedDirection
        directionAccumulator.value = 0
      } else if (currentDirection.value === "none") {
        // First scroll after drag start
        currentDirection.value = intendedDirection
      } else {
        // Same direction - reset accumulator
        directionAccumulator.value = 0
      }

      // === EDGE HANDLING ===
      // At the very top - rubber band effect
      if (currentY <= 0) {
        if (rubberBandEnabled && tabBarProgress.value !== 0) {
          // Rubber band: spring to 0 with slight overshoot
          tabBarProgress.value = withSpring(0, RUBBER_BAND_SPRING)
        } else if (tabBarProgress.value !== 0) {
          tabBarProgress.value = withSpring(0, DEFAULT_SPRING_CONFIG)
        }
        prevScrollY.value = currentY
        currentDirection.value = "none"
        return
      }

      // At the very bottom (bounce area) - don't change state
      if (currentY >= maxScroll) {
        prevScrollY.value = currentY
        return
      }

      // === SCROLL-DRIVEN INTERPOLATION ===
      // Bar visibility maps directly to finger movement distance
      if (delta < 0) {
        // SCROLL UP: Bars appear proportionally
        // The "slow appear" effect - bar follows finger at 1:1 ratio
        const progressDelta = delta / barHeight
        const newProgress = tabBarProgress.value + progressDelta
        tabBarProgress.value = Math.max(0, newProgress)
      } else if (delta > 0 && currentY > threshold) {
        // SCROLL DOWN: Bars hide proportionally (only after threshold)
        const progressDelta = delta / barHeight
        const newProgress = tabBarProgress.value + progressDelta
        tabBarProgress.value = Math.min(1, newProgress)
      }

      prevScrollY.value = currentY
    },

    onEndDrag: (event) => {
      "worklet"
      isUserScrolling.value = false

      const velocity = event.velocity?.y ?? 0
      const absVelocity = Math.abs(velocity)

      // Check if momentum scroll will follow
      if (absVelocity < 100) {
        // No significant momentum - settle immediately with velocity-sensitive spring
        const targetValue = tabBarProgress.value > 0.5 ? 1 : 0
        const springConfig = velocitySensitive
          ? getVelocitySensitiveSpring(lastVelocity.value)
          : DEFAULT_SPRING_CONFIG
        tabBarProgress.value = withSpring(targetValue, springConfig)
      }

      // Reset direction tracking
      currentDirection.value = "none"
      directionAccumulator.value = 0
    },

    onMomentumEnd: () => {
      "worklet"
      // Settle to nearest state with velocity-sensitive spring
      const targetValue = tabBarProgress.value > 0.5 ? 1 : 0
      const springConfig = velocitySensitive
        ? getVelocitySensitiveSpring(lastVelocity.value)
        : DEFAULT_SPRING_CONFIG
      tabBarProgress.value = withSpring(targetValue, springConfig)

      // Reset direction tracking
      currentDirection.value = "none"
      directionAccumulator.value = 0
    },
  })

  return {
    scrollHandler,
    tabBarProgress,
    isUserScrolling,
    currentDirection,
  }
}

/**
 * Hook that returns animated styles with opacity support for scroll-driven animations.
 * Use this with AnimatedTabBar/AnimatedHeader for Twitter-style fade effects.
 *
 * @example
 * ```tsx
 * const { animatedBarStyle } = useAnimatedBarStyle(totalHeight, 'down')
 * // Returns { transform: [{ translateY }], opacity }
 * ```
 */
export function useAnimatedBarStyle(
  totalHeight: number,
  direction: "up" | "down",
  enableOpacity = true,
) {
  const { tabBarProgress } = useTabBarVisibility()

  const animatedBarStyle = useAnimatedStyle(() => {
    // For tab bar (direction = 'down'): translate down to hide
    // For header (direction = 'up'): translate up to hide
    const translateY = interpolate(
      tabBarProgress.value,
      [0, 1],
      [0, direction === "down" ? totalHeight : -totalHeight],
      Extrapolation.CLAMP,
    )

    const baseStyle: { transform: { translateY: number }[]; opacity?: number } = {
      transform: [{ translateY }],
    }

    if (enableOpacity) {
      // X/Twitter-style opacity fade:
      // - Fully visible (1.0) when progress is 0
      // - Starts fading at 0.3 progress for smooth transition
      // - Reaches minimum (0.7) when fully hidden
      // This creates the "weighted" feel where the bar seems to have substance
      baseStyle.opacity = interpolate(
        tabBarProgress.value,
        [0, 0.3, 0.7, 1],
        [1, 0.98, 0.85, 0.7],
        Extrapolation.CLAMP,
      )
    }

    return baseStyle
  }, [totalHeight, direction, enableOpacity])

  return {
    animatedBarStyle,
    tabBarProgress,
  }
}
