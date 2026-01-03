import { IComputeBackend, PhysicsParams, GridParams, LineGeometryResult } from './interface';
import { Particle } from '../../field/particle';
import { SpatialHashGrid } from '../../canvas/spatial-hash-grid';
import { checkCollision, handleCollision } from '../../canvas/physics/collision';
import { distanceSquared } from '../../canvas/physics/distance';
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

  executeSpatialHashPass(params: GridParams): void {
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

  executePhysicsPass(params: PhysicsParams): void {
    const { width, height, springStrength, edgeDistance, edgeDistanceSquared, maxVelocity } = params;

    // Create buffers to accumulate changes (double-buffer like GPU)
    const velocityUpdates = new Map<number, { vx: number; vy: number } | null>();
    const positionDeltas = new Map<number, { dx: number; dy: number }>();

    for (let i = 0; i < this.particles.length; i++) {
      velocityUpdates.set(i, null);
      positionDeltas.set(i, { dx: 0, dy: 0 });
    }

    // Physics loop
    for (let i = 0; i < this.particles.length; i++) {
      const p1 = this.particles[i];
      const nearby = this.spatialGrid.getNearbyParticles(p1);

      for (let j = 0; j < nearby.length; j++) {
        const p2 = nearby[j];
        const p2Index = this.particleIndexMap.get(p2)!;
        if (p2Index <= i) continue;  // Skip already-processed pairs and self-interaction

        const { dx, dy, directSquared } = distanceSquared(p1, p2);

        if (checkCollision(p1, p2, directSquared)) {
          const { p1: nextP1, p2: nextP2 } = handleCollision(p1, p2, dx, dy, maxVelocity);
          // Store new velocities (will be applied after all interactions)
          velocityUpdates.set(i, { vx: nextP1.vx, vy: nextP1.vy });
          velocityUpdates.set(p2Index, { vx: nextP2.vx, vy: nextP2.vy });

          // Accumulate separation displacement
          const dist = Math.sqrt(directSquared);
          if (dist > 0.0001) {
            const nx = dx / dist;
            const ny = dy / dist;
            const combinedRadius = p1.radius + p2.radius;
            const overlap = combinedRadius - dist;
            const separation = overlap * 0.5;

            const posDelta1 = positionDeltas.get(i)!;
            const posDelta2 = positionDeltas.get(p2Index)!;
            posDelta1.dx -= nx * separation;
            posDelta1.dy -= ny * separation;
            posDelta2.dx += nx * separation;
            posDelta2.dy += ny * separation;
          }
        } else if (directSquared < edgeDistanceSquared) {
          // Apply repulsive force (pushes particles apart) - matches GPU shader
          const dist = Math.sqrt(directSquared);
          const force = springStrength * (edgeDistance - dist) / edgeDistance;
          const nx = dx / dist;
          const ny = dy / dist;

          // Get current velocity (or already-computed collision velocity)
          const vel1 = velocityUpdates.get(i) || { vx: p1.vx, vy: p1.vy };
          const vel2 = velocityUpdates.get(p2Index) || { vx: p2.vx, vy: p2.vy };

          // Push away from neighbor (negative force)
          velocityUpdates.set(i, { vx: vel1.vx - nx * force, vy: vel1.vy - ny * force });
          velocityUpdates.set(p2Index, { vx: vel2.vx + nx * force, vy: vel2.vy + ny * force });
        }
      }
    }

    // Apply all accumulated changes
    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];

      // Apply velocity changes
      const velUpdate = velocityUpdates.get(i);
      if (velUpdate) {
        particle.setVelocity(velUpdate.vx, velUpdate.vy);
      }

      // Apply position separation
      const posDelta = positionDeltas.get(i)!;
      if (posDelta.dx !== 0 || posDelta.dy !== 0) {
        particle.setPosition(particle.x + posDelta.dx, particle.y + posDelta.dy);
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
