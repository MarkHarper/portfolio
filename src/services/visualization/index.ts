import { Runner } from './canvas/runner';
import { Field } from './particles/field';

const visualize = (width: number, height: number, canvas: HTMLCanvasElement): void => {
  const field = new Field(width, height);
  const runner = new Runner(canvas, field);

  runner.start();
};

export default visualize;
