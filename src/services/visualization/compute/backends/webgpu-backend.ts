import { IComputeBackend, PhysicsParams, GridParams, LineGeometryResult } from './interface';
import { Particle } from '../../field/particle';
import { WebGPUComputeBuffer } from '../buffers/compute-buffer';
import { ParticleBufferManager } from '../buffers/particle-buffer-manager';
import { SpatialGridBufferManager } from '../buffers/spatial-grid-buffer';
import * as shaders from '../shaders/webgpu/shaders';

export class WebGPUComputeBackend implements IComputeBackend {
  private device!: GPUDevice;
  private adapter!: GPUAdapter;

  private spatialHashCountPipeline!: GPUComputePipeline;
  private prefixSumPipeline!: GPUComputePipeline;
  private spatialHashIndexPipeline!: GPUComputePipeline;
  private physicsFusedPipeline!: GPUComputePipeline;

  private particleBufferManager!: ParticleBufferManager;
  private gridBufferManager!: SpatialGridBufferManager;

  private gridParamsBuffer!: GPUBuffer;
  private physicsParamsBuffer!: GPUBuffer;
  private prefixSumParamsBuffer!: GPUBuffer;

  private currentParticleCount: number = 0;

  async initialize(): Promise<void> {
    if (!navigator.gpu) {
      throw new Error('WebGPU not supported');
    }

    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      throw new Error('Failed to get WebGPU adapter');
    }
    this.adapter = adapter;

    this.device = await this.adapter.requestDevice();

