/**
 * Centralized color constants — mirror of CSS variables in globals.css.
 * Use ONLY in JS/TS contexts where CSS var() cannot be used (e.g. antd theme tokens).
 * Prefer var(--...) in CSS files, CSS modules, and SVG attributes.
 */
export const COLORS = {
  primaryBlue: '#155DFC',
  blueLightest: '#EFF6FF',
  blueLight: '#DBEAFE',
  blueMedium: '#8EC5FF',
  blueGradientStart: '#2B7FFF',
  blueGradientEnd: '#9810FA',
  grayLightest: '#F9FAFB',
  grayLight: '#F3F4F6',
  grayBorder: '#E5E7EB',
  grayBorderMedium: '#D1D5DC',
  grayMedium: '#6A7282',
  grayDark: '#4A5565',
  blackSoft: '#0A0A0A',
  navyDark: '#101828',
  blackBorder: 'rgba(0, 0, 0, 0.1)',
  greenPale: '#F0FDF4',
  greenLight: '#DCFCE7',
  greenMedium: '#00A63E',
  greenBright: '#00C950',
  yellowPale: '#FEFCE8',
  yellowLight: '#FFF085',
  yellowMedium: '#FDC700',
  yellowDark: '#D08700',
  yellowBright: '#F0B100',
  orangePale: '#FFF7ED',
  orangeBright: '#F54900',
  redBright: '#E7000B',
  whiteColor: '#FFFFFF',
  yellowGold: '#FFDF20',
  blueDark: '#1248D0',
} as const
