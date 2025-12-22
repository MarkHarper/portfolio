import { clear } from '../canvas';
import { alphaRGB, hexToRGB, RGB, rgba } from '../canvas/color';
import { checkCollision, handleCollision } from '../canvas/physics/collision';
import { clamp } from '../canvas/physics/clamp';
import { distanceSquared } from '../canvas/physics/distance';
import { spring } from '../canvas/physics/spring';
import { setDimensions as setCanvasDimensions } from '../canvas/dimensions';
import { renderLine } from '../canvas/shapes/line';
import { Particle } from './particle';
import { SpatialHashGrid } from '../canvas/spatial-hash-grid';

type Renderer = {
  draw: (a: CanvasRenderingContext2D) => void;
  render: (a: CanvasRenderingContext2D) => void;
};

export interface Field extends Renderer {
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  settings: any;
  themeMainRGB: RGB;
  contents: Particle[];
  createParticles(): void;
  updateParticles(): void;
  setWidth(a: number): void;
  setHeight(a: number): void;
  setDimensions(a: number, b: number): void;
  draw(): void;
  render(): void;
  renderFPS(fps: number): void;
}

export class Field implements Field {
  private spatialGrid: SpatialHashGrid;
  private particleIndexMap: Map<Particle, number>;

  constructor(
    width: number,
    height: number,
    settings: any,
    canvas: HTMLCanvasElement,
  ) {
    this.width = width;
    this.height = height;

    this.settings = settings;
    this.themeMainRGB = hexToRGB(settings.lineColor);

    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.spatialGrid = new SpatialHashGrid(settings.edgeDistance);
    this.particleIndexMap = new Map();

    setCanvasDimensions(canvas, this.ctx, width, height);
    this.createParticles();
  }

  updateSettings(updates) {
    this.settings = {
      ...this.settings,
      ...updates,
    };

    if (updates.lineColor) {
      this.themeMainRGB = hexToRGB(updates.lineColor);
    }

    if (updates.edgeDistance) {
      this.spatialGrid = new SpatialHashGrid(updates.edgeDistance);
    }
  }

  createParticles() {
    const { density, nodes } = this.settings;

    const area = this.width * this.height;
    const particleCount = Math.floor(area * density);
    const values = nodes?.values();
    const nodeOptionsArr = values ? Array.from(values) : [];
    const optionsCount = nodeOptionsArr.length;

    if (!nodes) {
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

  updateParticles() {
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
        } else if (existingParticle && !option) {
          continue;
        } else {
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
  }

  setWidth(width: number) {
    this.width = width;
  }

  setHeight(height: number) {
    this.height = height;
  }

  setDimensions(width: number, height: number) {
    this.setWidth(width);
    this.setHeight(height);

    setCanvasDimensions(this.canvas, this.ctx, width, height);
  }

  draw = (): void => {
    const { width, height, ctx } = this;
    const { r, g, b } = this.themeMainRGB;
    const { edgeDistance } = this.settings;

    clear(ctx, width, height);

    this.spatialGrid.clear();
    this.particleIndexMap.clear();
    for (let i = 0; i < this.contents.length; i++) {
      const particle = this.contents[i];
      this.spatialGrid.insert(particle);
      this.particleIndexMap.set(particle, i);
    }

    ctx.beginPath();
    ctx.strokeStyle = rgba(r, g, b, 0.3);

    for (let i = 0; i < this.contents.length; i++) {
      const p1 = this.contents[i];
      const nearby = this.spatialGrid.getNearbyParticles(p1);

      for (let j = 0; j < nearby.length; j++) {
        const p2 = nearby[j];
        const p2Index = this.particleIndexMap.get(p2)!;
        if (p2Index <= i) continue;

        const { directSquared } = distanceSquared(p1, p2);
        if (directSquared < edgeDistance) {
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
        }
      }
    }
    ctx.stroke();

    for (let i = 0; i < this.contents.length; i++) {
      this.contents[i].render(ctx);
    }
  };

  render = (): void => {
    const { width, height, ctx } = this;
    const { r, g, b } = this.themeMainRGB;
    const { springStrength, edgeDistance, maxVelocity } = this.settings;

    clear(ctx, width, height);

    this.spatialGrid.clear();
    this.particleIndexMap.clear();
    for (let i = 0; i < this.contents.length; i++) {
      const particle = this.contents[i];
      this.spatialGrid.insert(particle);
      this.particleIndexMap.set(particle, i);
    }

    ctx.beginPath();
    ctx.strokeStyle = rgba(r, g, b, 0.3);

    for (let i = 0; i < this.contents.length; i++) {
      const p1 = this.contents[i];
      const nearby = this.spatialGrid.getNearbyParticles(p1);

      for (let j = 0; j < nearby.length; j++) {
        const p2 = nearby[j];
        const p2Index = this.particleIndexMap.get(p2)!;
        if (p2Index <= i) continue;

        const { dx, dy, directSquared } = distanceSquared(p1, p2);
        if (checkCollision(p1, p2, directSquared)) {
          const { p1: nextP1, p2: nextP2 } = handleCollision(
            p1,
            p2,
            dx,
            dy,
            maxVelocity,
          );

          p1.setPosition(nextP1.x, nextP1.y);
          p1.setVelocity(nextP1.vx, nextP1.vy);

          p2.setPosition(nextP2.x, nextP2.y);
          p2.setVelocity(nextP2.vx, nextP2.vy);
        } else if (directSquared < edgeDistance) {
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);

          const { p1: nextP1, p2: nextP2 } = spring(
            p1,
            p2,
            dx,
            dy,
            springStrength,
          );
          p1.setVelocity(nextP1.vx, nextP1.vy);
          p2.setVelocity(nextP2.vx, nextP2.vy);
        }
      }
    }
    ctx.stroke();

    for (let i = 0; i < this.contents.length; i++) {
      const particle = this.contents[i];
      const possibleX = particle.x + particle.vx;
      const x = clamp(possibleX, 0, width);

      const possibleY = particle.y + particle.vy;
      const y = clamp(possibleY, 0, height);

      particle.setPosition(x, y);
      particle.render(ctx);
    }
  };

  renderFPS(fps: number): void {
    const { ctx } = this;
    ctx.font = '16px monospace';
    ctx.fillStyle = rgba(
      this.themeMainRGB.r,
      this.themeMainRGB.g,
      this.themeMainRGB.b,
      1,
    );
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`FPS: ${fps}`, 10, 10);
  }
}
