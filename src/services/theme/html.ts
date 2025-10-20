import { ThemeConfig, ThemeName } from './config';
import { getThemeFromStorage } from './storage';

const getDocumentElement = (): HTMLElement => document.documentElement;

export const getTokens = (): ThemeConfig | null => {
  const root = document.querySelector(':root');
  if (!root) return null;

  const styles = getComputedStyle(root);
  const cssVars: Record<string, string> = {};

  for (let i = 0; i < styles.length; i++) {
    const property = styles.item(i);
    if (property.startsWith('--')) {
      cssVars[property] = styles.getPropertyValue(property);
    }
  }

  return cssVars;
};

export const getThemeClass = (): ThemeName | string =>
  getDocumentElement().className;

export const setElementTheme = (theme: ThemeName) => {
  const currentTheme = getThemeFromStorage();
  const element = getDocumentElement();

  if (currentTheme) element.classList.remove(currentTheme);
  element.classList.add(theme);
};
