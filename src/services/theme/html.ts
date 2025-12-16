import { TThemeConfig } from './config';

const getDocumentElement = (): HTMLElement => document.documentElement;

export const getTokensFromCss = (): TThemeConfig | null => {
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

export const setTokensOnRoot = (tokens: TThemeConfig): void => {
  Object.entries(tokens).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
  });
};
export const getDocumentClasses = (): string => getDocumentElement().className;

const EXCLUDED_CLASSES_REGEX =
  /\b(light|dark|wa-theme-default|wa-palette-default)\b/i;

export const getThemeOnRoot = (): string | undefined => {
  const element = getDocumentElement();
  const classArr = Array.from(element.classList);

  const theme = classArr.find((v) => !EXCLUDED_CLASSES_REGEX.test(v));
  return theme?.split('-')[0];
};

const MODES_REGEX = /\b(light|dark)\b/i;

export const getModeOnRoot = (): string | undefined => {
  const element = getDocumentElement();
  const classArr = Array.from(element.classList);

  const m = classArr.find((v) => MODES_REGEX.test(v));
  console.log(m);
  return m?.split('-')[1];
};

export const setThemeOnRoot = (theme: string) => {
  const element = getDocumentElement();
  let classList = Array.from(element.classList);
  classList = classList.filter((className) =>
    EXCLUDED_CLASSES_REGEX.test(className),
  );
  classList.push(theme);

  element.className = classList.join(' ');
};

const MODE_CLASSNAMES = /\b(light|dark)\b/i;

export const setModeOnRoot = (mode: string) => {
  const element = getDocumentElement();
  let classList = Array.from(element.classList);
  classList = classList.filter((className) => !MODE_CLASSNAMES.test(className));
  classList.push(`wa-${mode}`);

  element.className = classList.join(' ');
};

export const resetStyleOnRoot = () => {
  const element = getDocumentElement();
  element.style = '';
};
