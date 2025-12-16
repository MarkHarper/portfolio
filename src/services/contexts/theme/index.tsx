import { createContext, useContext, useEffect, useReducer } from 'react';

import { Children } from '~/types/react';

import type { TThemeConfig, TThemeMode } from '../../theme/config';
import { getTokensFromCss } from '../../theme/html';
import themeReducer from './reducer';
import { initTheme } from '~/services/theme';

type TThemeContext = {
  name: string | null;
  mode: TThemeMode | null;
  tokens: TThemeConfig | null;
};

type ThemeContextProviderProps = {
  children: Children;
};

const ThemeContext = createContext<TThemeContext>({
  name: null,
  mode: null,
  tokens: null,
});
const ThemeDispatchContext = createContext(null);

export const ThemeContextProvider = ({
  children,
}: ThemeContextProviderProps) => {
  const [theme, dispatch] = useReducer(themeReducer, {
    name: null,
    mode: null,
    tokens: null,
  });

  useEffect(() => {
    const { name, mode, tokens } = initTheme() || {};

    dispatch({
      type: 'setTheme',
      name,
      mode,
      tokens,
    });
  }, []);

  // if mode changes, update tokens in state
  // get tokens in order: DOM, storage, config, generate defaults
  // update mode in DOM
  useEffect(() => {
    dispatch({
      type: 'setTokens',
      tokens: getTokensFromCss(),
    });
  }, [theme.mode]);

  // if name changes, update tokens in state
  // get tokens in order: DOM, storage, config, generate defaults
  // update name in DOM
  useEffect(() => {
    dispatch({
      type: 'setTokens',
      tokens: getTokensFromCss(),
    });
  }, [theme.name]);

  useEffect(() => {
    // write tokens to root
  }, [theme.tokens]);

  return (
    <ThemeContext value={theme}>
      <ThemeDispatchContext value={dispatch}>{children}</ThemeDispatchContext>
    </ThemeContext>
  );
};

export const useTheme = () => {
  return useContext(ThemeContext);
};

export const useThemeDispatch = () => {
  return useContext(ThemeDispatchContext);
};
