export function setDimensions(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
): void {
  const dpr = window.devicePixelRatio;

  canvas.width = width * dpr;
  canvas.height = height * dpr;

  ctx.scale(dpr, dpr);

  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
}
