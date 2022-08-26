import { Point } from "../../canvas/types";

export function renderLine(
  p1: Point,
  p2: Point,
  strokeStyle: string,
  ctx: CanvasRenderingContext2D,
): void {
  ctx.beginPath();
  ctx.strokeStyle = strokeStyle;
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.closePath();
  ctx.stroke();
}
