import type { FC } from "react"
import { useCallback, useMemo, useState } from "react"
import { View } from "react-native"
import type { TextStyle, ViewStyle } from "react-native"
import { AnimatedLegendList } from "@legendapp/list/reanimated"
import Animated from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { AnimatedHeader } from "@/components/AnimatedHeader"
import { DrawerIconButton } from "@/components/DrawerIconButton"
import { Icon } from "@/components/Icon"
import { PropertyCard } from "@/components/PropertyCard"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { Switch } from "@/components/Toggle/Switch"
import { useDrawer } from "@/context/DrawerContext"
import {
  useAnimatedHeaderStyle,
  useAnimatedTabBarInset,
  useScrollDrivenBars,
} from "@/context/TabBarVisibilityContext"
import type { Property } from "@/data/properties"
import { properties } from "@/data/properties"
import { translate } from "@/i18n/translate"
import type { DemoTabScreenProps } from "@/navigators/navigationTypes"
import { useAppTheme } from "@/theme/context"
import { $styles } from "@/theme/styles"
import type { ThemedStyle } from "@/theme/types"

export const PropertyListScreen: FC<DemoTabScreenProps<"DemoShowroom">> =
  function PropertyListScreen(props) {
    const { navigation } = props
    const { themed, theme } = useAppTheme()
    const { top, bottom } = useSafeAreaInsets()
    const { toggleDrawer } = useDrawer()

    const [searchQuery, setSearchQuery] = useState("")
    const [showFeaturedOnly, setShowFeaturedOnly] = useState(false)
    const [favorites, setFavorites] = useState<Set<string>>(new Set())

    // Scroll-driven animation
    const { scrollHandler } = useScrollDrivenBars()
    const { animatedSpacerStyle } = useAnimatedTabBarInset(bottom)
    const { animatedTopPaddingStyle } = useAnimatedHeaderStyle(top)

    const filteredProperties = useMemo(() => {
      let result = properties

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        result = result.filter(
          (property) =>
            property.title.toLowerCase().includes(query) ||
            property.city.toLowerCase().includes(query) ||
            property.state.toLowerCase().includes(query) ||
            property.address.toLowerCase().includes(query),
        )
      }

      if (showFeaturedOnly) {
        result = result.filter((property) => property.isFeatured)
      }

      return result
    }, [searchQuery, showFeaturedOnly])

    const handlePropertyPress = useCallback(
      (property: Property) => {
        navigation.navigate("PropertyDetail", { property })
      },
      [navigation],
    )

    const handleFavoritePress = useCallback((property: Property) => {
      setFavorites((prev) => {
        const next = new Set(prev)
        if (next.has(property.id)) {
          next.delete(property.id)
        } else {
          next.add(property.id)
        }
        return next
      })
    }, [])

    const renderItem = useCallback(
      ({ item }: { item: Property }) => (
        <PropertyCard
          property={item}
          onPress={handlePropertyPress}
          onFavoritePress={handleFavoritePress}
          isFavorite={favorites.has(item.id)}
        />
      ),
      [handlePropertyPress, handleFavoritePress, favorites],
    )

    const ListHeader = useMemo(
      () => (
        <>
          <Animated.View style={animatedTopPaddingStyle} />
          <View style={themed($heading)}>
            <Text preset="heading" tx="propertyListScreen:title" />
            <Text style={themed($subtitle)} tx="propertyListScreen:subtitle" />
          </View>

          <TextField
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTx="propertyListScreen:searchPlaceholder"
            containerStyle={themed($searchContainer)}
            inputWrapperStyle={themed($searchInputWrapper)}
            LeftAccessory={() => (
              <View style={themed($searchIconContainer)}>
                <Icon icon="search" size={20} color={theme.colors.textDim} />
              </View>
            )}
          />

          <View style={themed($filterRow)}>
            <Switch
              value={showFeaturedOnly}
              onValueChange={setShowFeaturedOnly}
              labelTx="propertyListScreen:featuredOnly"
              labelPosition="left"
              labelStyle={$labelStyle}
            />
          </View>

          <Text style={themed($resultCount)}>
            {translate("propertyListScreen:resultsCount", { count: filteredProperties.length })}
          </Text>
        </>
      ),
      [
        animatedTopPaddingStyle,
        themed,
        searchQuery,
        showFeaturedOnly,
        filteredProperties.length,
        theme.colors.textDim,
      ],
    )

    return (
      <Screen preset="fixed" contentContainerStyle={$styles.flex1}>
        <AnimatedHeader backgroundColor={theme.colors.background}>
          <View style={themed($headerRow)}>
            <DrawerIconButton onPress={toggleDrawer} />
            <Text preset="bold" style={themed($headerTitle)} tx="propertyListScreen:headerTitle" />
          </View>
        </AnimatedHeader>

        <AnimatedLegendList<Property>
          data={filteredProperties}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={themed($listContentContainer)}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          ListHeaderComponent={ListHeader}
          ListFooterComponent={<Animated.View style={animatedSpacerStyle} />}
          estimatedItemSize={320}
        />
      </Screen>
    )
  }

const $headerRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: spacing.md,
})

const $headerTitle: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginLeft: spacing.sm,
  fontSize: 18,
})

const $listContentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
})

const $heading: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
})

const $subtitle: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  marginTop: spacing.xs,
})

const $searchContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
})

const $searchInputWrapper: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral100,
  borderColor: colors.palette.neutral300,
})

const $searchIconContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginLeft: spacing.md,
  justifyContent: "center",
  alignSelf: "center",
})

const $filterRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
})

const $labelStyle: TextStyle = {
  textAlign: "left",
}

const $resultCount: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  marginBottom: spacing.md,
  fontSize: 14,
})
