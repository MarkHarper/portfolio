import { THEME_MDOES } from './config';
import {
  getDocumentClasses,
  getModeOnRoot,
  getThemeOnRoot,
  getTokensFromCss,
  setModeOnRoot,
  setThemeOnRoot,
  setTokensOnRoot,
} from './html';
import {
  getThemeModeFromStorage,
  getThemeNameFromStorage,
  getThemeTokensFromStorage,
  setThemeModeInStorage,
  setThemeNameInStorage,
  setThemeTokensInStorage,
} from './storage';

function getPreferredMode() {
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

  if (prefersDarkScheme.matches) {
    return THEME_MDOES.DARK;
  }

  return THEME_MDOES.LIGHT;
}

// state
// name, class, mode, tokens

// on load
// html has the theme name
// matches localstorage | does not match localstorage
// matches: apply storage tokens to root
// does not match: update html class, apply tokens to root

// during editing
// switch theme | edit theme | create new theme
// switch theme: update html class and root vars, update localstorage
// edit theme: update root vars, update localstorage
// create new theme: update html class and root vars, update localstorage

export function initTheme(): string {
  const storageTheme = getThemeNameFromStorage();
  const storageMode = getThemeModeFromStorage();
  const documentClasses = getDocumentClasses();
  const storageMatchesDocumentTheme = documentClasses.includes(storageTheme);
  const storageMatchesDocumentMode = documentClasses.includes(storageMode);

  // get storage tokens: first from storage, read via config from document
  const storageTokens = getThemeTokensFromStorage(storageTheme, storageMode);

  if (
    storageMatchesDocumentTheme &&
    storageMatchesDocumentMode &&
    storageTokens
  ) {
    // update root vars
    setTokensOnRoot(storageTokens);
  } else if (
    storageMatchesDocumentTheme &&
    storageMatchesDocumentMode &&
    !storageTokens
  ) {
    const themeOnRoot = getThemeOnRoot();
    const modeOnRoot = getModeOnRoot();
    const tokens = getTokensFromCss();

    if (!themeOnRoot || !tokens) throw Error('Should never happen');

    // set theme in storage
    setThemeNameInStorage(themeOnRoot);
    setThemeTokensInStorage(themeOnRoot, modeOnRoot, tokens);
    setThemeModeInStorage(modeOnRoot);
  } else if (storageTheme && storageMode && storageTokens) {
    // set document class for storage theme
    setThemeOnRoot(storageTheme);

    // update root vars
    setTokensOnRoot(storageTokens);

    // set document class for storage mode
    setModeOnRoot(storageMode);
  } else if (storageTheme && storageMode && !storageTokens) {
    // set document class for storage theme
    setThemeOnRoot(storageTheme);

    // set document class for storage mode
    setModeOnRoot(storageMode);

    // update root vars
    const tokens = getTokensFromCss();
    setTokensOnRoot(tokens);
  } else {
    const themeOnRoot = getThemeOnRoot();
    const modeOnRoot = getModeOnRoot();
    const tokens = getTokensFromCss();

    if (!themeOnRoot || !tokens) throw Error('Should never happen');

    // set theme in storage
    setThemeNameInStorage(themeOnRoot);
    setThemeTokensInStorage(themeOnRoot, modeOnRoot, tokens);
    setThemeModeInStorage(modeOnRoot);
  }

  // make page visible
  document.documentElement.classList.remove('invisible');

  return {
    name: getThemeOnRoot(),
    mode: getThemeModeFromStorage()?.includes('light')
      ? THEME_MDOES.LIGHT
      : THEME_MDOES.DARK,
    tokens: getTokensFromCss(),
  };
}
