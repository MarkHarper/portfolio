import { clear } from "../canvas";
import { alphaRGB, rgba } from "../canvas/color";
import { checkCollision } from "../canvas/physics/checkCollision";
import { clamp } from "../canvas/physics/clamp";
import { distance } from "../canvas/physics/distance";
import { spring } from "../canvas/physics/spring";
import { Renderer } from "../canvas/runner";
import { renderLine } from "../canvas/shapes/line";
import { DEFAULT_MIN_DISTANCE } from "./constants";
import { Particle } from "./particle";

const DEFAULT_PARTICLE_COUNT = 45;

export interface Field extends Renderer {
  width: number;
  height: number;
  contents: Particle[];
  checkCollision: (p1: Particle, p2: Particle, dx: number, dy: number) => void;
  spring: (p1: Particle, p2: Particle, dx: number, dy: number) => void;
  renderSpring: (
    p1: Particle,
    p2: Particle,
    dist: number,
    ctx: CanvasRenderingContext2D
  ) => void;
}

export class Field implements Field {
  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.contents = Array(DEFAULT_PARTICLE_COUNT)
      .fill(null)
      .map(() => {
        if (Math.random() > 0.66) {
          return new Particle({
            radius: 5,
            mass: 3,
            fillStyle: "#26A69A",
            x: Math.random() * width,
            y: Math.random() * height,
            vx: Math.random() * 2 - 1,
            vy: Math.random() * 2 - 1,
          });
        }

        return new Particle({
          radius: 3,
          mass: 2,
          fillStyle: "#8BE5DC",
          x: Math.random() * width,
          y: Math.random() * height,
          vx: Math.random() * 4 - 2,
          vy: Math.random() * 4 - 2,
        });
      });
  }

  render = (ctx: CanvasRenderingContext2D): void => {
    const { width, height } = this;
    clear(ctx, width, height);

    this.contents.forEach((particle) => {
      const possibleX = particle.x + particle.vx;
      const x = clamp(possibleX, 0, width);

      const possibleY = particle.y + particle.vy;
      const y = clamp(possibleY, 0, height);

      particle.setX(x);
      particle.setY(y);
      particle.render(ctx);
    });

    this.contents.forEach((p1, ind1) => {
      this.contents.forEach((p2, ind2) => {
        if (ind1 === ind2) return;

        const { dx, dy, direct: dist } = distance(p1, p2);

        if (dist <= p2.radius + p1.radius) {
          const { p1: nextP1, p2: nextP2 } = checkCollision(p1, p2, dx, dy);

          p1.setX(nextP1.x);
          p1.setY(nextP1.y);
          p1.setVx(nextP1.vx);
          p1.setVy(nextP1.vy);

          p2.setX(nextP2.x);
          p2.setY(nextP2.y);
          p2.setVx(nextP2.vx);
          p2.setVy(nextP2.vy);
        } else if (dist < DEFAULT_MIN_DISTANCE) {
          const alpha = alphaRGB(dist / DEFAULT_MIN_DISTANCE);
          renderLine(p1, p2, rgba(38, 166, 154, alpha), ctx);

          const {
            p1: nextP1,
            p2: nextP2,
          } = spring(p1, p2, dx, dy);
          p1.setVx(nextP1.vx);
          p1.setVy(nextP1.vy);
          p2.setVx(nextP2.vx);
          p2.setVy(nextP2.vy);
        }
      });
    });
  };
}
