import { Particle } from './particle';
import { createOptimalBackend } from '../compute';
import { WebGPUComputeBackend } from '../compute/backends/webgpu-backend';
import { WebGPURenderer } from '../compute/webgpu-renderer';
import { hexToRGB } from '../canvas/color';

export class WebGPUField {
  width: number;
  height: number;
  settings: any;
  contents: Particle[];

  private computeBackend!: WebGPUComputeBackend;
  private renderer!: WebGPURenderer;
  private canvas: HTMLCanvasElement;
  private cellSize: number;  // Fixed cell size used for buffer allocation and runtime
  private isInitialized: boolean = false;
  private isRendering: boolean = false;
  private lastFrameTime: number = 0;
  private frameCount: number = 0;

  constructor(
    width: number,
    height: number,
    settings: any,
    canvas: HTMLCanvasElement,
  ) {
    this.width = width;
    this.height = height;
    this.settings = settings;
    this.canvas = canvas;
    this.contents = [];

    // Ensure reasonable defaults for undefined settings
    if (settings.edgeDistance === undefined || settings.edgeDistance > 500) {
      console.warn(`[WebGPUField] Invalid edgeDistance: ${settings.edgeDistance}, using default 150`);
      settings.edgeDistance = 150;
    }
    if (settings.springStrength === undefined || settings.springStrength < 0.01) {
      console.warn(`[WebGPUField] springStrength too weak: ${settings.springStrength}, using default 0.05`);
      settings.springStrength = 0.05;
    }
    if (settings.maxVelocity === undefined) {
      settings.maxVelocity = 2;
    }

    // Store cellSize as instance variable to ensure consistency between buffer allocation and runtime
    this.cellSize = settings.edgeDistance || 150;

    this.createParticles();
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      const backend = await createOptimalBackend();

      if (!(backend instanceof WebGPUComputeBackend)) {
        throw new Error('WebGPU not available');
      }

      this.computeBackend = backend;
      // Use instance cellSize for consistent grid dimensions
      this.computeBackend.createParticleBuffers(this.contents, this.width, this.height, this.cellSize);

      // Create WebGPU renderer using the same device
      this.renderer = new WebGPURenderer(
        (this.computeBackend as any).device,
        this.canvas,
        this.width,
        this.height
      );

      this.isInitialized = true;
    } catch (e) {
      console.error('[WebGPUField] Failed to initialize:', e);
      throw e;
    }
  }

  createParticles(): void {
    const { density, nodes } = this.settings;
    const area = this.width * this.height;
    const particleCount = Math.floor(area * density);
    const nodeOptionsArr = nodes ? [...nodes.values()] : [];
    const optionsCount = nodeOptionsArr.length;

    if (!nodes) {
      this.contents = [];
      return;
    }

    if (particleCount === 0) {
      this.contents = [];
      return;
    }

    this.contents = Array(particleCount)
      .fill(null)
      .map(() => {
        const optionIndex = Math.floor(Math.random() * optionsCount);
        const option = nodeOptionsArr[optionIndex];
        const vxRand = Math.random();
        const vxMag = vxRand * option.speed;
        const vyRand = Math.random();
        const vyMag = vyRand * option.speed;

        return new Particle({
          tag: option.id,
          radius: option.radius,
          mass: option.mass,
          fillStyle: option.color,
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          vx: vxRand > 0.5 ? vxMag : -vxMag,
          vy: vyRand > 0.5 ? vyMag : -vyMag,
        });
      });
  }

  updateParticles(): void {
    const { density, nodes } = this.settings;
    const area = this.width * this.height;
    const newParticleCount = Math.floor(area * density);
    const newContents = [];
    const nodeOptionsArr = nodes ? [...nodes.values()] : [];
    const optionsCount = nodes?.size;

    if (optionsCount) {
      for (let i = 0; i < newParticleCount; i++) {
        const existingParticle = this.contents[i];
        const option = nodes.get(existingParticle?.tag);

        if (existingParticle && option) {
          existingParticle.setMass(option.mass);
          existingParticle.setRadius(option.radius);
          existingParticle.setFillStyle(option.color);
          newContents.push(existingParticle);
        } else if (!existingParticle || !option) {
          const optionIndex = (Math.random() * optionsCount) | 0;
          const option = nodeOptionsArr[optionIndex];
          const vxRand = Math.random();
          const vxMag = vxRand * option.speed;
          const vyRand = Math.random();
          const vyMag = vyRand * option.speed;

          const newParticle = new Particle({
            tag: option.id,
            radius: option.radius,
            mass: option.mass,
            fillStyle: option.color,
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            vx: vxRand > 0.5 ? vxMag : -vxMag,
            vy: vyRand > 0.5 ? vyMag : -vyMag,
          });

          newContents.push(newParticle);
        }
      }
    }

    this.contents = newContents;

    if (this.computeBackend) {
      this.computeBackend.updateParticleData(this.contents);
    }
  }

  updateSettings(updates: any): void {
    this.settings = {
      ...this.settings,
      ...updates,
    };
  }

  setDimensions(width: number, height: number): void {
    this.width = width;
    this.height = height;
    if (this.renderer) {
      this.renderer.setSize(width, height);
    }
  }

  draw(): void {
    this.render();
  }

  render(): void {
    if (!this.isInitialized || this.isRendering) {
      return;
    }

    this.isRendering = true;
    this.renderAsync()
      .catch(e => {
        console.error('[WebGPUField] Render error:', e);
      })
      .finally(() => {
        this.isRendering = false;
      });
  }

  private async renderAsync(): Promise<void> {
    try {
      const { width, height } = this;
      const { springStrength, edgeDistance, maxVelocity, lineColor } = this.settings;

      if (!this.isInitialized || this.contents.length === 0) {
        return;
      }

      // Use instance cellSize for consistency (don't recalculate from settings)
      const gridWidth = Math.ceil(width / this.cellSize);
      const gridHeight = Math.ceil(height / this.cellSize);

      // Execute compute passes
      await this.computeBackend.executeSpatialHashPass({
        particleCount: this.contents.length,
        cellSize: this.cellSize,
        gridWidth,
        gridHeight,
        width,
        height,
      });

      await this.computeBackend.executePhysicsPass({
        particleCount: this.contents.length,
        springStrength: springStrength || 0.1,
        edgeDistance: edgeDistance || 150,  // Use 150 as fallback to match default cellSize
        edgeDistanceSquared: (edgeDistance || 150) * (edgeDistance || 150),
        maxVelocity: maxVelocity || 2,
        width,
        height,
        cellSize: this.cellSize,  // Use instance cellSize
        gridWidth,
        gridHeight,
      });

      // Render directly from GPU buffers (zero-copy!)
      const rgb = hexToRGB(lineColor || '#ffffff');
      this.renderer.render(
        (this.computeBackend as any).particleBufferManager,
        (this.computeBackend as any).gridBufferManager,
        this.contents.length,
        rgb
      );

      // Track frame timing for FPS calculation
      const now = performance.now();
      this.lastFrameTime = now;
      this.frameCount++;
    } catch (error) {
      console.error('[WebGPUField] Render error:', error);
      throw error;
    }
  }

  renderFPS(_fps: number): void {
    // FPS rendering handled elsewhere
  }
}
