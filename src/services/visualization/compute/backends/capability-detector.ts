export async function supportsWebGPU(): Promise<boolean> {
  if (!navigator.gpu) {
    return false;
  }

  try {
    const adapter = await navigator.gpu.requestAdapter();
    return adapter !== null;
  } catch (e) {
    return false;
  }
}

export function supportsWebGL2(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');
    return gl !== null;
  } catch (e) {
    return false;
  }
}

export function supportsWebGL2Compute(): boolean {
  // WebGL2 doesn't have native compute shaders
  // Would need to check for experimental extensions
  // For now, return false and fall back to CPU
  return false;
}

export interface BackendCapabilities {
  webgpu: boolean;
  webgl2: boolean;
  webgl2Compute: boolean;
}

export async function detectCapabilities(): Promise<BackendCapabilities> {
  return {
    webgpu: await supportsWebGPU(),
    webgl2: supportsWebGL2(),
    webgl2Compute: supportsWebGL2Compute(),
  };
}
