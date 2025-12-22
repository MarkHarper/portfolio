import { WebGPUComputeBuffer } from './buffers/compute-buffer';
import { ParticleBufferManager } from './buffers/particle-buffer-manager';
import { SpatialGridBufferManager } from './buffers/spatial-grid-buffer';
import * as renderShaders from './shaders/webgpu/render-shaders';

export class WebGPURenderer {
  private device: GPUDevice;
  private context: GPUCanvasContext;
  private canvas: HTMLCanvasElement;

  private particleRenderPipeline!: GPURenderPipeline;
  private lineRenderPipeline!: GPURenderPipeline;
  private sizeExtractionPipeline?: GPUComputePipeline;
  private lineCountToPipeline?: GPUComputePipeline;

  private viewProjectionBuffer!: GPUBuffer;
  private lineUniformsBuffer!: GPUBuffer;

  private particleSizeBuffer!: GPUBuffer;
  private lineIndirectBuffer!: GPUBuffer;

  private width: number;
  private height: number;

  private textureFormat: GPUTextureFormat = 'bgra8unorm';

  constructor(device: GPUDevice, canvas: HTMLCanvasElement, width: number, height: number) {
    this.device = device;
    this.canvas = canvas;
    this.width = width;
    this.height = height;

    console.log(`[WebGPURenderer] Constructor: width=${width}, height=${height}, canvas=${canvas.width}x${canvas.height}`);

    const context = canvas.getContext('webgpu');
    if (!context) {
      throw new Error('Failed to get WebGPU context');
    }
    this.context = context;

    this.configure();
    this.createPipelines();
    this.createUniformBuffers();
  }

  private configure(): void {
    this.context.configure({
      device: this.device,
      format: this.textureFormat,
      alphaMode: 'premultiplied',
    });
  }

  private createPipelines(): void {
    // Particle render pipeline
    const particleVertexModule = this.device.createShaderModule({
      code: renderShaders.particleVertexWGSL,
      label: 'particle-vertex',
    });

    const particleFragmentModule = this.device.createShaderModule({
      code: renderShaders.particleFragmentWGSL,
      label: 'particle-fragment',
    });

    this.particleRenderPipeline = this.device.createRenderPipeline({
      layout: 'auto',
      vertex: {
        module: particleVertexModule,
        entryPoint: 'main',
        buffers: [
          {
            // Position buffer (instanced)
            arrayStride: 8, // vec2<f32>
            stepMode: 'instance',
            attributes: [{
              shaderLocation: 0,
              offset: 0,
              format: 'float32x2',
            }],
          },
          {
            // Color buffer (instanced)
            arrayStride: 16, // vec4<f32>
            stepMode: 'instance',
            attributes: [{
              shaderLocation: 1,
              offset: 0,
              format: 'float32x4',
            }],
          },
          {
            // Size buffer (instanced)
            arrayStride: 4, // f32
            stepMode: 'instance',
            attributes: [{
              shaderLocation: 2,
              offset: 0,
              format: 'float32',
            }],
          },
        ],
      },
      fragment: {
        module: particleFragmentModule,
        entryPoint: 'main',
        targets: [{
          format: this.textureFormat,
          blend: {
            color: {
              srcFactor: 'src-alpha',
              dstFactor: 'one-minus-src-alpha',
              operation: 'add',
            },
            alpha: {
              srcFactor: 'one',
              dstFactor: 'one-minus-src-alpha',
              operation: 'add',
            },
          },
        }],
      },
      primitive: {
        topology: 'triangle-list',
      },
      label: 'particle-render-pipeline',
    });

    // Line render pipeline
    const lineVertexModule = this.device.createShaderModule({
      code: renderShaders.lineVertexWGSL,
      label: 'line-vertex',
    });

    const lineFragmentModule = this.device.createShaderModule({
      code: renderShaders.lineFragmentWGSL,
      label: 'line-fragment',
    });

    this.lineRenderPipeline = this.device.createRenderPipeline({
      layout: 'auto',
      vertex: {
        module: lineVertexModule,
        entryPoint: 'main',
      },
      fragment: {
        module: lineFragmentModule,
        entryPoint: 'main',
        targets: [{
          format: this.textureFormat,
          blend: {
            color: {
              srcFactor: 'src-alpha',
              dstFactor: 'one-minus-src-alpha',
              operation: 'add',
            },
            alpha: {
              srcFactor: 'one',
              dstFactor: 'one-minus-src-alpha',
              operation: 'add',
            },
          },
        }],
      },
      primitive: {
        topology: 'line-list',
      },
      label: 'line-render-pipeline',
    });
  }

