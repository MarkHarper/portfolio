import { DataCircleObject } from "../types";

export const impulse = (
  p1: DataCircleObject,
  p2: DataCircleObject,
  speed: number
): number => (2 * speed) / (p1.mass + p2.mass);
