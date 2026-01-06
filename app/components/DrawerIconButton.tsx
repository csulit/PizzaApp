import type { PressableProps, ViewStyle } from "react-native"
import { Platform, Pressable } from "react-native"
import { useDrawerProgress } from "react-native-drawer-layout"
import Animated, { interpolate, interpolateColor, useAnimatedStyle } from "react-native-reanimated"

import { isRTL } from "@/i18n"
import { useAppTheme } from "@/theme/context"

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

/**
 * An animated hamburger menu button that transforms based on drawer open/close state.
 * The three bars animate into an X shape when the drawer is open.
 *
 * Must be used inside a Drawer component from react-native-drawer-layout.
 */
export function DrawerIconButton(props: PressableProps) {
  const { ...pressableProps } = props
  const progress = useDrawerProgress()
  const isWeb = Platform.OS === "web"
  const {
    theme: { colors },
  } = useAppTheme()

  // Container style (no horizontal slide - let the drawer handle positioning)
  const animatedContainerStyles = useAnimatedStyle(() => {
    return {}
  })

  // Top bar: rotates -45deg and changes color
  const animatedTopBarStyles = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(progress.value, [0, 1], [colors.text, colors.tint])
    const marginStart = interpolate(progress.value, [0, 1], [0, -11.5])
    const rotate = interpolate(progress.value, [0, 1], [0, isRTL ? 45 : -45])
    const marginBottom = interpolate(progress.value, [0, 1], [0, -2])
    const width = interpolate(progress.value, [0, 1], [18, 12])
    const marginHorizontal =
      isWeb && isRTL
        ? { marginRight: marginStart }
        : {
            marginLeft: marginStart,
          }

    return {
      ...marginHorizontal,
      backgroundColor,
      marginBottom,
      width,
      transform: [{ rotate: `${rotate}deg` }],
    }
  })

  // Middle bar: changes width and color
  const animatedMiddleBarStyles = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(progress.value, [0, 1], [colors.text, colors.tint])
    const width = interpolate(progress.value, [0, 1], [18, 16])

    return {
      backgroundColor,
      width,
    }
  })

  // Bottom bar: rotates +45deg and changes color
  const animatedBottomBarStyles = useAnimatedStyle(() => {
    const marginTop = interpolate(progress.value, [0, 1], [4, 2])
    const backgroundColor = interpolateColor(progress.value, [0, 1], [colors.text, colors.tint])
    const marginStart = interpolate(progress.value, [0, 1], [0, -11.5])
    const rotate = interpolate(progress.value, [0, 1], [0, isRTL ? -45 : 45])
    const width = interpolate(progress.value, [0, 1], [18, 12])
    const marginHorizontal =
      isWeb && isRTL
        ? { marginRight: marginStart }
        : {
            marginLeft: marginStart,
          }

    return {
      ...marginHorizontal,
      backgroundColor,
      width,
      marginTop,
      transform: [{ rotate: `${rotate}deg` }],
    }
  })

  return (
    <AnimatedPressable {...pressableProps} style={[$container, animatedContainerStyles]}>
      <Animated.View style={[$topBar, animatedTopBarStyles]} />
      <Animated.View style={[$middleBar, animatedMiddleBarStyles]} />
      <Animated.View style={[$bottomBar, animatedBottomBarStyles]} />
    </AnimatedPressable>
  )
}

const barHeight = 2

const $container: ViewStyle = {
  alignItems: "center",
  height: 56,
  justifyContent: "center",
  width: 56,
}

const $topBar: ViewStyle = {
  height: barHeight,
}

const $middleBar: ViewStyle = {
  height: barHeight,
  marginTop: 4,
}

const $bottomBar: ViewStyle = {
  height: barHeight,
}
