import { ComputeBuffer } from './compute-buffer';

export class SpatialGridBufferManager {
  private maxCells: number;

  public cellCountsBuffer: ComputeBuffer;
  public cellOffsetsBuffer: ComputeBuffer;
  public particleIndicesBuffer: ComputeBuffer;
  public linePositionsBuffer: ComputeBuffer;
  public lineCountBuffer: ComputeBuffer;

  constructor(
    maxParticles: number,
    gridWidth: number,
    gridHeight: number,
    createBuffer: (size: number, label: string) => ComputeBuffer
  ) {
    this.maxCells = gridWidth * gridHeight;

    // Cell counts (atomic counters during grid construction)
    this.cellCountsBuffer = createBuffer(
      this.maxCells * 4,  // uint32 per cell
      'cell_counts'
    );

    // Cell offsets (prefix sum results)
    this.cellOffsetsBuffer = createBuffer(
      (this.maxCells + 1) * 4,  // +1 for sentinel value
      'cell_offsets'
    );

    // Particle indices (sorted by cell)
    this.particleIndicesBuffer = createBuffer(
      maxParticles * 4,  // uint32 per particle
      'particle_indices'
    );

    // Line geometry output
    // Each connection requires 2 vec2 = 4 floats
    // Conservative estimate: each particle could connect to edgeDistance neighbors
    const maxLines = maxParticles * 10;  // Conservative estimate
    this.linePositionsBuffer = createBuffer(
      maxLines * 4 * 4,  // vec2 per endpoint × 2 endpoints × 4 bytes
      'line_positions'
    );

    // Line count (atomic counter)
    this.lineCountBuffer = createBuffer(
      4,  // Single uint32
      'line_count'
    );
  }

  async clearCellCounts(): Promise<void> {
    const zeros = new Uint32Array(this.maxCells).fill(0);
    this.cellCountsBuffer.write(zeros);
  }

  async clearLineCount(): Promise<void> {
    const zero = new Uint32Array([0]);
    this.lineCountBuffer.write(zero);
  }

  async readLineCount(): Promise<number> {
    const buffer = await this.lineCountBuffer.read();
    return new Uint32Array(buffer)[0];
  }

  async readLinePositions(count: number): Promise<Float32Array> {
    const buffer = await this.linePositionsBuffer.read();
    // Each line is 2 endpoints × 2 coords = 4 floats
    return new Float32Array(buffer, 0, count * 4);
  }

  destroy(): void {
    this.cellCountsBuffer.destroy();
    this.cellOffsetsBuffer.destroy();
    this.particleIndicesBuffer.destroy();
    this.linePositionsBuffer.destroy();
    this.lineCountBuffer.destroy();
  }
}
