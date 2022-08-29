import {
  DataCircle,
  DataMovingCircleObject,
  DataMovingPoint,
  DataPoint,
} from "../types";
import { distance } from "./distance";
import { impulse } from "./impulse";
import { speed } from "./speed";
import { relativeVelocity } from "./velocity";

export function checkCollision(
  p1: DataCircle,
  p2: DataCircle,
  distanceSquared: number
): boolean {
  const combinedRadius = p2.radius + p1.radius;

  return distanceSquared <= combinedRadius * combinedRadius;
}

// Alters position and velocity of two colliding objects
// taking mass into account, but not rotation
export function handleCollision(
  p1: DataMovingCircleObject,
  p2: DataMovingCircleObject,
  dx: number,
  dy: number
): {
  p1: DataMovingPoint;
  p2: DataMovingPoint;
} {
  const dist = distance(dx, dy);

  // normalized collisiion vector
  const ncv: DataPoint = {
    x: dx / dist,
    y: dy / dist,
  };

  // relative velocity of p1 to p2
  const rv = relativeVelocity(p2, p1);
  const s = speed(rv, ncv);
  const imp = impulse(p1, p2, s);

  const p1Vx = p1.vx - imp * p2.mass * ncv.x;
  const p1Vy = p1.vy - imp * p2.mass * ncv.y;
  const p2Vx = p2.vx + imp * p1.mass * ncv.x;
  const p2Vy = p2.vy + imp * p1.mass * ncv.y;
  
  return {
    p1: {
      x: p1.x + p1Vx,
      y: p1.y + p1Vy,
      vx: p1Vx,
      vy: p1Vy,
    },
    p2: {
      x: p2.x + p2Vx,
      y: p2.y + p2Vy,
      vx: p2Vx,
      vy: p2Vy,
    },
  };
}
