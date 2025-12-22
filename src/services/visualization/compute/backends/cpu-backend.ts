import { IComputeBackend, PhysicsParams, GridParams, LineGeometryResult } from './interface';
import { Particle } from '../../field/particle';
import { SpatialHashGrid } from '../../canvas/spatial-hash-grid';
import { checkCollision, handleCollision } from '../../canvas/physics/collision';
import { distanceSquared } from '../../canvas/physics/distance';
import { spring } from '../../canvas/physics/spring';
import { clamp } from '../../canvas/physics/clamp';

export class CPUComputeBackend implements IComputeBackend {
  private particles: Particle[] = [];
  private spatialGrid: SpatialHashGrid;
  private particleIndexMap: Map<Particle, number> = new Map();
  private linePositionsArray: number[] = [];

  constructor() {
    this.spatialGrid = new SpatialHashGrid(100); // Default cell size
  }

  async initialize(): Promise<void> {
    // No initialization needed for CPU backend
  }

  createParticleBuffers(particles: Particle[], width?: number, height?: number, cellSize?: number): void {
    this.particles = particles;
    // CPU backend doesn't need width/height/cellSize for buffer creation
  }

  updateParticleData(particles: Particle[]): void {
    this.particles = particles;
  }

  async executeSpatialHashPass(params: GridParams): Promise<void> {
    // Update spatial grid cell size
    this.spatialGrid = new SpatialHashGrid(params.cellSize);

    // Clear and rebuild grid
    this.spatialGrid.clear();
    this.particleIndexMap.clear();

    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];
      this.spatialGrid.insert(particle);
      this.particleIndexMap.set(particle, i);
    }
  }

  async executePhysicsPass(params: PhysicsParams): Promise<void> {
    const { width, height, springStrength, edgeDistance, maxVelocity } = params;

    // Physics loop (same as current ThreeField implementation)
    for (let i = 0; i < this.particles.length; i++) {
      const p1 = this.particles[i];
      const nearby = this.spatialGrid.getNearbyParticles(p1);

      for (let j = 0; j < nearby.length; j++) {
        const p2 = nearby[j];
        const p2Index = this.particleIndexMap.get(p2)!;
        if (p2Index <= i) continue;

        const { dx, dy, directSquared } = distanceSquared(p1, p2);

        if (checkCollision(p1, p2, directSquared)) {
          const { p1: nextP1, p2: nextP2 } = handleCollision(p1, p2, dx, dy, maxVelocity);
          p1.setPosition(nextP1.x, nextP1.y);
          p1.setVelocity(nextP1.vx, nextP1.vy);
          p2.setPosition(nextP2.x, nextP2.y);
          p2.setVelocity(nextP2.vx, nextP2.vy);
        } else if (directSquared < edgeDistance) {
          const { p1: nextP1, p2: nextP2 } = spring(p1, p2, dx, dy, springStrength);
          p1.setVelocity(nextP1.vx, nextP1.vy);
          p2.setVelocity(nextP2.vx, nextP2.vy);
        }
      }
    }

    // Position update
    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];
      const possibleX = particle.x + particle.vx;
      const x = clamp(possibleX, 0, width);
      const possibleY = particle.y + particle.vy;
      const y = clamp(possibleY, 0, height);
      particle.setPosition(x, y);
    }

    // Build line geometry
    this.linePositionsArray = [];
    let lineIndex = 0;

    for (let i = 0; i < this.particles.length; i++) {
      const p1 = this.particles[i];
      const nearby = this.spatialGrid.getNearbyParticles(p1);

      for (let j = 0; j < nearby.length; j++) {
        const p2 = nearby[j];
        const p2Index = this.particleIndexMap.get(p2)!;
        if (p2Index <= i) continue;

        const { directSquared } = distanceSquared(p1, p2);
        if (directSquared < edgeDistance) {
          this.linePositionsArray[lineIndex++] = p1.x;
          this.linePositionsArray[lineIndex++] = p1.y;
          this.linePositionsArray[lineIndex++] = p2.x;
          this.linePositionsArray[lineIndex++] = p2.y;
        }
      }
    }
  }

  async readParticlePositions(): Promise<Float32Array> {
    const positions = new Float32Array(this.particles.length * 2);
    for (let i = 0; i < this.particles.length; i++) {
      positions[i * 2] = this.particles[i].x;
      positions[i * 2 + 1] = this.particles[i].y;
    }
    return positions;
  }

  async readParticleVelocities(): Promise<Float32Array> {
    const velocities = new Float32Array(this.particles.length * 2);
    for (let i = 0; i < this.particles.length; i++) {
      velocities[i * 2] = this.particles[i].vx;
      velocities[i * 2 + 1] = this.particles[i].vy;
    }
    return velocities;
  }

  async readLineGeometry(): Promise<LineGeometryResult> {
    const positions = new Float32Array(this.linePositionsArray);
    return {
      positions,
      count: this.linePositionsArray.length / 4, // 4 floats per line (2 endpoints × 2 coords)
    };
  }

  async readParticlePositionsInto(target: Float32Array): Promise<void> {
    for (let i = 0; i < this.particles.length; i++) {
      target[i * 3] = this.particles[i].x;
      target[i * 3 + 1] = this.particles[i].y;
      target[i * 3 + 2] = 1;
    }
  }

  async readLineGeometryInto(targetPositions: Float32Array, maxLines: number): Promise<number> {
    const lineCount = Math.min(this.linePositionsArray.length / 4, maxLines);

    for (let i = 0; i < lineCount; i++) {
      // First endpoint
      targetPositions[i * 6] = this.linePositionsArray[i * 4];
      targetPositions[i * 6 + 1] = this.linePositionsArray[i * 4 + 1];
      targetPositions[i * 6 + 2] = 0;
      // Second endpoint
      targetPositions[i * 6 + 3] = this.linePositionsArray[i * 4 + 2];
      targetPositions[i * 6 + 4] = this.linePositionsArray[i * 4 + 3];
      targetPositions[i * 6 + 5] = 0;
    }

    return lineCount;
  }

  getMaxParticles(): number {
    return 10000; // Conservative limit for CPU
  }

  supportsComputeShaders(): boolean {
    return false;
  }

  getBackendName(): string {
    return 'CPU';
  }

  dispose(): void {
    // No cleanup needed for CPU backend
  }
}
