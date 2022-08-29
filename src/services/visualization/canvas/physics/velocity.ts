import { DataVector2d, Vector2dDifference } from "../types";

export const relativeVelocity = (
  p1: DataVector2d,
  p2: DataVector2d
): Vector2dDifference => ({
  dvx: p2.vx - p1.vx,
  dvy: p2.vy - p1.vy,
});
