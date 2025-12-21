import { DataCircle } from '../types';

const DOUBLE_PI = 2 * Math.PI;

export function renderCircle(
  circle: DataCircle,
  fillStyle: string,
  ctx: CanvasRenderingContext2D,
): void {
  ctx.beginPath();
  ctx.arc(circle.x, circle.y, circle.radius, 0, DOUBLE_PI);

  if (fillStyle) {
    ctx.fillStyle = fillStyle;
    ctx.fill();
  }
}
