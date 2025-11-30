import { MovingCircleObject, DataVector2d } from '../types';

export function spring(
  p1: MovingCircleObject,
  p2: MovingCircleObject,
  dx: number,
  dy: number,
  strength: number,
): {
  p1: DataVector2d;
  p2: DataVector2d;
} {
  const ax = dx * strength;
  const ay = dy * strength;

  return {
    p1: {
      vx: p1.vx + ax,
      vy: p1.vy + ay,
    },
    p2: {
      vx: p2.vx - ax,
      vy: p2.vy - ay,
    },
  };
}
