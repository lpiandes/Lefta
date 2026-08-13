import { TextStyle } from 'react-native';

export const fonts = {
  display: 'Fraunces_700Bold',
  displayMedium: 'Fraunces_600SemiBold',
  body: 'DMSans_400Regular',
  bodyMedium: 'DMSans_500Medium',
  bodyBold: 'DMSans_700Bold',
} as const;

export const type = {
  heroBrand: {
    fontFamily: fonts.display,
    fontSize: 48,
    lineHeight: 52,
    letterSpacing: -1,
  } as TextStyle,
  hero: {
    fontFamily: fonts.display,
    fontSize: 36,
    lineHeight: 40,
    letterSpacing: -0.5,
  } as TextStyle,
  title: {
    fontFamily: fonts.displayMedium,
    fontSize: 28,
    lineHeight: 34,
  } as TextStyle,
  section: {
    fontFamily: fonts.displayMedium,
    fontSize: 22,
    lineHeight: 28,
  } as TextStyle,
  body: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 24,
  } as TextStyle,
  bodyBold: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    lineHeight: 24,
  } as TextStyle,
  caption: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    lineHeight: 18,
  } as TextStyle,
  money: {
    fontFamily: fonts.display,
    fontSize: 44,
    lineHeight: 48,
    letterSpacing: -1,
  } as TextStyle,
};