  private createUniformBuffers(): void {
    // View-projection matrix buffer
    this.viewProjectionBuffer = this.device.createBuffer({
      size: 64, // mat4x4<f32>
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      label: 'view-projection',
    });

    // Line uniforms (matrix + color)
    this.lineUniformsBuffer = this.device.createBuffer({
      size: 80, // mat4x4<f32> (64 bytes) + vec4<f32> (16 bytes)
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      label: 'line-uniforms',
    });

    // Indirect draw buffer for lines (4 uint32s: vertexCount, instanceCount, firstVertex, firstInstance)
    this.lineIndirectBuffer = this.device.createBuffer({
      size: 16,
      usage: GPUBufferUsage.INDIRECT | GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
      label: 'line-indirect-args',
    });

    this.updateProjectionMatrix();
  }

  private updateProjectionMatrix(): void {
    // Orthographic projection: map (0, 0) to (width, height) to NDC (-1, -1) to (1, 1)
    const matrix = new Float32Array(16);

    console.log(`[WebGPURenderer] Updating projection: ${this.width}x${this.height}`);

    // Column-major order for WGSL
    matrix[0] = 2.0 / this.width;  // Scale X
    matrix[5] = -2.0 / this.height; // Scale Y (flip Y axis)
    matrix[10] = 1.0;               // Scale Z
    matrix[12] = -1.0;              // Translate X
    matrix[13] = 1.0;               // Translate Y
    matrix[15] = 1.0;               // W

    this.device.queue.writeBuffer(this.viewProjectionBuffer, 0, matrix);

    // Also update line uniforms with matrix
    const lineUniforms = new Float32Array(20); // 16 for matrix + 4 for color
    lineUniforms.set(matrix, 0);
    // Color will be set during render
    this.device.queue.writeBuffer(this.lineUniformsBuffer, 0, lineUniforms);
  }

