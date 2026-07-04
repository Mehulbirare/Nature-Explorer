/**
 * Nature Explorer — design tokens.
 * Soft, rounded, joyful. Big shapes, generous spacing, near-zero readable text.
 */

export const colors = {
  // Primary — Sprout green
  primary: '#2E7D32',
  primaryDark: '#1B5E20',
  primaryLight: '#66BB6A',

  // Warm, bright accents
  sunny: '#FFC93C',
  coral: '#FF6B6B',
  sky: '#4DA6FF',

  // Neutrals
  white: '#FFFFFF',
  cream: '#FFFDF5',
  ink: '#22331F',
  overlay: 'rgba(12, 40, 12, 0.35)',
  overlayStrong: 'rgba(12, 40, 12, 0.55)',

  // Progress stars
  starEmpty: 'rgba(255, 255, 255, 0.45)',
  starFilled: '#FFC93C',

  shadow: '#0C280C',
} as const;

export const spacing = {
  xs: 6,
  sm: 12,
  md: 20,
  lg: 32,
  xl: 48,
} as const;

export const radius = {
  card: 28,
  pill: 999,
} as const;

export const fonts = {
  // Bundle Fredoka (or Baloo 2) .ttf into src/assets/fonts/ and run `npx react-native-asset`.
  // Falls back to the platform system font if the family is not installed.
  heavy: 'Fredoka-SemiBold',
  bold: 'Fredoka-Medium',
  regular: 'Fredoka-Regular',
} as const;

export const fontSizes = {
  hero: 48,
  title: 34,
  heading: 26,
  body: 20,
  emoji: 64,
} as const;

export const shadow = {
  soft: {
    shadowColor: colors.shadow,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 8,
  },
  lift: {
    shadowColor: colors.shadow,
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 14,
  },
} as const;

/** Spring config reused across every press / reward for a consistent, buttery feel. */
export const springs = {
  press: {damping: 15, stiffness: 320, mass: 0.6},
  pop: {damping: 9, stiffness: 220, mass: 0.7},
  gentle: {damping: 18, stiffness: 140},
} as const;
