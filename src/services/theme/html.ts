import { ThemeName } from './config';

export const getElement = (): HTMLElement => document.documentElement;
export const getElementTheme = (): ThemeName | string => getElement().className;
export const elementHasTheme = (theme: ThemeName): boolean =>
  getElement().classList.contains(theme);
export const setElementTheme = (theme: ThemeName) => {
  getElement().className = theme;
};
