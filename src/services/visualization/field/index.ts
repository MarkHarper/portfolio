import { clear } from '../canvas';
import { alphaRGB, hexToRGB, RGB, rgba } from '../canvas/color';
import { checkCollision, handleCollision } from '../canvas/physics/collision';
import { clamp } from '../canvas/physics/clamp';
import { distanceSquared } from '../canvas/physics/distance';
import { spring } from '../canvas/physics/spring';
import { setDimensions as setCanvasDimensions } from '../canvas/dimensions';
import { renderLine } from '../canvas/shapes/line';
import { Particle } from './particle';

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

    const edgesByAlpha = new Map<
      number,
      Array<{ p1: Particle; p2: Particle }>
    >();

    this.contents.forEach((p1, ind1) => {
      this.contents.forEach((p2, ind2) => {
        if (ind2 <= ind1) return;

        const { directSquared } = distanceSquared(p1, p2);
        if (directSquared < edgeDistance) {
          const alpha = alphaRGB(directSquared / edgeDistance);
          if (!edgesByAlpha.has(alpha)) {
            edgesByAlpha.set(alpha, []);
          }
          edgesByAlpha.get(alpha)?.push({ p1, p2 });
        }
      });
    });

    edgesByAlpha.forEach((edges, alpha) => {
      ctx.beginPath();
      ctx.strokeStyle = rgba(r, g, b, alpha);
      edges.forEach(({ p1, p2 }) => {
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
      });
      ctx.stroke();
    });

    this.contents.forEach((particle) => {
      particle.render(ctx);
    });
  };

  render = (): void => {
    const { width, height, ctx } = this;
    const { r, g, b } = this.themeMainRGB;
    const { springStrength, edgeDistance, maxVelocity } = this.settings;

    clear(ctx, width, height);

    const edgesByAlpha = new Map<
      number,
      Array<{ p1: Particle; p2: Particle }>
    >();

    this.contents.forEach((p1, ind1) => {
      this.contents.forEach((p2, ind2) => {
        if (ind2 <= ind1) return;

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
          const alpha = alphaRGB(directSquared / edgeDistance);
          if (!edgesByAlpha.has(alpha)) {
            edgesByAlpha.set(alpha, []);
          }
          edgesByAlpha.get(alpha).push({ p1, p2 });

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
      });
    });

    edgesByAlpha.forEach((edges, alpha) => {
      ctx.beginPath();
      ctx.strokeStyle = rgba(r, g, b, alpha);
      edges.forEach(({ p1, p2 }) => {
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
      });
      ctx.stroke();
    });

    this.contents.forEach((particle) => {
      const possibleX = particle.x + particle.vx;
      const x = clamp(possibleX, 0, width);

      const possibleY = particle.y + particle.vy;
      const y = clamp(possibleY, 0, height);

      particle.setPosition(x, y);
      particle.render(ctx);
    });
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
