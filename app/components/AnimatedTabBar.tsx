import type { ViewStyle } from "react-native"
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs"
import { BottomTabBar } from "@react-navigation/bottom-tabs"
import Animated, { interpolate, useAnimatedStyle } from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { useTabBarVisibility } from "@/context/TabBarVisibilityContext"
import { TAB_BAR_HEIGHT } from "@/navigators/constants"

const $container: ViewStyle = {
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
}

/**
 * An animated tab bar that hides when scrolling down and shows when scrolling up.
 * Uses the TabBarVisibilityContext for state management.
 *
 * @example
 * ```tsx
 * <Tab.Navigator
 *   tabBar={(props) => <AnimatedTabBar {...props} />}
 *   // ... other options
 * >
 * ```
 */
export function AnimatedTabBar(props: BottomTabBarProps) {
  const { bottom } = useSafeAreaInsets()
  const { tabBarProgress } = useTabBarVisibility()

  const totalHeight = TAB_BAR_HEIGHT + bottom

  const animatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(tabBarProgress.value, [0, 1], [0, totalHeight])

    return {
      transform: [{ translateY }],
    }
  }, [totalHeight])

  return (
    <Animated.View style={[$container, animatedStyle]}>
      <BottomTabBar {...props} />
    </Animated.View>
  )
}
