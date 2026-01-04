import type { FC, ReactElement } from "react"
import { useCallback, useMemo } from "react"
import { View } from "react-native"
import type { TextStyle, ViewStyle } from "react-native"
import { AnimatedLegendList } from "@legendapp/list/reanimated"
import Animated from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { AnimatedHeader } from "@/components/AnimatedHeader"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import {
  useAnimatedHeaderStyle,
  useAnimatedTabBarInset,
  useScrollDrivenBars,
} from "@/context/TabBarVisibilityContext"
import { TxKeyPath } from "@/i18n"
import { translate } from "@/i18n/translate"
import { DemoTabScreenProps } from "@/navigators/navigationTypes"
import { useAppTheme } from "@/theme/context"
import { $styles } from "@/theme/styles"
import type { ThemedStyle } from "@/theme/types"

import * as Demos from "./demos"

// Types for flattened list data
type DemoSectionHeader = {
  type: "header"
  name: string
  description: TxKeyPath
  index: number
}

type DemoSectionContent = {
  type: "content"
  demos: ReactElement[]
  index: number
}

type DemoListData = DemoSectionHeader | DemoSectionContent

export const DemoShowroomScreen: FC<DemoTabScreenProps<"DemoShowroom">> =
  function DemoShowroomScreen(_props) {
    const { themed, theme } = useAppTheme()
    const { top, bottom } = useSafeAreaInsets()

    // Twitter/X-style scroll-driven animation (2026 style)
    const { scrollHandler } = useScrollDrivenBars()
    const { animatedSpacerStyle } = useAnimatedTabBarInset(bottom)
    const { animatedTopPaddingStyle } = useAnimatedHeaderStyle(top)

    // Flatten demos into a single list with headers and content
    const flatListData = useMemo<DemoListData[]>(() => {
      const data: DemoListData[] = []
      Object.values(Demos).forEach((demo, index) => {
        data.push({
          type: "header",
          name: demo.name,
          description: demo.description,
          index,
        })
        data.push({
          type: "content",
          demos: demo.data({ theme, themed }),
          index,
        })
      })
      return data
    }, [theme, themed])

    const renderItem = useCallback(
      ({ item }: { item: DemoListData }) => {
        if (item.type === "header") {
          return (
            <View>
              <Text preset="heading" style={themed($demoItemName)}>
                {item.name}
              </Text>
              <Text style={themed($demoItemDescription)}>{translate(item.description)}</Text>
            </View>
          )
        }

        return (
          <View>
            {item.demos.map((demo, demoIndex) => (
              <View key={`${item.index}-${demoIndex}`}>{demo}</View>
            ))}
            <View style={themed($demoUseCasesSpacer)} />
          </View>
        )
      },
      [themed],
    )

    const ListHeader = useMemo(
      () => (
        <>
          <Animated.View style={animatedTopPaddingStyle} />
          <View style={themed($heading)}>
            <Text preset="heading" tx="demoShowroomScreen:jumpStart" />
          </View>
        </>
      ),
      [animatedTopPaddingStyle, themed],
    )

    return (
      <Screen preset="fixed" contentContainerStyle={$styles.flex1}>
        <AnimatedHeader backgroundColor={theme.colors.background}>
          <Text preset="bold" style={themed($headerTitle)} tx="demoShowroomScreen:title" />
        </AnimatedHeader>

        <AnimatedLegendList<DemoListData>
          data={flatListData}
          renderItem={renderItem}
          keyExtractor={(item) => `${item.type}-${item.index}`}
          contentContainerStyle={themed($flatListContentContainer)}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          ListHeaderComponent={ListHeader}
          ListFooterComponent={<Animated.View style={animatedSpacerStyle} />}
          estimatedItemSize={200}
        />
      </Screen>
    )
  }

const $headerTitle: ThemedStyle<TextStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  fontSize: 18,
})

const $flatListContentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
})

const $heading: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.xxxl,
})

const $demoItemName: ThemedStyle<TextStyle> = ({ spacing }) => ({
  fontSize: 24,
  marginBottom: spacing.md,
})

const $demoItemDescription: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginBottom: spacing.xxl,
})

const $demoUseCasesSpacer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingBottom: spacing.xxl,
})
