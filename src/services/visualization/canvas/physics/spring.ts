import { MovingCircleObject, DataVector2d } from "../types";

const DEFAULT_SPRING_STRENGTH = 0.0008;

export function spring(
  p1: MovingCircleObject,
  p2: MovingCircleObject,
  dx: number,
  dy: number
): {
  p1: DataVector2d;
  p2: DataVector2d;
} {
  const ax = dx * DEFAULT_SPRING_STRENGTH;
  const ay = dy * DEFAULT_SPRING_STRENGTH;

  return {
    p1: {
      vx: p1.vx + ax,
      vy: p1.vy + ay,
    },
    p2: {
      vx: p2.vx - ax,
      vy: p2.vy - ay,
    }
  }
}
