import { useCallback, useState } from "react"
import { Pressable, View } from "react-native"
import type { ImageStyle, TextStyle, ViewStyle } from "react-native"
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated"

import type { Property } from "@/data/properties"
import { formatPrice, formatSqft, getPropertyTypeLabel } from "@/data/properties"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

import { Icon } from "./Icon"
import { Text } from "./Text"

interface PropertyCardProps {
  property: Property
  onPress?: (property: Property) => void
  onFavoritePress?: (property: Property) => void
  isFavorite?: boolean
}

export function PropertyCard({
  property,
  onPress,
  onFavoritePress,
  isFavorite = false,
}: PropertyCardProps) {
  const { themed, theme } = useAppTheme()
  const [imageLoaded, setImageLoaded] = useState(false)
  const favoriteValue = useSharedValue(isFavorite ? 1 : 0)

  const handlePress = useCallback(() => {
    onPress?.(property)
  }, [onPress, property])

  const handleFavoritePress = useCallback(() => {
    favoriteValue.value = withSpring(favoriteValue.value === 0 ? 1 : 0)
    onFavoritePress?.(property)
  }, [onFavoritePress, property, favoriteValue])

  const animatedHeartStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(favoriteValue.value, [0, 0.5, 1], [1, 1.3, 1], Extrapolation.CLAMP),
      },
    ],
  }))

  return (
    <Pressable style={themed($container)} onPress={handlePress}>
      <View style={$imageContainer}>
        <Animated.Image
          source={{ uri: property.imageUrl }}
          style={$image}
          resizeMode="cover"
          onLoad={() => setImageLoaded(true)}
        />

        {!imageLoaded && <View style={themed($imagePlaceholder)} />}

        <View style={themed($badgeContainer)}>
          {property.isNew && (
            <View style={themed($badge)}>
              <Text style={themed($badgeText)} size="xxs" weight="bold">
                NEW
              </Text>
            </View>
          )}
          {property.isFeatured && (
            <View style={[themed($badge), themed($featuredBadge)]}>
              <Text style={themed($badgeText)} size="xxs" weight="bold">
                FEATURED
              </Text>
            </View>
          )}
        </View>

        <Pressable style={themed($favoriteButton)} onPress={handleFavoritePress}>
          <Animated.View style={animatedHeartStyle}>
            <Icon
              icon="heart"
              size={22}
              color={isFavorite ? theme.colors.palette.primary500 : theme.colors.palette.neutral100}
            />
          </Animated.View>
        </Pressable>

        <View style={themed($priceTag)}>
          <Text style={themed($priceText)} weight="bold">
            {formatPrice(property.price)}
          </Text>
        </View>
      </View>

      <View style={themed($contentContainer)}>
        <View style={themed($propertyTypeRow)}>
          <Text style={themed($propertyType)} size="xs" weight="medium">
            {getPropertyTypeLabel(property.propertyType).toUpperCase()}
          </Text>
        </View>

        <Text style={themed($title)} size="md" weight="bold" numberOfLines={1}>
          {property.title}
        </Text>

        <View style={themed($locationRow)}>
          <Icon icon="pin" size={14} color={theme.colors.textDim} />
          <Text style={themed($location)} size="xs" numberOfLines={1}>
            {property.address}, {property.city}, {property.state}
          </Text>
        </View>

        <View style={themed($statsRow)}>
          <View style={themed($statItem)}>
            <Icon icon="components" size={16} color={theme.colors.textDim} />
            <Text style={themed($statText)} size="xs">
              {property.bedrooms} {property.bedrooms === 1 ? "Bed" : "Beds"}
            </Text>
          </View>

          <View style={themed($statItem)}>
            <Icon icon="components" size={16} color={theme.colors.textDim} />
            <Text style={themed($statText)} size="xs">
              {property.bathrooms} {property.bathrooms === 1 ? "Bath" : "Baths"}
            </Text>
          </View>

          <View style={themed($statItem)}>
            <Icon icon="view" size={16} color={theme.colors.textDim} />
            <Text style={themed($statText)} size="xs">
              {formatSqft(property.sqft)} sqft
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral100,
  borderRadius: spacing.md,
  marginBottom: spacing.md,
  shadowColor: colors.palette.neutral800,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.1,
  shadowRadius: spacing.sm,
  elevation: 4,
  overflow: "hidden",
})

const $imageContainer: ViewStyle = {
  position: "relative",
  height: 200,
}

const $image: ImageStyle = {
  width: "100%",
  height: "100%",
}

const $imagePlaceholder: ThemedStyle<ViewStyle> = ({ colors }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: colors.palette.neutral300,
})

const $badgeContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  position: "absolute",
  top: spacing.sm,
  left: spacing.sm,
  flexDirection: "row",
  gap: spacing.xs,
})

const $badge: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.secondary500,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xxs,
  borderRadius: spacing.xxs,
})

const $featuredBadge: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.accent500,
})

const $badgeText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral100,
  letterSpacing: 0.5,
})

const $favoriteButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  position: "absolute",
  top: spacing.sm,
  right: spacing.sm,
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: colors.palette.overlay50,
  justifyContent: "center",
  alignItems: "center",
})

const $priceTag: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  position: "absolute",
  bottom: spacing.sm,
  left: spacing.sm,
  backgroundColor: colors.palette.neutral800,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xxs,
  borderRadius: spacing.xxs,
})

const $priceText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral100,
  fontSize: 18,
})

const $contentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.md,
})

const $propertyTypeRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  marginBottom: spacing.xxs,
})

const $propertyType: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.primary500,
  letterSpacing: 1,
})

const $title: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.text,
  marginBottom: spacing.xxs,
})

const $locationRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  marginBottom: spacing.sm,
  gap: spacing.xxs,
})

const $location: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  flex: 1,
})

const $statsRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "flex-start",
  gap: spacing.md,
})

const $statItem: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xxs,
})

const $statText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
})
