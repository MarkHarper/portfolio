import {
  isThemeName,
  ThemeConfig,
  themeConfigs,
  ThemeName,
  ThemeNames,
} from './config';
import { elementHasTheme, getElementTheme, setElementTheme } from './html';
import { getThemeFromStorage, setThemeInStorage } from './storage';

const INITIAL_THEME = initTheme();

const getPreferredTheme = () => {
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

  if (prefersDarkScheme.matches) {
    return ThemeNames.DARK;
  }

  return ThemeNames.LIGHT;
};

function initTheme(): ThemeName {
  const themeInStorage = getThemeFromStorage();
  const themeOnElement = getElementTheme();

  const isStorageThemeValid = isThemeName(themeInStorage);
  const isElementThemeValid = isThemeName(themeOnElement);
  const bothValid = isStorageThemeValid && isElementThemeValid;

  if (themeInStorage === themeOnElement && bothValid) {
    return themeInStorage;
  }

  if (isStorageThemeValid && !isElementThemeValid) {
    setElementTheme(themeInStorage);
    return themeInStorage;
  } else if (!isStorageThemeValid && isElementThemeValid) {
    setThemeInStorage(themeOnElement);
    return themeOnElement;
  } else {
    const preferredTheme = getPreferredTheme();
    setElementTheme(preferredTheme);
    setThemeInStorage(preferredTheme);
    return preferredTheme;
  }
}

export const toggleTheme = () => {
  if (elementHasTheme(ThemeNames.DARK)) {
    setElementTheme(ThemeNames.LIGHT);
    setThemeInStorage(ThemeNames.LIGHT);
    return ThemeNames.LIGHT;
  }

  setElementTheme(ThemeNames.DARK);
  setThemeInStorage(ThemeNames.DARK);
  return ThemeNames.DARK;
};

export const getThemeName = (): ThemeName => {
  const storedTheme = getThemeFromStorage();
  if (isThemeName(storedTheme)) return storedTheme;

  return INITIAL_THEME;
};

export const getThemeConfig = (themeName: ThemeName): ThemeConfig =>
  themeConfigs[themeName];
