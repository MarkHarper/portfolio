import {
  DataCircle,
  DataMovingCircleObject,
  DataMovingPoint,
  DataPoint,
} from '../types';
import { distance } from './distance';
import { impulse } from './impulse';
import { speed } from './speed';
import { relativeVelocity } from './velocity';

const MAX_VELOCITY = 10;

export function checkCollision(
  p1: DataCircle,
  p2: DataCircle,
  distanceSquared: number,
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
  dy: number,
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

  if (s < 0) {
    return {
      p1: {
        x: p1.x,
        y: p1.y,
        vx: p1.vx,
        vy: p1.vy,
      },
      p2: {
        x: p2.x,
        y: p2.y,
        vx: p2.vx,
        vy: p2.vy,
      },
    };
  }

  const imp = impulse(p1, p2, s);
  const p1Vx = p1.vx - imp * p2.mass * ncv.x;
  const p1Vy = p1.vy - imp * p2.mass * ncv.y;
  const p2Vx = p2.vx + imp * p1.mass * ncv.x;
  const p2Vy = p2.vy + imp * p1.mass * ncv.y;

  const limitedVx1 = Math.abs(p1Vx) > MAX_VELOCITY ? MAX_VELOCITY : p1Vx;
  const limitedVy1 = Math.abs(p1Vy) > MAX_VELOCITY ? MAX_VELOCITY : p1Vy;
  const limitedVx2 = Math.abs(p2Vx) > MAX_VELOCITY ? MAX_VELOCITY : p2Vx;
  const limitedVy2 = Math.abs(p2Vy) > MAX_VELOCITY ? MAX_VELOCITY : p2Vy;

  const declinedVx1 = limitedVx1 * 0.999;
  const declinedVy1 = limitedVy1 * 0.999;
  const declinedVx2 = limitedVx2 * 0.999;
  const declinedVy2 = limitedVy2 * 0.999;

  return {
    p1: {
      x: p1.x + declinedVx1,
      y: p1.y + declinedVy1,
      vx: declinedVx1,
      vy: declinedVy1,
    },
    p2: {
      x: p2.x + declinedVx2,
      y: p2.y + declinedVy2,
      vx: declinedVy2,
      vy: declinedVy2,
    },
  };
}