  setSize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.canvas.width = width;
    this.canvas.height = height;
    console.log(`[WebGPURenderer] setSize: ${width}x${height}`);
    this.updateProjectionMatrix();
  }

  private prepareLineIndirectArgs(commandEncoder: GPUCommandEncoder, gridBuffers: SpatialGridBufferManager): void {
    // Create compute pipeline if not exists
    if (!this.lineCountToPipeline) {
      const shaderModule = this.device.createShaderModule({
        code: `
          struct LineCountBuffer {
            count: atomic<u32>,
          }

          @group(0) @binding(0) var<storage, read_write> lineCountBuf: LineCountBuffer;
          @group(0) @binding(1) var<storage, read_write> indirectArgs: array<u32, 4>;

          @compute @workgroup_size(1)
          fn main() {
            let count = atomicLoad(&lineCountBuf.count);
            indirectArgs[0] = count;  // vertexCount (already includes both endpoints)
            indirectArgs[1] = 1u;     // instanceCount
            indirectArgs[2] = 0u;     // firstVertex
            indirectArgs[3] = 0u;     // firstInstance
          }
        `,
        label: 'line-count-to-indirect',
      });

      this.lineCountToPipeline = this.device.createComputePipeline({
        layout: 'auto',
        compute: {
          module: shaderModule,
          entryPoint: 'main',
        },
        label: 'line-count-to-indirect-pipeline',
      });
    }

    const bindGroup = this.device.createBindGroup({
      layout: this.lineCountToPipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: (gridBuffers.lineCountBuffer as any).buffer } },
        { binding: 1, resource: { buffer: this.lineIndirectBuffer } },
      ],
    });

    const computePass = commandEncoder.beginComputePass();
    computePass.setPipeline(this.lineCountToPipeline);
    computePass.setBindGroup(0, bindGroup);
    computePass.dispatchWorkgroups(1);
    computePass.end();
  }

  private updateSizeBuffer(particleBuffers: ParticleBufferManager, particleCount: number): void {
    // Create or resize size buffer if needed
    if (!this.particleSizeBuffer || this.particleSizeBuffer.size < particleCount * 4) {
      this.particleSizeBuffer?.destroy();
      this.particleSizeBuffer = this.device.createBuffer({
        size: Math.max(particleCount * 4, 1024),
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        label: 'particle-sizes',
      });
    }

    // Extract sizes (radius) from property buffer using a compute shader would be ideal,
    // but for now we'll use a simple copy approach via a temporary staging buffer
    const commandEncoder = this.device.createCommandEncoder();

    // The property buffer stores: [mass, radius, tag, padding] per particle (vec4<f32>)
    // We need to extract just the radius (second component) for each particle

    // Use a compute shader to extract radius values
    if (!this.sizeExtractionPipeline) {
      const shaderModule = this.device.createShaderModule({
        code: `
          @group(0) @binding(0) var<storage, read> properties: array<vec4<f32>>;
          @group(0) @binding(1) var<storage, read_write> sizes: array<f32>;

          @compute @workgroup_size(256)
          fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
            let idx = global_id.x;
            if (idx < arrayLength(&properties)) {
              // Extract radius from properties (second component)
              sizes[idx] = properties[idx].y;
            }
          }
        `,
        label: 'size-extraction',
      });

      this.sizeExtractionPipeline = this.device.createComputePipeline({
        layout: 'auto',
        compute: {
          module: shaderModule,
          entryPoint: 'main',
        },
        label: 'size-extraction-pipeline',
      });
    }

    const bindGroup = this.device.createBindGroup({
      layout: this.sizeExtractionPipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: (particleBuffers.propertyBuffer as WebGPUComputeBuffer).buffer } },
        { binding: 1, resource: { buffer: this.particleSizeBuffer } },
      ],
    });

    const computePass = commandEncoder.beginComputePass();
    computePass.setPipeline(this.sizeExtractionPipeline);
    computePass.setBindGroup(0, bindGroup);
    computePass.dispatchWorkgroups(Math.ceil(particleCount / 256));
    computePass.end();

    this.device.queue.submit([commandEncoder.finish()]);
  }

  render(
    particleBuffers: ParticleBufferManager,
    gridBuffers: SpatialGridBufferManager,
    particleCount: number,
    lineColor: { r: number; g: number; b: number }
  ): void {
    // Update size buffer from property buffer
    this.updateSizeBuffer(particleBuffers, particleCount);

    const commandEncoder = this.device.createCommandEncoder();

    // Convert lineCount buffer to indirect draw args
    this.prepareLineIndirectArgs(commandEncoder, gridBuffers);

    const textureView = this.context.getCurrentTexture().createView();

    const renderPass = commandEncoder.beginRenderPass({
      colorAttachments: [{
        view: textureView,
        clearValue: { r: 0, g: 0, b: 0, a: 0 },
        loadOp: 'clear',
        storeOp: 'store',
      }],
    });

    // Set viewport to match canvas dimensions
    renderPass.setViewport(0, 0, this.width, this.height, 0, 1);
    renderPass.setScissorRect(0, 0, this.width, this.height);

    // Render lines first (behind particles) - using indirect draw
    renderPass.setPipeline(this.lineRenderPipeline);

    // Update line color in uniforms
    const colorArray = new Float32Array([
      lineColor.r / 255,
      lineColor.g / 255,
      lineColor.b / 255,
      0.3, // alpha
    ]);
    this.device.queue.writeBuffer(this.lineUniformsBuffer, 64, colorArray);

    const lineBindGroup = this.device.createBindGroup({
      layout: this.lineRenderPipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: this.lineUniformsBuffer } },
        { binding: 1, resource: { buffer: (gridBuffers.linePositionsBuffer as WebGPUComputeBuffer).buffer } },
      ],
    });

    renderPass.setBindGroup(0, lineBindGroup);
    // Use indirect draw - reads vertex count from GPU buffer
    renderPass.drawIndirect(this.lineIndirectBuffer, 0);

    // Render particles
    renderPass.setPipeline(this.particleRenderPipeline);

    const particleBindGroup = this.device.createBindGroup({
      layout: this.particleRenderPipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: this.viewProjectionBuffer } },
      ],
    });

    renderPass.setBindGroup(0, particleBindGroup);

    // Set vertex buffers (positions, colors, sizes) - all instanced
    renderPass.setVertexBuffer(0, (particleBuffers.getCurrentPositionBuffer() as WebGPUComputeBuffer).buffer);
    renderPass.setVertexBuffer(1, (particleBuffers.colorBuffer as WebGPUComputeBuffer).buffer);
    renderPass.setVertexBuffer(2, this.particleSizeBuffer);

    // Draw 6 vertices (quad) per particle instance
    renderPass.draw(6, particleCount, 0, 0);

    renderPass.end();

    this.device.queue.submit([commandEncoder.finish()]);
  }

  destroy(): void {
    this.viewProjectionBuffer?.destroy();
    this.lineUniformsBuffer?.destroy();
    this.particleSizeBuffer?.destroy();
  }
}
