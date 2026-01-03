import type { PropsWithChildren } from "react"
import type { StyleProp, ViewStyle } from "react-native"
import Animated, { Extrapolation, interpolate, useAnimatedStyle } from "react-native-reanimated"
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
  /**
   * Enable opacity fade during scroll animation (default: true for Twitter-style)
   */
  enableOpacity?: boolean
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
 * Supports Twitter/X-style scroll-driven animations with optional opacity fade.
 *
 * @example
 * ```tsx
 * <AnimatedHeader backgroundColor={colors.background} enableOpacity>
 *   <DrawerIconButton onPress={toggleDrawer} />
 * </AnimatedHeader>
 * ```
 */
export function AnimatedHeader(props: AnimatedHeaderProps) {
  const { children, style, backgroundColor, enableOpacity = true } = props
  const { top } = useSafeAreaInsets()
  const { tabBarProgress } = useTabBarVisibility()

  const totalHeight = HEADER_HEIGHT + top

  const animatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      tabBarProgress.value,
      [0, 1],
      [0, -totalHeight],
      Extrapolation.CLAMP,
    )

    const animStyle: { transform: { translateY: number }[]; opacity?: number } = {
      transform: [{ translateY }],
    }

    if (enableOpacity) {
      // X/Twitter-style opacity fade:
      // - Fully visible (1.0) when progress is 0
      // - Starts fading at 0.3 progress for smooth transition
      // - Reaches minimum (0.7) when fully hidden
      // This creates the "weighted" feel where the bar seems to have substance
      animStyle.opacity = interpolate(
        tabBarProgress.value,
        [0, 0.3, 0.7, 1],
        [1, 0.98, 0.85, 0.7],
        Extrapolation.CLAMP,
      )
    }

    return animStyle
  }, [totalHeight, enableOpacity])

  return (
    <Animated.View style={[$container, { paddingTop: top, backgroundColor }, style, animatedStyle]}>
      {children}
    </Animated.View>
  )
}
