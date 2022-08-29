import { DataPoint, PointDifference } from "../types";

export const dimensionDistance = (
  p1: DataPoint,
  p2: DataPoint
): Omit<PointDifference, "directSquared" | "direct"> => ({
  dx: p2.x - p1.x,
  dy: p2.y - p1.y,
});

export function distanceSquared(
  p1: DataPoint,
  p2: DataPoint
): Omit<PointDifference, "direct"> {
  const { dx, dy } = dimensionDistance(p1, p2);

  return {
    dx,
    dy,
    directSquared: dx * dx + dy * dy,
  };
}

export function distanceSqrt(
  p1: DataPoint,
  p2: DataPoint
): Omit<PointDifference, "directSquared"> {
  const { dx, dy } = dimensionDistance(p1, p2);

  return {
    dx,
    dy,
    direct: distance(dx, dy),
  };
}

export function distance(dx: number, dy: number): number {
  return Math.sqrt(dx * dx + dy * dy);
}
