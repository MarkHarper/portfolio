import { useCallback } from 'react';

import { useTheme, useThemeDispatch } from '~/services/contexts/theme';
import { STATIC_THEME_NAMES } from '~/services/theme/config';
import {
  getTokensFromCss,
  resetStyleOnRoot,
  setThemeOnRoot,
} from '~/services/theme/html';
import {
  getThemeTokensFromStorage,
  setThemeNameInStorage,
  setThemeTokensInStorage,
} from '~/services/theme/storage';
import { useViz, useVizDispatch } from '~/services/contexts/viz';
import Palette from '../Palette';

const THEME_NAMES = Object.values(STATIC_THEME_NAMES);

const PaletteSelector = () => {
  const { name: currentThemeName, mode } = useTheme();
  const settings = useViz();
  const vizDispatch = useVizDispatch();
  const themeDispatch = useThemeDispatch();

  const switchTheme = useCallback(
    (newThemeName: string) => {
      if (newThemeName === currentThemeName) return;
      if (!mode) return;

      resetStyleOnRoot();
      setThemeOnRoot(newThemeName);
      themeDispatch?.({
        type: 'setName',
        name: newThemeName,
      });
      setThemeNameInStorage(newThemeName);

      const tokens =
        getThemeTokensFromStorage(newThemeName, mode) || getTokensFromCss();
      themeDispatch?.({
        type: 'setTokens',
        tokens,
      });

      // Store the tokens for this theme/mode combination
      if (tokens) {
        setThemeTokensInStorage(newThemeName, mode, tokens);
      }

      // Update visualization nodes with new theme colors if available
      if (settings && vizDispatch) {
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
      }
    },
    [currentThemeName, mode, settings, vizDispatch, themeDispatch],
  );

  return (
    <div className='wa-grid wa-gap-xs'>
      {THEME_NAMES.map((themeName) => (
        <Palette
          key={themeName}
          themeName={themeName}
          isActive={themeName === currentThemeName}
          onClick={() => switchTheme(themeName)}
        />
      ))}
    </div>
  );
};

export default PaletteSelector;
