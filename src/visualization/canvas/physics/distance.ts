import { DataPoint, PointDifference } from "../types";

export function distance(
  p1: DataPoint,
  p2: DataPoint
): PointDifference {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;

  return {
    dx,
    dy,
    direct: Math.sqrt(dx * dx + dy * dy),
  };
}
