import { ThemeConfig, ThemeName } from '~/services/theme/config';
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
  themeName: ThemeName;
  themeConfig: ThemeConfig;
  settings: any;
  themeMainRGB: RGB;
  contents: Particle[];
  createParticles(): void;
  updateParticles(): void;
  setWidth(a: number): void;
  setHeight(a: number): void;
  setDimensions(a: number, b: number): void;
  setTheme(a: [ThemeName, ThemeConfig]): void;
  draw(): void;
  render(): void;
}

export class Field implements Field {
  constructor(
    width: number,
    height: number,
    theme: [ThemeName, ThemeConfig],
    settings: any,
    canvas: HTMLCanvasElement,
  ) {
    const [themeName, themeConfig] = theme;

    this.width = width;
    this.height = height;
    this.themeName = themeName;
    this.themeConfig = themeConfig;

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
    const values = nodes?.values();
    const nodeOptionsArr = values ? Array.from(values) : [];
    const optionsCount = nodeOptionsArr.length;

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

  setTheme(theme: [ThemeName, ThemeConfig]) {
    const [themeName, themeConfig] = theme;
    this.themeName = themeName;
    this.themeConfig = themeConfig;
    this.themeMainRGB = hexToRGB(this.settings.lineColor);
    const { nodes } = this.settings;

    this.contents.forEach((particle) => {
      const nextFillStyle = nodes.get(particle.tag).color;

      particle.setFillStyle(nextFillStyle);
    });
  }

  draw = (): void => {
    const { width, height, ctx } = this;
    const { r, g, b } = this.themeMainRGB;
    const { edgeDistance } = this.settings;

    clear(ctx, width, height);

    this.contents.forEach((p1, ind1) => {
      this.contents.forEach((p2, ind2) => {
        if (ind1 === ind2) return;

        const { directSquared } = distanceSquared(p1, p2);
        if (directSquared < edgeDistance) {
          const alpha = alphaRGB(directSquared / edgeDistance);
          renderLine(p1, p2, rgba(r, g, b, alpha), ctx);
        }
      });
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

    this.contents.forEach((p1, ind1) => {
      this.contents.forEach((p2, ind2) => {
        if (ind1 === ind2) return;

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
          renderLine(p1, p2, rgba(r, g, b, alpha), ctx);

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

    this.contents.forEach((particle) => {
      const possibleX = particle.x + particle.vx;
      const x = clamp(possibleX, 0, width);

      const possibleY = particle.y + particle.vy;
      const y = clamp(possibleY, 0, height);

      particle.setPosition(x, y);
      particle.render(ctx);
    });
  };
}
