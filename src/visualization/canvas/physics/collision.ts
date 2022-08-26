import {
  DataCircle,
  DataMovingCircleObject,
  DataMovingPoint,
  DataPoint,
} from "../types";

export function checkCollision(
  p1: DataCircle,
  p2: DataCircle,
  distance: number
): boolean {
  return distance <= p2.radius + p1.radius;
}

export function handleCollision(
  p1: DataMovingCircleObject,
  p2: DataMovingCircleObject,
  dx: number,
  dy: number
): {
  p1: DataMovingPoint;
  p2: DataMovingPoint;
} {
  const angle = Math.atan2(dy, dx);
  const sine = Math.sin(angle);
  const cosine = Math.cos(angle);

  const pos1: DataPoint = {
    x: 0,
    y: 0,
  };
  const pos2 = rotate(dx, dy, sine, cosine, true);
  const vel1 = rotate(p1.vx, p1.vy, sine, cosine, true);
  const vel2 = rotate(p2.vx, p2.vy, sine, cosine, true);
  const vxTotal = vel1.x - vel2.x;
  vel1.x =
    ((p1.mass - p2.mass) * vel1.x + 2 * p2.mass * vel2.x) / (p1.mass + p2.mass);
  vel2.x = vxTotal + vel1.x;

  const absV = Math.abs(vel1.x) + Math.abs(vel2.x);
  const overlap = p1.radius + p2.radius - Math.abs(pos1.x - pos2.x);

  pos1.x += (vel1.x / absV) * overlap;
  pos2.x += (vel2.x / absV) * overlap;

  const pos1F = rotate(pos1.x, pos1.y, sine, cosine, false);
  const pos2F = rotate(pos2.x, pos2.y, sine, cosine, false);
  const vel1F = rotate(vel1.x, vel1.y, sine, cosine, false);
  const vel2F = rotate(vel2.x, vel2.y, sine, cosine, false);

  return {
    p1: {
      x: p1.x + pos1F.x,
      y: p1.y + pos1F.y,
      vx: vel1F.x,
      vy: vel1F.y,
    },
    p2: {
      x: p1.x + pos2F.x,
      y: p1.y + pos2F.y,
      vx: vel2F.x,
      vy: vel2F.y,
    },
  };
}

function rotate(
  x: number,
  y: number,
  sine: number,
  cosine: number,
  reverse: boolean
): DataPoint {
  if (reverse) {
    return {
      x: x * cosine + y * sine,
      y: y * cosine - x * sine,
    };
  }

  return {
    x: x * cosine - y * sine,
    y: y * cosine + x * sine,
  };
}
