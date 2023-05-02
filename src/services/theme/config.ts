import { Color, Colors } from './tokens/colors';

export enum ThemeNames {
  DARK = 'dark',
  LIGHT = 'light',
}

export type ThemeName = `${ThemeNames}`;

export const isThemeName = (text: any): text is ThemeName => {
  return text === ThemeNames.DARK || text === ThemeNames.LIGHT;
};

export type ThemeConfig = {
  ACCENT_COLOR: Color;
  INVERTED_ACCENT_COLOR: Color;
  BUTTON_FACE: Color;
  BUTTON_TEXT: Color;
  BUTTON_BORDER: Color;
  LINK_TEXT: Color;
  VISITED_TEXT: Color;
  HIGHLIGHT_TEXT: Color;
  ACTIVE_TEXT: Color;
  CANVAS: Color;
  CANVAS_TEXT: Color;
  CANVAS_TEXT_ALT: Color;
};

export type ThemeConfigMap = Record<ThemeName, ThemeConfig>;

export const themeConfigs: ThemeConfigMap = {
  [ThemeNames.DARK]: {
    ACCENT_COLOR: Colors.WHITE,
    INVERTED_ACCENT_COLOR: Colors.GREY,
    BUTTON_FACE: Colors.GREEN,
    BUTTON_TEXT: Colors.DARK_GREEN,
    BUTTON_BORDER: Colors.WHITE,
    LINK_TEXT: Colors.GREEN,
    VISITED_TEXT: Colors.DARK_RED,
    HIGHLIGHT_TEXT: Colors.RED,
    ACTIVE_TEXT: Colors.DARK_GREEN,
    CANVAS: Colors.DARK_GREEN,
    CANVAS_TEXT: Colors.GREEN,
    CANVAS_TEXT_ALT: Colors.LIGHT_GREEN,
  },
  [ThemeNames.LIGHT]: {
    ACCENT_COLOR: Colors.WHITE,
    INVERTED_ACCENT_COLOR: Colors.GREY,
    BUTTON_FACE: Colors.GREEN,
    BUTTON_TEXT: Colors.WHITE,
    BUTTON_BORDER: Colors.DARK_GREEN,
    LINK_TEXT: Colors.GREEN,
    VISITED_TEXT: Colors.DARK_RED,
    HIGHLIGHT_TEXT: Colors.RED,
    ACTIVE_TEXT: Colors.DARK_GREEN,
    CANVAS: Colors.WHITE,
    CANVAS_TEXT: Colors.GREEN,
    CANVAS_TEXT_ALT: Colors.DARK_GREEN,
  },
};
