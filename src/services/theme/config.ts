export const ThemeNames = {
  DARK: 'dark',
  LIGHT: 'light',
} as const;

type ThemeNameKeys = keyof typeof ThemeNames;
export type ThemeName = (typeof ThemeNames)[ThemeNameKeys];

export const isThemeName = (text: any): text is ThemeName => {
  return text === ThemeNames.DARK || text === ThemeNames.LIGHT;
};

export type Color =
  | '--white'
  | '--black'
  | '--grey'
  | '--light-grey'
  | '--light-green'
  | '--green'
  | '--dark-green'
  | '--light-red'
  | '--red'
  | '--dark-red'
  | '--light-alt-green'
  | '--alt-green'
  | '--dark-alt-green';

export type FontFamily = '--official-font' | '--nav-font' | '--body-font';

export type SemanticVars =
  | '--accent-color'
  | '--button-text'
  | '--gray-text'
  | '--canvas-item'
  | '--canvas-item-alt';

export type CssVars = Color | FontFamily | SemanticVars;

export type ThemeConfig = Record<CssVars, string>;
export type ThemeConfigMap = Record<ThemeName, ThemeConfig>;
