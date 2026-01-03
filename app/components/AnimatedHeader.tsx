import type { PropsWithChildren } from "react"
import type { StyleProp, ViewStyle } from "react-native"
import Animated, { useAnimatedStyle, interpolate } from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { useTabBarVisibility } from "@/context/TabBarVisibilityContext"
import { HEADER_HEIGHT } from "@/navigators/constants"

interface AnimatedHeaderProps extends PropsWithChildren {
  /**
   * Optional style for the container
   */
  style?: StyleProp<ViewStyle>
  /**
   * Background color for the header container
   */
  backgroundColor?: string
}

const $container: ViewStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  zIndex: 1,
}

/**
 * An animated header container that hides when scrolling down and shows when scrolling up.
 * Uses the TabBarVisibilityContext for state management, syncing with the tab bar animation.
 *
 * @example
 * ```tsx
 * <AnimatedHeader backgroundColor={colors.background}>
 *   <DrawerIconButton onPress={toggleDrawer} />
 * </AnimatedHeader>
 * ```
 */
export function AnimatedHeader(props: AnimatedHeaderProps) {
  const { children, style, backgroundColor } = props
  const { top } = useSafeAreaInsets()
  const { tabBarProgress } = useTabBarVisibility()

  const totalHeight = HEADER_HEIGHT + top

  const animatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(tabBarProgress.value, [0, 1], [0, -totalHeight])

    return {
      transform: [{ translateY }],
    }
  }, [totalHeight])

  return (
    <Animated.View style={[$container, { paddingTop: top, backgroundColor }, style, animatedStyle]}>
      {children}
    </Animated.View>
  )
}
