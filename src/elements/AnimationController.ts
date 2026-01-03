import { ReactiveController, ReactiveControllerHost } from 'lit';
import { FPSTracker } from '~/services/visualization/canvas/fps-tracker';

export class AnimationController implements ReactiveController {
  host: ReactiveControllerHost;

  private running?: boolean = false;
  private render?: () => void = undefined;
  private control?: number | null = null;
  private fpsTracker: FPSTracker = new FPSTracker();

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

    this.fpsTracker.reset();
    this.animate();
  };

  stop = () => {
    if (this.control == null) return;

    cancelAnimationFrame(this.control);
    this.running = false;
    this.control = null;
  };

  private animate = () => {
    this.fpsTracker.tick();
    if (this.render) {
      this.render();
    }
    this.control = requestAnimationFrame(this.animate);
  };

  getFPS(): number {
    return this.fpsTracker.getFPS();
  }

  hostConnected(): void {}
}
