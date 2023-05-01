import { setDimensions as setCanvasDimensions } from './dimensions';

export interface Renderer {
  draw: (a: CanvasRenderingContext2D) => void;
  render: (a: CanvasRenderingContext2D) => void;
}

export interface Runner {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  context: CanvasRenderingContext2D | null;
  renderer: Renderer;
  control: number | null;
  running: boolean;
  setDimensions: (width?: number, height?: number) => void;
  draw: () => void;
  animate: () => void;
  start: (width?: number, height?: number) => void;
  stop: () => void;
}

export class Runner implements Runner {
  constructor(
    canvas: HTMLCanvasElement,
    renderer: Renderer,
    width: number,
    height: number,
  ) {
    this.running = false;
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.renderer = renderer;
    this.width = width;
    this.height = height;
  }

  setDimensions = (width?: number, height?: number) => {
    if (!this.context) return;
    const nextWidth = width || this.width;
    const nextHeight = height || this.height;

    this.width = nextWidth;
    this.height = nextHeight;
    setCanvasDimensions(this.canvas, this.context, nextWidth, nextHeight);
  };

  draw = () => {
    if (!this.context) return;

    this.renderer.draw(this.context);
  };

  render = () => {
    if (!this.context) return;
    this.renderer.render(this.context);
  };

  animate = () => {
    this.render();
    this.control = requestAnimationFrame(this.animate);
  };

  start = (width?: number, height?: number) => {
    if (this.running) return;
    this.running = true;
    this.setDimensions(width, height);
    this.animate();
  };

  stop = () => {
    if (this.control == null) return;

    cancelAnimationFrame(this.control);
    this.running = false;
    this.control = null;
  };
}
