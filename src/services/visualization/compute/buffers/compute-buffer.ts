export abstract class ComputeBuffer {
  protected buffer: GPUBuffer | WebGLBuffer | null = null;
  public readonly size: number;
  public readonly usage: string;

  constructor(size: number, usage: string) {
    this.size = size;
    this.usage = usage;
  }

  abstract destroy(): void;
  abstract write(data: Float32Array | Uint32Array, offset?: number): void;
  abstract read(): Promise<ArrayBuffer>;
}

export class WebGPUComputeBuffer extends ComputeBuffer {
  private device: GPUDevice;
  public buffer: GPUBuffer;

  constructor(device: GPUDevice, size: number, usage: GPUBufferUsageFlags, label?: string) {
    super(size, 'webgpu');
    this.device = device;
    const descriptor: GPUBufferDescriptor = {
      size,
      usage,
    };
    if (label !== undefined) {
      descriptor.label = label;
    }
    this.buffer = device.createBuffer(descriptor);
  }

  destroy(): void {
    this.buffer?.destroy();
  }

  write(data: Float32Array | Uint32Array, offset: number = 0): void {
    this.device.queue.writeBuffer(this.buffer, offset, data);
  }

  async read(): Promise<ArrayBuffer> {
    const readBuffer = this.device.createBuffer({
      size: this.size,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
    });

    const commandEncoder = this.device.createCommandEncoder();
    commandEncoder.copyBufferToBuffer(this.buffer, 0, readBuffer, 0, this.size);
    this.device.queue.submit([commandEncoder.finish()]);

    await readBuffer.mapAsync(GPUMapMode.READ);
    const arrayBuffer = readBuffer.getMappedRange().slice(0);
    readBuffer.unmap();
    readBuffer.destroy();

    return arrayBuffer;
  }
}

export class CPUComputeBuffer extends ComputeBuffer {
  private data: ArrayBuffer;

  constructor(size: number) {
    super(size, 'cpu');
    this.data = new ArrayBuffer(size);
  }

  destroy(): void {
    // No cleanup needed for CPU buffers
  }

  write(data: Float32Array | Uint32Array, offset: number = 0): void {
    const view = new Uint8Array(this.data);
    const sourceView = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
    view.set(sourceView, offset);
  }

  async read(): Promise<ArrayBuffer> {
    return this.data.slice(0);
  }

  getData(): ArrayBuffer {
    return this.data;
  }
}
