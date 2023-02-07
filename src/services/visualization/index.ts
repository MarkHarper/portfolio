import { useContext, useEffect } from 'react';
import { SizingContext } from '../contexts/size';
import { VizContext } from '../contexts/viz';
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
  const { viz, setViz } = useContext(VizContext);
  const {
    size: { width, height },
  } = useContext(SizingContext);

  // set and start vizualization
  useEffect(() => {
    if (!width || !height || !canvas) return;
    const { width: refWidth, height: refHeight } = viz || {};
    const newWidth = refWidth && width !== refWidth;
    const newHeight = refHeight && height !== refHeight;
    const newDimensions = newWidth || newHeight;

    if (!viz) {
      const field = new Field(width, height);
      const runner = new Runner(canvas, field);

      const nextViz = {
        field,
        runner,
        isRunning: true,
        width,
        height,
      };
      runner.start();
      setViz(nextViz);
    } else if (viz && newDimensions) {
      viz.runner.stop();
      viz.field.setDimensions(width, height);
      viz.runner.start();
      setViz({
        ...viz,
        width,
        height,
      });
    }
  }, [width, height, canvas, viz, setViz]);

  return viz;
};

export { useVisualization };
