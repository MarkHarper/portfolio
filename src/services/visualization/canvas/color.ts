export function rgba(r: number, g: number, b: number, a: number): string {
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

// converts a value from 0 to 1 to an rgb (0 - 255) scale
export function alphaRGB(alphaProportion: number): number {
  return (255 - 255 * alphaProportion) / 255;
}
