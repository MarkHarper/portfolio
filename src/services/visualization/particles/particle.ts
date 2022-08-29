import { renderCircle } from '../canvas/shapes/circle';
import { MovingCircleObject } from '../canvas/types';

const DEFAULT_FILL_COLOR = '#FFFFFF';
const DEFAULT_SCALE_X = 1.0;
const DEFAULT_SCALE_Y = 1.0;

export interface Particle extends MovingCircleObject {
  xScale: number;
  yScale: number;
  fillStyle: string;

  render(ctx: CanvasRenderingContext2D): void;
  setFillStyle(a: string): void;
  setVelocity(vx: number, vy: number): void;
}

export class Particle implements Particle {
  xScale = DEFAULT_SCALE_X;
  yScale = DEFAULT_SCALE_Y;

  constructor({
    mass,
    radius,
    x,
    y,
    vx,
    vy,
    fillStyle,
  }: {
    mass: number;
    radius: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    fillStyle?: string;
  }) {
    this.mass = mass;
    this.radius = radius;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;

    this.fillStyle = fillStyle || DEFAULT_FILL_COLOR;
  }

  render = (ctx: CanvasRenderingContext2D): void => {
    const { x, y, radius, xScale, yScale, fillStyle } = this;

    renderCircle(
      {
        x,
        y,
        radius,
      },
      xScale,
      yScale,
      fillStyle,
      ctx,
    );
  };

  setVelocity = (vx: number, vy: number) => {
    this.setVx(vx);
    this.setVy(vy);
  };

  setPosition = (x: number, y: number) => {
    this.setX(x);
    this.setY(y);
  };

  setMass = (mass: number) => {
    this.mass = mass;
  };

  setFillStyle = (fillStyle: string) => {
    this.fillStyle = fillStyle;
  };

  setX = (x: number) => {
    this.x = x;
  };

  setY = (y: number) => {
    this.y = y;
  };

  setVx = (vx: number) => {
    this.vx = vx;
  };

  setVy = (vy: number) => {
    this.vy = vy;
  };
}
