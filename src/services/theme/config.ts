export const THEME_MDOES = {
  DARK: 'dark',
  LIGHT: 'light',
} as const;

type TThemeModeKeys = keyof typeof THEME_MDOES;
export type TThemeMode = (typeof THEME_MDOES)[TThemeModeKeys];

export const isThemeMode = (text: any): text is TThemeMode => {
  return text === THEME_MDOES.DARK || text === THEME_MDOES.LIGHT;
};

export const STATIC_THEME_NAMES = {
  taopunk: 'taopunk',
} as const;

type TStaticThemeNameKeys = keyof typeof STATIC_THEME_NAMES;
export type TStaticThemeName =
  (typeof STATIC_THEME_NAMES)[TStaticThemeNameKeys];

export const isStaticThemeName = (text: any): text is TStaticThemeName => {
  return text in STATIC_THEME_NAMES;
};

export type TThemeConfig = Record<string, string>;
export type TThemeConfigMap = Record<string, TThemeConfig>;
