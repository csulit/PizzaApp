import { useEffect, useMemo } from "react"
import type { ViewStyle } from "react-native"
import { Dimensions } from "react-native"
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs"
import { BottomTabBar } from "@react-navigation/bottom-tabs"
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { useTabBarVisibility } from "@/context/TabBarVisibilityContext"
import { TAB_BAR_HEIGHT } from "@/navigators/constants"
import { useAppTheme } from "@/theme/context"

const SCREEN_WIDTH = Dimensions.get("window").width

/** Indicator bar dimensions */
const INDICATOR_HEIGHT = 3
const INDICATOR_BORDER_RADIUS = INDICATOR_HEIGHT / 2

/**
 * Spring configuration for indicator slide animation.
 * Creates a smooth, slightly bouncy slide effect.
 */
const INDICATOR_SPRING = {
  damping: 20,
  stiffness: 300,
  mass: 0.8,
}

const $container: ViewStyle = {
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
}

interface AnimatedTabBarProps extends BottomTabBarProps {
  /** Enable opacity fade during scroll animation (default: true for Twitter-style) */
  enableOpacity?: boolean
  /** Enable sliding indicator beneath active tab (default: true for X-style) */
  enableIndicator?: boolean
  /** Width of the indicator bar (default: 24) */
  indicatorWidth?: number
}

/**
 * An animated tab bar that hides when scrolling down and shows when scrolling up.
 * Uses the TabBarVisibilityContext for state management.
 *
 * Supports Twitter/X-style scroll-driven animations with optional opacity fade.
 *
 * @example
 * ```tsx
 * <Tab.Navigator
 *   tabBar={(props) => <AnimatedTabBar {...props} enableOpacity />}
 *   // ... other options
 * >
 * ```
 */
export function AnimatedTabBar(props: AnimatedTabBarProps) {
  const {
    enableOpacity = true,
    enableIndicator = true,
    indicatorWidth = 24,
    ...tabBarProps
  } = props
  const { bottom } = useSafeAreaInsets()
  const { tabBarProgress } = useTabBarVisibility()
  const {
    theme: { colors },
  } = useAppTheme()

  const totalHeight = TAB_BAR_HEIGHT + bottom

  // Get current tab index from navigation state
  const tabCount = tabBarProps.state.routes.length
  const currentIndex = tabBarProps.state.index
  const tabWidth = SCREEN_WIDTH / tabCount

  // Shared value for indicator position
  const indicatorX = useSharedValue(currentIndex * tabWidth + tabWidth / 2 - indicatorWidth / 2)

  // Animate indicator when tab changes
  useEffect(() => {
    const targetX = currentIndex * tabWidth + tabWidth / 2 - indicatorWidth / 2
    indicatorX.value = withSpring(targetX, INDICATOR_SPRING)
  }, [currentIndex, tabWidth, indicatorWidth, indicatorX])

  const animatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      tabBarProgress.value,
      [0, 1],
      [0, totalHeight],
      Extrapolation.CLAMP,
    )

    const style: { transform: { translateY: number }[]; opacity?: number } = {
      transform: [{ translateY }],
    }

    if (enableOpacity) {
      // X/Twitter-style opacity fade:
      // - Fully visible (1.0) when progress is 0
      // - Starts fading at 0.3 progress for smooth transition
      // - Reaches minimum (0.7) when fully hidden
      // This creates the "weighted" feel where the bar seems to have substance
      style.opacity = interpolate(
        tabBarProgress.value,
        [0, 0.3, 0.7, 1],
        [1, 0.98, 0.85, 0.7],
        Extrapolation.CLAMP,
      )
    }

    return style
  }, [totalHeight, enableOpacity])

  // Animated style for the sliding indicator
  const indicatorAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
  }))

  const $indicator = useMemo(
    (): ViewStyle => ({
      position: "absolute",
      top: 0,
      left: 0,
      width: indicatorWidth,
      height: INDICATOR_HEIGHT,
      borderRadius: INDICATOR_BORDER_RADIUS,
      backgroundColor: colors.tint,
    }),
    [indicatorWidth, colors.tint],
  )

  return (
    <Animated.View style={[$container, animatedStyle]}>
      {enableIndicator && <Animated.View style={[$indicator, indicatorAnimatedStyle]} />}
      <BottomTabBar {...tabBarProps} />
    </Animated.View>
  )
}
