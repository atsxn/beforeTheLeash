// app/utils/responsive.ts

import { Dimensions, PixelRatio, Platform } from "react-native";

// ขนาดหน้าจอปัจจุบัน
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// ขนาดอ้างอิง (iPhone 13: 390 x 844)
const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

/**
 * Responsive Width
 * แปลงค่า pixel เป็นขนาดที่เหมาะสมกับหน้าจอ
 */
export const wp = (percentage: number): number => {
  return PixelRatio.roundToNearestPixel((SCREEN_WIDTH * percentage) / 100);
};

/**
 * Responsive Height
 * แปลงค่า pixel เป็นขนาดที่เหมาะสมกับความสูงหน้าจอ
 */
export const hp = (percentage: number): number => {
  return PixelRatio.roundToNearestPixel((SCREEN_HEIGHT * percentage) / 100);
};

/**
 * Responsive Font Size
 * ปรับขนาดตัวอักษรตามความกว้างหน้าจอ
 */
export const rf = (baseFontSize: number): number => {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  const newSize = baseFontSize * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

/**
 * Responsive Spacing
 * สำหรับ padding, margin
 */
export const rs = (baseSize: number): number => {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  const newSize = baseSize * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

/**
 * Check if screen is small (width < 375)
 */
export const isSmallScreen = (): boolean => {
  return SCREEN_WIDTH < 375;
};

/**
 * Check if screen is large (width > 428)
 */
export const isLargeScreen = (): boolean => {
  return SCREEN_WIDTH > 428;
};

/**
 * Get safe area padding for notch/home indicator
 */
export const getSafeAreaPadding = () => {
  return {
    top: Platform.select({
      ios: SCREEN_HEIGHT >= 812 ? 44 : 20, // iPhone X+ has notch
      android: 0,
      default: 0,
    }),
    bottom: Platform.select({
      ios: SCREEN_HEIGHT >= 812 ? 34 : 0, // iPhone X+ has home indicator
      android: 0,
      default: 0,
    }),
  };
};

/**
 * Screen dimensions
 */
export const SCREEN = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  isSmall: isSmallScreen(),
  isLarge: isLargeScreen(),
  safeArea: getSafeAreaPadding(),
};

/**
 * Common responsive values
 */
export const RESPONSIVE = {
  // Spacing
  spacingXS: rs(4),
  spacingS: rs(8),
  spacingM: rs(16),
  spacingL: rs(24),
  spacingXL: rs(32),
  spacingXXL: rs(40),

  // Border Radius
  radiusS: rs(8),
  radiusM: rs(12),
  radiusL: rs(16),
  radiusXL: rs(24),

  // Font Sizes
  fontXS: rf(12),
  fontS: rf(14),
  fontM: rf(16),
  fontL: rf(18),
  fontXL: rf(20),
  font2XL: rf(24),
  font3XL: rf(28),
  font4XL: rf(32),
  font5XL: rf(40),
  font6XL: rf(48),

  // Button Heights
  buttonS: rs(44),
  buttonM: rs(52),
  buttonL: rs(60),

  // Icon Sizes
  iconS: rs(20),
  iconM: rs(24),
  iconL: rs(32),
  iconXL: rs(40),
};
