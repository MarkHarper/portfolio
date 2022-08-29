export interface Renderer {
  render: (a: CanvasRenderingContext2D) => void;
}

export interface Runner {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D | null;
  renderer: Renderer;
  control: number | null;
  draw: () => void;
  animate: () => number;
  start: () => void;
  stop: () => void;
}

export class Runner implements Runner {
  constructor(canvas: HTMLCanvasElement, renderer: Renderer) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.renderer = renderer;
  }

  draw = () => {
    if (!this.context) return;

    this.renderer.render(this.context);
  };

  animate = (): number => {
    this.draw();
    return requestAnimationFrame(this.animate);
  };

  start = () => {
    this.control = this.animate();
  };

  stop = () => {
    if (this.control == null) return;

    cancelAnimationFrame(this.control);
    this.control = null;
  };
}
