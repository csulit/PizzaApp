import { Platform } from "react-native"
import {
  Inter_300Light as interLight,
  Inter_400Regular as interRegular,
  Inter_500Medium as interMedium,
  Inter_600SemiBold as interSemiBold,
  Inter_700Bold as interBold,
} from "@expo-google-fonts/inter"

/**
 * Custom fonts to load via expo-font.
 * Inter is loaded from Google Fonts, Cal Sans is loaded as a local asset.
 */
export const customFontsToLoad = {
  interLight,
  interRegular,
  interMedium,
  interSemiBold,
  interBold,
  // Cal Sans is loaded separately as a local font asset
  "CalSans-Regular": require("@assets/fonts/CalSans-Regular.ttf"),
}

const fonts = {
  calSans: {
    // Cal Sans - geometric display font for headlines
    normal: "CalSans-Regular",
  },
  inter: {
    // Inter - versatile body font
    light: "interLight",
    normal: "interRegular",
    medium: "interMedium",
    semiBold: "interSemiBold",
    bold: "interBold",
  },
  helveticaNeue: {
    // iOS only font.
    thin: "HelveticaNeue-Thin",
    light: "HelveticaNeue-Light",
    normal: "Helvetica Neue",
    medium: "HelveticaNeue-Medium",
  },
  courier: {
    // iOS only font.
    normal: "Courier",
  },
  sansSerif: {
    // Android only font.
    thin: "sans-serif-thin",
    light: "sans-serif-light",
    normal: "sans-serif",
    medium: "sans-serif-medium",
  },
  monospace: {
    // Android only font.
    normal: "monospace",
  },
}

export const typography = {
  /**
   * The fonts are available to use, but prefer using the semantic name.
   */
  fonts,
  /**
   * The primary font. Used for body text and UI elements.
   * Inter - highly readable, versatile, full weight range.
   */
  primary: fonts.inter,
  /**
   * The display font. Used for headlines and titles.
   * Cal Sans - geometric, modern, tight spacing.
   */
  display: fonts.calSans,
  /**
   * Lets get fancy with a monospace font!
   */
  code: Platform.select({ ios: fonts.courier, android: fonts.monospace }),
}
