import { DataCircle } from '../types';

export function renderCircle(
  circle: DataCircle,
  fillStyle: string,
  ctx: CanvasRenderingContext2D,
): void {
  ctx.beginPath();
  ctx.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.stroke();

  if (fillStyle) {
    ctx.fillStyle = fillStyle;
    ctx.fill();
  }
}
