export class FPSTracker {
  private frames: number[] = [];
  private lastFrameTime: number = 0;
  private readonly sampleSize: number;

  constructor(sampleSize: number = 60) {
    this.sampleSize = sampleSize;
  }

  tick(): void {
    const now = performance.now();

    if (this.lastFrameTime) {
      const delta = now - this.lastFrameTime;
      this.frames.push(delta);

      if (this.frames.length > this.sampleSize) {
        this.frames.shift();
      }
    }

    this.lastFrameTime = now;
  }

  getFPS(): number {
    if (this.frames.length === 0) return 0;

    const averageDelta = this.frames.reduce((a, b) => a + b, 0) / this.frames.length;
    return Math.round(1000 / averageDelta);
  }

  reset(): void {
    this.frames = [];
    this.lastFrameTime = 0;
  }
}
