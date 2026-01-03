import type { TextStyle, ViewStyle } from "react-native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { AnimatedTabBar } from "@/components/AnimatedTabBar"
import { AnimatedTabIcon } from "@/components/AnimatedTabIcon"
import { EpisodeProvider } from "@/context/EpisodeContext"
import { TabBarVisibilityProvider } from "@/context/TabBarVisibilityContext"
import { translate } from "@/i18n/translate"
import { DemoCommunityScreen } from "@/screens/DemoCommunityScreen"
import { DemoDebugScreen } from "@/screens/DemoDebugScreen"
import { DemoPodcastListScreen } from "@/screens/DemoPodcastListScreen"
import { DemoShowroomScreen } from "@/screens/DemoShowroomScreen/DemoShowroomScreen"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

import { TAB_BAR_HEIGHT } from "./constants"
import type { DemoTabParamList } from "./navigationTypes"

const Tab = createBottomTabNavigator<DemoTabParamList>()

/**
 * This is the main navigator for the demo screens with a bottom tab bar.
 * Each tab is a stack navigator with its own set of screens.
 *
 * More info: https://reactnavigation.org/docs/bottom-tab-navigator/
 * @returns {JSX.Element} The rendered `DemoNavigator`.
 */
export function DemoNavigator() {
  const { bottom } = useSafeAreaInsets()
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  return (
    <TabBarVisibilityProvider>
      <EpisodeProvider>
        <Tab.Navigator
          tabBar={(props) => <AnimatedTabBar {...props} />}
          screenOptions={{
            headerShown: false,
            tabBarHideOnKeyboard: true,
            tabBarStyle: themed([$tabBar, { height: bottom + TAB_BAR_HEIGHT }]),
            tabBarActiveTintColor: colors.text,
            tabBarInactiveTintColor: colors.text,
            tabBarLabelStyle: themed($tabBarLabel),
            tabBarItemStyle: themed($tabBarItem),
          }}
        >
          <Tab.Screen
            name="DemoShowroom"
            component={DemoShowroomScreen}
            options={{
              tabBarLabel: translate("demoNavigator:componentsTab"),
              tabBarIcon: ({ focused }) => (
                <AnimatedTabIcon
                  icon="components"
                  // filledIcon="componentsFilled" // Add when filled icons are available
                  focused={focused}
                  color={focused ? colors.tint : colors.tintInactive}
                  size={30}
                />
              ),
            }}
          />

          <Tab.Screen
            name="DemoCommunity"
            component={DemoCommunityScreen}
            options={{
              tabBarLabel: translate("demoNavigator:communityTab"),
              tabBarIcon: ({ focused }) => (
                <AnimatedTabIcon
                  icon="community"
                  // filledIcon="communityFilled" // Add when filled icons are available
                  focused={focused}
                  color={focused ? colors.tint : colors.tintInactive}
                  size={30}
                />
              ),
            }}
          />

          <Tab.Screen
            name="DemoPodcastList"
            component={DemoPodcastListScreen}
            options={{
              tabBarAccessibilityLabel: translate("demoNavigator:podcastListTab"),
              tabBarLabel: translate("demoNavigator:podcastListTab"),
              tabBarIcon: ({ focused }) => (
                <AnimatedTabIcon
                  icon="podcast"
                  // filledIcon="podcastFilled" // Add when filled icons are available
                  focused={focused}
                  color={focused ? colors.tint : colors.tintInactive}
                  size={30}
                />
              ),
            }}
          />

          <Tab.Screen
            name="DemoDebug"
            component={DemoDebugScreen}
            options={{
              tabBarLabel: translate("demoNavigator:debugTab"),
              tabBarIcon: ({ focused }) => (
                <AnimatedTabIcon
                  icon="debug"
                  // filledIcon="debugFilled" // Add when filled icons are available
                  focused={focused}
                  color={focused ? colors.tint : colors.tintInactive}
                  size={30}
                />
              ),
            }}
          />
        </Tab.Navigator>
      </EpisodeProvider>
    </TabBarVisibilityProvider>
  )
}

const $tabBar: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.background,
  borderTopColor: colors.transparent,
})

const $tabBarItem: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingTop: spacing.md,
})

const $tabBarLabel: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 12,
  fontFamily: typography.primary.medium,
  lineHeight: 16,
  color: colors.text,
})
