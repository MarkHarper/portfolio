import { Particle } from '../../field/particle';
import { hexToRGB } from '../../canvas/color';
import { ComputeBuffer } from './compute-buffer';

export class ParticleBufferManager {
  private currentBufferIndex: number = 0;
  private maxParticles: number;

  // Double buffering for ping-pong (read from current, write to next)
  public positionBuffers: [ComputeBuffer, ComputeBuffer];
  public velocityBuffers: [ComputeBuffer, ComputeBuffer];
  public propertyBuffer: ComputeBuffer;  // Static data (mass, radius, tag)
  public colorBuffer: ComputeBuffer;     // Static data (colors)

  constructor(
    maxParticles: number,
    createBuffer: (size: number, label: string) => ComputeBuffer
  ) {
    this.maxParticles = maxParticles;

    // Create double buffers for dynamic data (positions, velocities)
    this.positionBuffers = [
      createBuffer(maxParticles * 2 * 4, 'positions_0'),
      createBuffer(maxParticles * 2 * 4, 'positions_1'),
    ];
    this.velocityBuffers = [
      createBuffer(maxParticles * 2 * 4, 'velocities_0'),
      createBuffer(maxParticles * 2 * 4, 'velocities_1'),
    ];

    // Create single buffers for static data
    this.propertyBuffer = createBuffer(maxParticles * 4 * 4, 'properties');
    this.colorBuffer = createBuffer(maxParticles * 4 * 4, 'colors');
  }

  getCurrentPositionBuffer(): ComputeBuffer {
    return this.positionBuffers[this.currentBufferIndex];
  }

  getNextPositionBuffer(): ComputeBuffer {
    return this.positionBuffers[1 - this.currentBufferIndex];
  }

  getCurrentVelocityBuffer(): ComputeBuffer {
    return this.velocityBuffers[this.currentBufferIndex];
  }

  getNextVelocityBuffer(): ComputeBuffer {
    return this.velocityBuffers[1 - this.currentBufferIndex];
  }

  swap(): void {
    this.currentBufferIndex = 1 - this.currentBufferIndex;
  }

  uploadParticles(particles: Particle[]): void {
    const count = Math.min(particles.length, this.maxParticles);

    // Prepare data arrays
    const positions = new Float32Array(count * 2);
    const velocities = new Float32Array(count * 2);
    const properties = new Float32Array(count * 4);
    const colors = new Float32Array(count * 4);

    for (let i = 0; i < count; i++) {
      const particle = particles[i];

      // Positions
      positions[i * 2] = particle.x;
      positions[i * 2 + 1] = particle.y;

      // Velocities
      velocities[i * 2] = particle.vx;
      velocities[i * 2 + 1] = particle.vy;

      // Properties (mass, radius, tag, padding)
      properties[i * 4] = particle.mass;
      properties[i * 4 + 1] = particle.radius;
      properties[i * 4 + 2] = particle.tag;
      properties[i * 4 + 3] = 0; // padding

      // Colors (normalized to 0-1)
      const rgb = hexToRGB(particle.fillStyle);
      colors[i * 4] = rgb.r / 255;
      colors[i * 4 + 1] = rgb.g / 255;
      colors[i * 4 + 2] = rgb.b / 255;
      colors[i * 4 + 3] = 1.0;
    }

    // Upload to current buffers
    this.getCurrentPositionBuffer().write(positions);
    this.getCurrentVelocityBuffer().write(velocities);
    this.propertyBuffer.write(properties);
    this.colorBuffer.write(colors);
  }

  async downloadPositions(count: number): Promise<Float32Array> {
    const buffer = await this.getCurrentPositionBuffer().read();
    return new Float32Array(buffer, 0, count * 2);
  }

  async downloadVelocities(count: number): Promise<Float32Array> {
    const buffer = await this.getCurrentVelocityBuffer().read();
    return new Float32Array(buffer, 0, count * 2);
  }

  destroy(): void {
    this.positionBuffers[0].destroy();
    this.positionBuffers[1].destroy();
    this.velocityBuffers[0].destroy();
    this.velocityBuffers[1].destroy();
    this.propertyBuffer.destroy();
    this.colorBuffer.destroy();
  }
}
