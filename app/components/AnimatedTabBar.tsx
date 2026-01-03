import type { ViewStyle } from "react-native"
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs"
import { BottomTabBar } from "@react-navigation/bottom-tabs"
import Animated, { Extrapolation, interpolate, useAnimatedStyle } from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { useTabBarVisibility } from "@/context/TabBarVisibilityContext"
import { TAB_BAR_HEIGHT } from "@/navigators/constants"

const $container: ViewStyle = {
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
}

interface AnimatedTabBarProps extends BottomTabBarProps {
  /** Enable opacity fade during scroll animation (default: true for Twitter-style) */
  enableOpacity?: boolean
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
  const { enableOpacity = true, ...tabBarProps } = props
  const { bottom } = useSafeAreaInsets()
  const { tabBarProgress } = useTabBarVisibility()

  const totalHeight = TAB_BAR_HEIGHT + bottom

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

  return (
    <Animated.View style={[$container, animatedStyle]}>
      <BottomTabBar {...tabBarProps} />
    </Animated.View>
  )
}