    // Create compute pipelines
    await this.createPipelines();
  }

  private async createPipelines(): Promise<void> {
    // Spatial hash count pipeline
    const spatialHashCountModule = this.device.createShaderModule({
      code: shaders.spatialHashCountWGSL,
      label: 'spatial-hash-count',
    });

    this.spatialHashCountPipeline = this.device.createComputePipeline({
      layout: 'auto',
      compute: {
        module: spatialHashCountModule,
        entryPoint: 'main',
      },
      label: 'spatial-hash-count-pipeline',
    });

    // Prefix sum pipeline
    const prefixSumModule = this.device.createShaderModule({
      code: shaders.prefixSumWGSL,
      label: 'prefix-sum',
    });

    this.prefixSumPipeline = this.device.createComputePipeline({
      layout: 'auto',
      compute: {
        module: prefixSumModule,
        entryPoint: 'main',
      },
      label: 'prefix-sum-pipeline',
    });

    // Spatial hash index pipeline
    const spatialHashIndexModule = this.device.createShaderModule({
      code: shaders.spatialHashIndexWGSL,
      label: 'spatial-hash-index',
    });

    this.spatialHashIndexPipeline = this.device.createComputePipeline({
      layout: 'auto',
      compute: {
        module: spatialHashIndexModule,
        entryPoint: 'main',
      },
      label: 'spatial-hash-index-pipeline',
    });

    // Physics fused pipeline
    const physicsFusedModule = this.device.createShaderModule({
      code: shaders.physicsFusedWGSL,
      label: 'physics-fused',
    });

    this.physicsFusedPipeline = this.device.createComputePipeline({
      layout: 'auto',
      compute: {
        module: physicsFusedModule,
        entryPoint: 'main',
      },
      label: 'physics-fused-pipeline',
    });
  }

  createParticleBuffers(particles: Particle[], width: number = 1920, height: number = 1080, cellSize: number = 100): void {
    const maxParticles = Math.max(particles.length, 10000);

    // Calculate grid dimensions based on actual canvas size and cellSize
    const gridWidth = Math.ceil(width / cellSize);
    const gridHeight = Math.ceil(height / cellSize);

    this.currentParticleCount = particles.length;

    // Destroy old buffers if they exist
    if (this.particleBufferManager) {
      this.particleBufferManager.destroy();
    }
    if (this.gridBufferManager) {
      this.gridBufferManager.destroy();
    }

    // Create particle buffers (need VERTEX for rendering)
    this.particleBufferManager = new ParticleBufferManager(
      maxParticles,
      (size: number, label: string) => new WebGPUComputeBuffer(
        this.device,
        size,
        GPUBufferUsage.STORAGE | GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
        label
      )
    );

    // Create grid buffers (need VERTEX for line rendering)
    this.gridBufferManager = new SpatialGridBufferManager(
      maxParticles,
      gridWidth,
      gridHeight,
      (size: number, label: string) => new WebGPUComputeBuffer(
        this.device,
        size,
        GPUBufferUsage.STORAGE | GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
        label
      )
    );

    // Create parameter buffers
    this.gridParamsBuffer = this.device.createBuffer({
      size: 32, // Params struct size (aligned)
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      label: 'grid-params',
    });

    this.physicsParamsBuffer = this.device.createBuffer({
      size: 64, // Params struct size (aligned)
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      label: 'physics-params',
    });

    this.prefixSumParamsBuffer = this.device.createBuffer({
      size: 16,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      label: 'prefix-sum-params',
    });

    // Upload initial particle data
    this.particleBufferManager.uploadParticles(particles);
  }

  updateParticleData(particles: Particle[]): void {
    this.currentParticleCount = particles.length;
    this.particleBufferManager.uploadParticles(particles);
  }

  async executeSpatialHashPass(params: GridParams): Promise<void> {
    // Clear cell counts
    await this.gridBufferManager.clearCellCounts();

    // Update grid params - use ArrayBuffer with proper types (u32 vs f32)
    const gridParamsBuffer = new ArrayBuffer(24); // 6 × 4 bytes
    const gridParamsView = new DataView(gridParamsBuffer);
    gridParamsView.setUint32(0, params.particleCount, true);  // u32
    gridParamsView.setFloat32(4, params.cellSize, true);      // f32
    gridParamsView.setUint32(8, params.gridWidth, true);      // u32
    gridParamsView.setUint32(12, params.gridHeight, true);    // u32
    gridParamsView.setFloat32(16, params.width, true);        // f32
    gridParamsView.setFloat32(20, params.height, true);       // f32
    this.device.queue.writeBuffer(this.gridParamsBuffer, 0, gridParamsBuffer);

    const commandEncoder = this.device.createCommandEncoder();

    // Pass 1: Count particles per cell
    {
      const passEncoder = commandEncoder.beginComputePass();
      passEncoder.setPipeline(this.spatialHashCountPipeline);

      const bindGroup = this.device.createBindGroup({
        layout: this.spatialHashCountPipeline.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: (this.particleBufferManager.getCurrentPositionBuffer() as WebGPUComputeBuffer).buffer } },
          { binding: 1, resource: { buffer: (this.gridBufferManager.cellCountsBuffer as WebGPUComputeBuffer).buffer } },
          { binding: 2, resource: { buffer: this.gridParamsBuffer } },
        ],
      });

      passEncoder.setBindGroup(0, bindGroup);
      const workgroups = Math.ceil(params.particleCount / 256);
      passEncoder.dispatchWorkgroups(workgroups, 1, 1);
      passEncoder.end();
    }

    // Pass 2: Prefix sum
    {
      const cellCount = params.gridWidth * params.gridHeight;
      const prefixSumParamsData = new Uint32Array([cellCount]);
      this.device.queue.writeBuffer(this.prefixSumParamsBuffer, 0, prefixSumParamsData);

      const passEncoder = commandEncoder.beginComputePass();
      passEncoder.setPipeline(this.prefixSumPipeline);

      const bindGroup = this.device.createBindGroup({
        layout: this.prefixSumPipeline.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: (this.gridBufferManager.cellCountsBuffer as WebGPUComputeBuffer).buffer } },
          { binding: 1, resource: { buffer: (this.gridBufferManager.cellOffsetsBuffer as WebGPUComputeBuffer).buffer } },
          { binding: 2, resource: { buffer: this.prefixSumParamsBuffer } },
        ],
      });

      passEncoder.setBindGroup(0, bindGroup);
      passEncoder.dispatchWorkgroups(1, 1, 1);
      passEncoder.end();
    }

    // Clear cell counts again (will be reused as write cursors)
    const clearEncoder = commandEncoder.beginComputePass();
    clearEncoder.end();
    this.device.queue.submit([commandEncoder.finish()]);
    await this.gridBufferManager.clearCellCounts();

    // Pass 3: Index particles into cells
    const indexEncoder = this.device.createCommandEncoder();
    {
      const passEncoder = indexEncoder.beginComputePass();
      passEncoder.setPipeline(this.spatialHashIndexPipeline);

      const bindGroup = this.device.createBindGroup({
        layout: this.spatialHashIndexPipeline.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: (this.particleBufferManager.getCurrentPositionBuffer() as WebGPUComputeBuffer).buffer } },
          { binding: 1, resource: { buffer: (this.gridBufferManager.cellOffsetsBuffer as WebGPUComputeBuffer).buffer } },
          { binding: 2, resource: { buffer: (this.gridBufferManager.cellCountsBuffer as WebGPUComputeBuffer).buffer } },
          { binding: 3, resource: { buffer: (this.gridBufferManager.particleIndicesBuffer as WebGPUComputeBuffer).buffer } },
          { binding: 4, resource: { buffer: this.gridParamsBuffer } },
        ],
      });

      passEncoder.setBindGroup(0, bindGroup);
      const workgroups = Math.ceil(params.particleCount / 256);
      passEncoder.dispatchWorkgroups(workgroups, 1, 1);
      passEncoder.end();
    }

    this.device.queue.submit([indexEncoder.finish()]);
    await this.device.queue.onSubmittedWorkDone();
  }

  async executePhysicsPass(params: PhysicsParams): Promise<void> {
    // Clear line count
    await this.gridBufferManager.clearLineCount();

    // Update physics params - use ArrayBuffer with proper types (u32 vs f32)
    const physicsParamsBuffer = new ArrayBuffer(40); // 10 × 4 bytes
    const physicsParamsView = new DataView(physicsParamsBuffer);
    physicsParamsView.setUint32(0, params.particleCount, true);          // u32
    physicsParamsView.setFloat32(4, params.springStrength, true);        // f32
    physicsParamsView.setFloat32(8, params.edgeDistance, true);          // f32
    physicsParamsView.setFloat32(12, params.edgeDistanceSquared, true);  // f32
    physicsParamsView.setFloat32(16, params.maxVelocity, true);          // f32
    physicsParamsView.setFloat32(20, params.width, true);                // f32
    physicsParamsView.setFloat32(24, params.height, true);               // f32
    physicsParamsView.setFloat32(28, params.cellSize, true);             // f32
    physicsParamsView.setUint32(32, params.gridWidth, true);             // u32
    physicsParamsView.setUint32(36, params.gridHeight, true);            // u32
    this.device.queue.writeBuffer(this.physicsParamsBuffer, 0, physicsParamsBuffer);

    const commandEncoder = this.device.createCommandEncoder();
    const passEncoder = commandEncoder.beginComputePass();

    passEncoder.setPipeline(this.physicsFusedPipeline);

    const bindGroup = this.device.createBindGroup({
      layout: this.physicsFusedPipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: (this.particleBufferManager.getCurrentPositionBuffer() as WebGPUComputeBuffer).buffer } },
        { binding: 1, resource: { buffer: (this.particleBufferManager.getCurrentVelocityBuffer() as WebGPUComputeBuffer).buffer } },
        { binding: 2, resource: { buffer: (this.particleBufferManager.propertyBuffer as WebGPUComputeBuffer).buffer } },
        { binding: 3, resource: { buffer: (this.gridBufferManager.cellOffsetsBuffer as WebGPUComputeBuffer).buffer } },
        { binding: 4, resource: { buffer: (this.gridBufferManager.particleIndicesBuffer as WebGPUComputeBuffer).buffer } },
        { binding: 5, resource: { buffer: (this.gridBufferManager.linePositionsBuffer as WebGPUComputeBuffer).buffer } },
        { binding: 6, resource: { buffer: (this.gridBufferManager.lineCountBuffer as WebGPUComputeBuffer).buffer } },
        { binding: 7, resource: { buffer: this.physicsParamsBuffer } },
      ],
    });

    passEncoder.setBindGroup(0, bindGroup);
    const workgroups = Math.ceil(params.particleCount / 256);
    passEncoder.dispatchWorkgroups(workgroups, 1, 1);
    passEncoder.end();

    this.device.queue.submit([commandEncoder.finish()]);
    await this.device.queue.onSubmittedWorkDone();

    // No buffer swapping needed - we're doing in-place updates now
  }

  async readParticlePositions(): Promise<Float32Array> {
    return await this.particleBufferManager.downloadPositions(this.currentParticleCount);
  }

  async readParticleVelocities(): Promise<Float32Array> {
    return await this.particleBufferManager.downloadVelocities(this.currentParticleCount);
  }

  async readLineGeometry(): Promise<LineGeometryResult> {
    const lineCount = await this.gridBufferManager.readLineCount();
    const positions = await this.gridBufferManager.readLinePositions(lineCount);

    return {
      positions,
      count: lineCount,
    };
  }

  async readParticlePositionsInto(target: Float32Array): Promise<void> {
    const positions = await this.particleBufferManager.downloadPositions(this.currentParticleCount);
    // Copy into target array (for Three.js BufferAttribute)
    for (let i = 0; i < this.currentParticleCount; i++) {
      target[i * 3] = positions[i * 2];       // x
      target[i * 3 + 1] = positions[i * 2 + 1]; // y
      target[i * 3 + 2] = 1;                   // z (constant)
    }
  }

  async readLineGeometryInto(targetPositions: Float32Array, maxLines: number): Promise<number> {
    const lineCount = await this.gridBufferManager.readLineCount();
    const actualLines = Math.min(lineCount, maxLines);

    if (actualLines > 0) {
      const positions = await this.gridBufferManager.readLinePositions(actualLines);

      // Convert from vec2 pairs to vec3 pairs for Three.js
      for (let i = 0; i < actualLines; i++) {
        // First endpoint
        targetPositions[i * 6] = positions[i * 4];
        targetPositions[i * 6 + 1] = positions[i * 4 + 1];
        targetPositions[i * 6 + 2] = 0;
        // Second endpoint
        targetPositions[i * 6 + 3] = positions[i * 4 + 2];
        targetPositions[i * 6 + 4] = positions[i * 4 + 3];
        targetPositions[i * 6 + 5] = 0;
      }
    }

    return actualLines;
  }

  getMaxParticles(): number {
    return 50000;
  }

  supportsComputeShaders(): boolean {
    return true;
  }

  getBackendName(): string {
    return 'WebGPU';
  }

  dispose(): void {
    this.particleBufferManager?.destroy();
    this.gridBufferManager?.destroy();
    this.gridParamsBuffer?.destroy();
    this.physicsParamsBuffer?.destroy();
    this.prefixSumParamsBuffer?.destroy();
    this.device?.destroy();
  }
}
