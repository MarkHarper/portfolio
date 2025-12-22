import { Particle } from '../field/particle';

const GRID_MULTIPLIER = 100000;

export class SpatialHashGrid {
  private cellSize: number;
  private cells: Map<number, Particle[]>;

  constructor(cellSize: number) {
    this.cellSize = cellSize;
    this.cells = new Map();
  }

  clear(): void {
    this.cells.clear();
  }

  private getCellKey(x: number, y: number): number {
    const cellX = Math.floor(x / this.cellSize);
    const cellY = Math.floor(y / this.cellSize);
    return cellX + cellY * GRID_MULTIPLIER;
  }

  insert(particle: Particle): void {
    const key = this.getCellKey(particle.x, particle.y);
    let cell = this.cells.get(key);
    if (!cell) {
      cell = [];
      this.cells.set(key, cell);
    }
    cell.push(particle);
  }

  getNearbyParticles(particle: Particle): Particle[] {
    const cellX = Math.floor(particle.x / this.cellSize);
    const cellY = Math.floor(particle.y / this.cellSize);
    const nearby: Particle[] = [];

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const key = (cellX + dx) + (cellY + dy) * GRID_MULTIPLIER;
        const cell = this.cells.get(key);
        if (cell) {
          for (let i = 0; i < cell.length; i++) {
            nearby.push(cell[i]);
          }
        }
      }
    }

    return nearby;
  }
}
