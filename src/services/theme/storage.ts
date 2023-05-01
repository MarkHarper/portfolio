import { ThemeName } from './config';

export const getThemeFromStorage = () => localStorage.getItem('theme');
export const setThemeInStorage = (theme: ThemeName) =>
  localStorage.setItem('theme', theme);
