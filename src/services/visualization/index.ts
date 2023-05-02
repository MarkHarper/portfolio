import { useEffect } from 'react';
import { useSize } from '~/services/contexts/size';
import { useThemeName } from '~/services/contexts/theme';
import { useViz } from '~/services/contexts/viz';
import { getThemeConfig } from '~/services/theme';
import { ThemeConfig, ThemeName } from '~/services/theme/config';

import { Runner } from './canvas/runner';
import { Field } from './particles/field';

export interface VizState {
  field: Field;
  runner: Runner;
  width: number;
  height: number;
  isRunning: boolean;
}

const useVisualization = (canvas: HTMLCanvasElement | null) => {
  const { viz, setViz } = useViz();
  const {
    size: { width, height },
  } = useSize();
  const { themeName } = useThemeName();

  // set and start vizualization
  useEffect(() => {
    if (!width || !height || !canvas) return;
    const { width: refWidth, height: refHeight } = viz || {};
    const newWidth = refWidth && width !== refWidth;
    const newHeight = refHeight && height !== refHeight;
    const newDimensions = newWidth || newHeight;
    const themeConfig = getThemeConfig(themeName);
    const theme: [ThemeName, ThemeConfig] = [themeName, themeConfig];

    if (!viz) {
      const field = new Field(width, height, theme);
      const runner = new Runner(canvas, field, width, height);

      const nextViz = {
        field,
        runner,
        isRunning: true,
        width,
        height,
      };

      runner.start(width, height);
      setViz(nextViz);
    } else if (viz && newDimensions) {
      viz.runner.stop();
      viz.field.setDimensions(width, height);
      viz.runner.setDimensions(width, height);

      if (viz.isRunning) {
        viz.runner.start(width, height);
      } else {
        viz.runner.draw();
      }
      setViz({
        ...viz,
        width,
        height,
      });
    } else if (viz && themeName !== viz.field.themeName) {
      viz.field.setTheme(theme);
      viz.runner.draw();
    }
  }, [width, height, canvas, viz, setViz, themeName]);

  return viz;
};

export { useVisualization };
