import type { FC } from "react"
import { useEffect } from "react"
import { Image, Pressable, ScrollView, View } from "react-native"
import type { ImageStyle, TextStyle, ViewStyle } from "react-native"
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Icon } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { formatPrice, formatSqft, getPropertyTypeLabel } from "@/data/properties"
import { translate } from "@/i18n/translate"
import type { AppStackScreenProps } from "@/navigators/navigationTypes"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

interface PropertyDetailScreenProps extends AppStackScreenProps<"PropertyDetail"> {}

export const PropertyDetailScreen: FC<PropertyDetailScreenProps> = function PropertyDetailScreen(
  props,
) {
  const { navigation, route } = props
  const { property } = route.params
  const { themed, theme } = useAppTheme()
  const { top } = useSafeAreaInsets()

  // Hero image scale animation for a polished entry effect
  const imageScale = useSharedValue(1.1)

  useEffect(() => {
    imageScale.value = withSpring(1, { damping: 20, stiffness: 200 })
  }, [imageScale])

  const animatedImageStyle = useAnimatedStyle(() => ({
    transform: [{ scale: imageScale.value }],
  }))

  return (
    <Screen preset="fixed" safeAreaEdges={["bottom"]} contentContainerStyle={$screenContainer}>
      <ScrollView style={$scrollView} showsVerticalScrollIndicator={false}>
        <View style={$heroContainer}>
          <Animated.View style={[$heroImageContainer, animatedImageStyle]}>
            <Image source={{ uri: property.imageUrl }} style={$heroImage} resizeMode="cover" />
          </Animated.View>

          <Pressable
            style={[themed($backButton), { top: top + theme.spacing.sm }]}
            onPress={() => navigation.goBack()}
          >
            <Icon icon="back" size={24} color={theme.colors.text} />
          </Pressable>

          <View style={themed($priceTag)}>
            <Text style={themed($priceText)} weight="bold">
              {formatPrice(property.price)}
            </Text>
          </View>

          <View style={[themed($badgeContainer), { top: top + theme.spacing.sm }]}>
            {property.isNew && (
              <View style={themed($badge)}>
                <Text style={themed($badgeText)} size="xxs" weight="bold">
                  {translate("propertyDetailScreen:newBadge")}
                </Text>
              </View>
            )}
            {property.isFeatured && (
              <View style={[themed($badge), themed($featuredBadge)]}>
                <Text style={themed($badgeText)} size="xxs" weight="bold">
                  {translate("propertyDetailScreen:featuredBadge")}
                </Text>
              </View>
            )}
          </View>
        </View>

        <Animated.View
          entering={FadeInDown.delay(100).duration(400)}
          style={themed($contentContainer)}
        >
          <Text style={themed($propertyType)} size="xs" weight="medium">
            {getPropertyTypeLabel(property.propertyType).toUpperCase()}
          </Text>

          <Text style={themed($title)} preset="heading">
            {property.title}
          </Text>

          <View style={themed($locationRow)}>
            <Icon icon="pin" size={16} color={theme.colors.textDim} />
            <Text style={themed($location)} size="sm">
              {property.address}, {property.city}, {property.state} {property.zipCode}
            </Text>
          </View>

          <Animated.View
            entering={FadeInDown.delay(200).duration(400)}
            style={themed($statsContainer)}
          >
            <View style={$statItem}>
              <Text style={themed($statValue)} weight="bold" size="lg">
                {property.bedrooms}
              </Text>
              <Text style={themed($statLabel)} size="xs">
                {translate("propertyDetailScreen:beds")}
              </Text>
            </View>

            <View style={themed($statDivider)} />

            <View style={$statItem}>
              <Text style={themed($statValue)} weight="bold" size="lg">
                {property.bathrooms}
              </Text>
              <Text style={themed($statLabel)} size="xs">
                {translate("propertyDetailScreen:baths")}
              </Text>
            </View>

            <View style={themed($statDivider)} />

            <View style={$statItem}>
              <Text style={themed($statValue)} weight="bold" size="lg">
                {formatSqft(property.sqft)}
              </Text>
              <Text style={themed($statLabel)} size="xs">
                {translate("propertyDetailScreen:sqft")}
              </Text>
            </View>

            <View style={themed($statDivider)} />

            <View style={$statItem}>
              <Text style={themed($statValue)} weight="bold" size="lg">
                {property.yearBuilt}
              </Text>
              <Text style={themed($statLabel)} size="xs">
                {translate("propertyDetailScreen:yearBuilt")}
              </Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).duration(400)} style={themed($section)}>
            <Text style={themed($sectionTitle)} preset="subheading">
              {translate("propertyDetailScreen:descriptionTitle")}
            </Text>
            <Text style={themed($description)} size="sm">
              {property.description}
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).duration(400)} style={themed($section)}>
            <Text style={themed($sectionTitle)} preset="subheading">
              {translate("propertyDetailScreen:amenitiesTitle")}
            </Text>
            <View style={themed($amenitiesGrid)}>
              {property.amenities.map((amenity, index) => (
                <View key={index} style={themed($amenityItem)}>
                  <Icon icon="check" size={16} color={theme.colors.palette.primary500} />
                  <Text style={themed($amenityText)} size="sm">
                    {amenity}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </Screen>
  )
}

const $screenContainer: ViewStyle = {
  flex: 1,
}

const $scrollView: ViewStyle = {
  flex: 1,
}

const $heroContainer: ViewStyle = {
  position: "relative",
  height: 300,
}

const $heroImageContainer: ViewStyle = {
  overflow: "hidden",
  height: 300,
}

const $heroImage: ImageStyle = {
  width: "100%",
  height: "100%",
}

const $backButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  position: "absolute",
  left: spacing.md,
  width: 44,
  height: 44,
  borderRadius: 22,
  backgroundColor: colors.background,
  justifyContent: "center",
  alignItems: "center",
  shadowColor: colors.palette.neutral800,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: spacing.xs,
  elevation: 4,
})

const $priceTag: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  position: "absolute",
  bottom: spacing.md,
  left: spacing.md,
  backgroundColor: colors.palette.neutral800,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.xs,
  borderRadius: spacing.xs,
})

const $priceText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral100,
  fontSize: 22,
})

const $badgeContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  position: "absolute",
  right: spacing.md,
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

const $contentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.lg,
})

const $propertyType: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.palette.primary500,
  letterSpacing: 1,
  marginBottom: spacing.xxs,
})

const $title: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginBottom: spacing.xs,
})

const $locationRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xxs,
  marginBottom: spacing.lg,
})

const $location: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  flex: 1,
})

const $statsContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: colors.palette.neutral200,
  borderRadius: spacing.sm,
  padding: spacing.md,
  marginBottom: spacing.lg,
})

const $statItem: ViewStyle = {
  alignItems: "center",
  flex: 1,
}

const $statValue: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
})

const $statLabel: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  marginTop: spacing.xxxs,
})

const $statDivider: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  width: 1,
  height: spacing.xl,
  backgroundColor: colors.palette.neutral400,
})

const $section: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.lg,
})

const $sectionTitle: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginBottom: spacing.sm,
})

const $description: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  lineHeight: 22,
})

const $amenitiesGrid: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  flexWrap: "wrap",
  gap: spacing.sm,
})

const $amenityItem: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xs,
  backgroundColor: colors.palette.neutral200,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
  borderRadius: spacing.xs,
})

const $amenityText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
})
