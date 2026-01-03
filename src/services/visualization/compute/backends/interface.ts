import { Particle } from '../../field/particle';

export interface ComputeBuffer {
  size: number;
  usage: string;
}

export interface PhysicsParams {
  particleCount: number;
  springStrength: number;
  edgeDistance: number;
  edgeDistanceSquared: number;
  maxVelocity: number;
  width: number;
  height: number;
  cellSize: number;
  gridWidth: number;
  gridHeight: number;
}

export interface GridParams {
  particleCount: number;
  cellSize: number;
  gridWidth: number;
  gridHeight: number;
  width: number;
  height: number;
}

export interface LineGeometryResult {
  positions: Float32Array;
  count: number;
}

export interface ParticleData {
  positions: Float32Array;
  velocities: Float32Array;
  properties: Float32Array;  // mass, radius, tag, padding
  colors: Float32Array;        // r, g, b, a
}

export interface IComputeBackend {
  // Lifecycle
  initialize(): Promise<void>;
  dispose(): void;

  // Buffer management
  createParticleBuffers(particles: Particle[], width?: number, height?: number, cellSize?: number): void;
  updateParticleData(particles: Particle[]): void;

  // Compute dispatches
  executeSpatialHashPass(params: GridParams): void;
  executePhysicsPass(params: PhysicsParams): void;

  // Data readback
  readParticlePositions(): Promise<Float32Array>;
  readParticleVelocities(): Promise<Float32Array>;
  readLineGeometry(): Promise<LineGeometryResult>;

  // Direct buffer updates (for GPU-only rendering)
  readParticlePositionsInto(target: Float32Array): Promise<void>;
  readLineGeometryInto(targetPositions: Float32Array, maxLines: number): Promise<number>;

  // Capabilities
  getMaxParticles(): number;
  supportsComputeShaders(): boolean;
  getBackendName(): string;
}
