import { useEffect } from "react"
import type { ImageStyle, StyleProp, ViewStyle } from "react-native"
import { Image, View } from "react-native"
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated"

import type { IconTypes } from "@/components/Icon"
import { iconRegistry } from "@/components/Icon"

/** Animation timing durations (ms) */
const ANIMATION_DURATION_FAST = 40
const ANIMATION_DURATION_NORMAL = 200

/** Scale factors for press and bounce animations */
const PRESS_SCALE = 0.92
const BOUNCE_SCALE = 1.15

/**
 * Spring configuration for the bounce effect.
 * High stiffness (350) creates a snappy response.
 * Low damping (12) allows for visible overshoot.
 */
const BOUNCE_SPRING = {
  damping: 12,
  stiffness: 350,
  mass: 0.8,
  overshootClamping: false,
}

/**
 * Settle spring - slightly more damped for the final position
 */
const SETTLE_SPRING = {
  damping: 18,
  stiffness: 350,
  mass: 0.8,
  overshootClamping: false,
}

interface AnimatedTabIconProps {
  /** The outline (inactive) icon */
  icon: IconTypes
  /** The filled (active) icon - if not provided, uses opacity only */
  filledIcon?: IconTypes
  /** Whether this tab is currently focused */
  focused: boolean
  /** Icon tint color */
  color: string
  /** Icon size (default: 30) */
  size?: number
  /** Style overrides for the icon image */
  style?: StyleProp<ImageStyle>
  /** Style overrides for the container */
  containerStyle?: StyleProp<ViewStyle>
}

/**
 * An animated tab bar icon with X/Twitter-style animations:
 * 1. Push-scale bounce on tap (0.95 → 1.1 → 1.0)
 * 2. Symbol morphing (outline → filled crossfade)
 *
 * @example
 * ```tsx
 * <AnimatedTabIcon
 *   icon="components"
 *   filledIcon="componentsFilled"
 *   focused={focused}
 *   color={focused ? colors.tint : colors.tintInactive}
 *   size={30}
 * />
 * ```
 */
export function AnimatedTabIcon(props: AnimatedTabIconProps) {
  const {
    icon,
    filledIcon,
    focused,
    color,
    size = 30,
    style: $imageStyleOverride,
    containerStyle: $containerStyleOverride,
  } = props

  // Shared values for animations
  const scale = useSharedValue(1)
  const fillProgress = useSharedValue(focused ? 1 : 0)
  const wasFocused = useSharedValue(focused)

  // Handle focus changes - trigger animations when tab becomes active
  useEffect(() => {
    // Animate fill transition
    fillProgress.value = withTiming(focused ? 1 : 0, { duration: ANIMATION_DURATION_NORMAL })

    // Only trigger bounce when becoming focused (not when losing focus)
    if (focused && !wasFocused.value) {
      // Bounce animation: overshoot then settle (press-down already happened via onTouchStart)
      scale.value = withSequence(
        withSpring(BOUNCE_SCALE, BOUNCE_SPRING), // Overshoot
        withSpring(1.0, SETTLE_SPRING), // Settle
      )
    }

    wasFocused.value = focused
  }, [focused, fillProgress, scale, wasFocused])

  // Touch handlers - these don't block the tab bar's touch responder
  const handleTouchStart = () => {
    scale.value = withTiming(PRESS_SCALE, { duration: ANIMATION_DURATION_FAST })
  }

  const handleTouchEnd = () => {
    // Only spring back if not becoming focused (useEffect handles focused case)
    if (!focused) {
      scale.value = withSpring(1.0, SETTLE_SPRING)
    }
  }

  // Animated style for the container (scale transform)
  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  // Animated style for the outline icon (fades out when active)
  const outlineAnimatedStyle = useAnimatedStyle(() => ({
    opacity: filledIcon ? interpolate(fillProgress.value, [0, 1], [1, 0]) : 1,
  }))

  // Animated style for the filled icon (fades in when active)
  const filledAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(fillProgress.value, [0, 1], [0, 1]),
  }))

  const $imageStyle: ImageStyle = {
    width: size,
    height: size,
    resizeMode: "contain",
    tintColor: color,
  }

  const $container: ViewStyle = {
    width: size,
    height: size,
    justifyContent: "center",
    alignItems: "center",
  }

  const $absoluteOverlay: ViewStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  }

  return (
    <View onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <Animated.View style={[$container, $containerStyleOverride, animatedContainerStyle]}>
        {/* Outline icon - always rendered, fades out when focused */}
        <Animated.View style={outlineAnimatedStyle}>
          <Image source={iconRegistry[icon]} style={[$imageStyle, $imageStyleOverride]} />
        </Animated.View>

        {/* Filled icon - only rendered if provided, fades in when focused */}
        {filledIcon && (
          <Animated.View style={[$absoluteOverlay, filledAnimatedStyle]}>
            <Image source={iconRegistry[filledIcon]} style={[$imageStyle, $imageStyleOverride]} />
          </Animated.View>
        )}
      </Animated.View>
    </View>
  )
}
