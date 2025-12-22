export type { IComputeBackend, PhysicsParams, GridParams, LineGeometryResult } from './backends/interface';
export { WebGPUComputeBackend } from './backends/webgpu-backend';
export { CPUComputeBackend } from './backends/cpu-backend';
export { supportsWebGPU, supportsWebGL2, detectCapabilities } from './backends/capability-detector';

import { IComputeBackend } from './backends/interface';
import { WebGPUComputeBackend } from './backends/webgpu-backend';
import { CPUComputeBackend } from './backends/cpu-backend';
import { supportsWebGPU } from './backends/capability-detector';

export async function createOptimalBackend(): Promise<IComputeBackend> {
  // Enable WebGPU - all-GPU rendering (no Three.js)
  const ENABLE_WEBGPU = true;

  // Detect Firefox - skip WebGPU due to experimental/slow implementation
  const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');
  if (isFirefox) {
    console.log('[Compute] Firefox detected - using CPU backend for better performance');
    const backend = new CPUComputeBackend();
    await backend.initialize();
    return backend;
  }

  // Try WebGPU first (non-Firefox browsers)
  if (ENABLE_WEBGPU && await supportsWebGPU()) {
    try {
      const backend = new WebGPUComputeBackend();
      await backend.initialize();
      console.log('[Compute] Using WebGPU backend');
      return backend;
    } catch (e) {
      console.warn('[Compute] WebGPU initialization failed, falling back to CPU:', e);
    }
  } else if (ENABLE_WEBGPU) {
    console.log('[Compute] WebGPU not supported, using CPU backend');
  } else {
    console.log('[Compute] WebGPU disabled, using CPU backend');
  }

  // Fall back to CPU
  const backend = new CPUComputeBackend();
  await backend.initialize();
  console.log('[Compute] Using CPU backend');
  return backend;
}
