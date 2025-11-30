import { ReactiveController, ReactiveControllerHost } from 'lit';

export class AnimationController implements ReactiveController {
  host: ReactiveControllerHost;

  private running?: boolean = false;
  private render?: () => void = undefined;
  private control?: number | null = null;

  constructor(host: ReactiveControllerHost) {
    (this.host = host).addController(this);

    this.running = false;
  }

  setRender(render: any) {
    this.render = render;
  }

  start = () => {
    if (this.running) return;
    this.running = true;

    if (this.control) {
      cancelAnimationFrame(this.control);
    }

    this.animate();
  };

  stop = () => {
    if (this.control == null) return;

    cancelAnimationFrame(this.control);
    this.running = false;
    this.control = null;
  };

  private animate = () => {
    this.render?.();
    this.control = requestAnimationFrame(this.animate);
  };

  hostConnected(): void {}
}
