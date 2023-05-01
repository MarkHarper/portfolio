export type RGB = {
  r: number;
  g: number;
  b: number;
};

export function rgba(r: number, g: number, b: number, a: number): string {
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

// converts a value from 0 to 1 to an rgb (0 - 255) scale
export function alphaRGB(alphaProportion: number): number {
  return (255 - 255 * alphaProportion) / 255;
}

export function hexToRGB(hex: string): RGB {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  return { r, g, b };
}
