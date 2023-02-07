export interface Renderer {
  render: (a: CanvasRenderingContext2D) => void;
}

export interface Runner {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D | null;
  renderer: Renderer;
  control: number | null;
  running: boolean;
  draw: () => void;
  animate: () => void;
  start: () => void;
  stop: () => void;
}

export class Runner implements Runner {
  constructor(canvas: HTMLCanvasElement, renderer: Renderer) {
    this.running = false;
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.renderer = renderer;
  }

  draw = () => {
    if (!this.context) return;

    this.renderer.render(this.context);
  };

  animate = () => {
    this.draw();
    this.control = requestAnimationFrame(this.animate);
  };

  start = () => {
    if (this.running) return;

    this.running = true;
    this.animate();
  };

  stop = () => {
    if (this.control == null) return;

    cancelAnimationFrame(this.control);
    this.running = false;
    this.control = null;
  };
}
