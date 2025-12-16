import { TThemeConfig, TThemeName } from './config';

export const getThemeNameFromStorage = () => localStorage.getItem('theme');
export const setThemeNameInStorage = (theme: TThemeName) =>
  localStorage.setItem('theme', theme);

export const getThemeModeFromStorage = () => localStorage.getItem('mode');
export const setThemeModeInStorage = (mode: TThemeName) =>
  localStorage.setItem('mode', mode);

export const getThemeTokensFromStorage = (name: string, mode: string) =>
  JSON.parse(localStorage.getItem(`${name}_${mode}`));
export const setThemeTokensInStorage = (
  name: string,
  mode: string,
  config: TThemeConfig,
) => localStorage.setItem(`${name}_${mode}`, JSON.stringify(config));
