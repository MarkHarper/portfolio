import { useCallback } from 'react';

import '@awesome.me/webawesome/dist/components/button/button.js';
import '@awesome.me/webawesome/dist/components/icon/icon.js';

import { useTheme, useThemeDispatch } from '~/services/contexts/theme';
import { THEME_MDOES } from '~/services/theme/config';
import {
  getTokensFromCss,
  resetStyleOnRoot,
  setModeOnRoot,
} from '~/services/theme/html';
import {
  getThemeTokensFromStorage,
  setThemeModeInStorage,
} from '~/services/theme/storage';
import { useViz, useVizDispatch } from '~/services/contexts/viz';

const ThemeToggle = () => {
  const { name, mode } = useTheme();
  const settings = useViz();
  const vizDispatch = useVizDispatch();
  const themeDispatch = useThemeDispatch();

  const toggleMode = useCallback(() => {
    const newMode =
      mode === THEME_MDOES.LIGHT ? THEME_MDOES.DARK : THEME_MDOES.LIGHT;

    resetStyleOnRoot();
    setModeOnRoot(newMode);
    themeDispatch({
      type: 'setMode',
      mode: newMode,
    });
    setThemeModeInStorage(newMode);

    const tokens =
      getThemeTokensFromStorage(name, newMode) || getTokensFromCss();
    themeDispatch({
      type: 'setTokens',
      tokens,
    });

    const nodeMap = new Map(
      Array.from(settings.nodes).map(([id, data]) => {
        return [
          id,
          {
            ...data,
            color: tokens?.[data.colorVar],
          },
        ];
      }),
    );

    vizDispatch({
      type: 'setSettings',
      settings: {
        ...settings,
        nodes: nodeMap,
      },
    });
  }, [mode, settings, vizDispatch, themeDispatch]);

  return (
    <wa-button appearance='plain' size='small' onclick={toggleMode} pill>
      <wa-icon name={mode === THEME_MDOES.LIGHT ? 'sun' : 'moon'}></wa-icon>
    </wa-button>
  );
};

export default ThemeToggle;
