import { ThemeConfig, ThemeName } from '~/services/theme/config';
import { clear } from '../canvas';
import { alphaRGB, hexToRGB, RGB, rgba } from '../canvas/color';
import { checkCollision, handleCollision } from '../canvas/physics/collision';
import { clamp } from '../canvas/physics/clamp';
import { distanceSquared } from '../canvas/physics/distance';
import { spring } from '../canvas/physics/spring';
import { Renderer } from '../canvas/runner';
import { renderLine } from '../canvas/shapes/line';
import {
  DEFAULT_MIN_DISTANCE_SQUARED,
  LARGE_MASS,
  LARGE_RADIUS,
  SMALL_MASS,
  SMALL_RADIUS,
} from './constants';
import { Particle } from './particle';

const DENSITY = 0.00015;

const PARTICLE_OPTIONS = {
  A: {
    color: '--color-item-A',
    mass: LARGE_MASS,
    radius: LARGE_RADIUS,
    speedA: 2,
    speedB: 1,
  },
  B: {
    color: '--color-item-B',
    mass: SMALL_MASS,
    radius: SMALL_RADIUS,
    speedA: 4,
    speedB: 2,
  },
  C: {
    color: '--color-item-C',
    mass: LARGE_MASS,
    radius: LARGE_RADIUS,
    speedA: 2,
    speedB: 1,
  },
  D: {
    color: '--color-item-D',
    mass: SMALL_MASS,
    radius: SMALL_RADIUS,
    speedA: 4,
    speedB: 2,
  },
};
const PARTICLE_OPTION_TYPES = ['A', 'B', 'D'];

export interface Field extends Renderer {
  width: number;
  height: number;
  themeName: ThemeName;
  themeConfig: ThemeConfig;
  themeMainRGB: RGB;
  contents: Particle[];
  resetParticles(): void;
  setWidth(a: number): void;
  setHeight(a: number): void;
  setDimensions(a: number, b: number): void;
  setTheme(a: [ThemeName, ThemeConfig]): void;
  draw(a: CanvasRenderingContext2D): void;
  render(a: CanvasRenderingContext2D): void;
}

export class Field implements Field {
  constructor(width: number, height: number, theme: [ThemeName, ThemeConfig]) {
    const [themeName, themeConfig] = theme;
    this.width = width;
    this.height = height;
    this.themeName = themeName;
    this.themeConfig = themeConfig;
    this.themeMainRGB = hexToRGB(themeConfig['--color-item-C']);

    this.resetParticles();
  }

  resetParticles() {
    const area = this.width * this.height;
    const particleCount = Math.floor(area * DENSITY);

    this.contents = Array(particleCount)
      .fill(null)
      .map((_, i) => {
        const optionIndex = (Math.random() * PARTICLE_OPTION_TYPES.length) | 0;
        const optionType = PARTICLE_OPTION_TYPES[optionIndex];
        const option = PARTICLE_OPTIONS[optionType];

        return new Particle({
          tag: optionType,
          radius: option.radius,
          mass: option.mass,
          fillStyle: this.themeConfig[option.color],
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          vx: Math.random() * option.speedA - option.speedB,
          vy: Math.random() * option.speedA - option.speedB,
        });
      });
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
  }

  setTheme(theme: [ThemeName, ThemeConfig]) {
    const [themeName, themeConfig] = theme;
    this.themeName = themeName;
    this.themeConfig = themeConfig;
    this.themeMainRGB = hexToRGB(themeConfig['--color-item-C']);

    this.contents.forEach((particle) => {
      const nextFillStyle = themeConfig[PARTICLE_OPTIONS[particle.tag].color];

      particle.setFillStyle(nextFillStyle);
    });
  }

  draw = (ctx: CanvasRenderingContext2D): void => {
    const { width, height } = this;
    const { r, g, b } = this.themeMainRGB;
    clear(ctx, width, height);

    this.contents.forEach((p1, ind1) => {
      this.contents.forEach((p2, ind2) => {
        if (ind1 === ind2) return;

        const { directSquared } = distanceSquared(p1, p2);
        if (directSquared < DEFAULT_MIN_DISTANCE_SQUARED) {
          const alpha = alphaRGB(directSquared / DEFAULT_MIN_DISTANCE_SQUARED);
          renderLine(p1, p2, rgba(r, g, b, alpha), ctx);
        }
      });
    });

    this.contents.forEach((particle) => {
      particle.render(ctx);
    });
  };

  render = (ctx: CanvasRenderingContext2D): void => {
    const { width, height } = this;
    const { r, g, b } = this.themeMainRGB;
    clear(ctx, width, height);

    this.contents.forEach((p1, ind1) => {
      this.contents.forEach((p2, ind2) => {
        if (ind1 === ind2) return;

        const { dx, dy, directSquared } = distanceSquared(p1, p2);
        if (checkCollision(p1, p2, directSquared)) {
          const { p1: nextP1, p2: nextP2 } = handleCollision(p1, p2, dx, dy);

          p1.setPosition(nextP1.x, nextP1.y);
          p1.setVelocity(nextP1.vx, nextP1.vy);

          p2.setPosition(nextP2.x, nextP2.y);
          p2.setVelocity(nextP2.vx, nextP2.vy);
        } else if (directSquared < DEFAULT_MIN_DISTANCE_SQUARED) {
          const alpha = alphaRGB(directSquared / DEFAULT_MIN_DISTANCE_SQUARED);
          renderLine(p1, p2, rgba(r, g, b, alpha), ctx);

          const { p1: nextP1, p2: nextP2 } = spring(p1, p2, dx, dy);
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
