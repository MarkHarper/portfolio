// WebGPU Render Shaders - For rendering particles and lines directly from compute buffers

export const particleVertexWGSL = `
struct VertexInput {
  @builtin(vertex_index) vertexIndex: u32,
  @location(0) position: vec2<f32>,      // Instance: particle center
  @location(1) color: vec4<f32>,         // Instance: particle color
  @location(2) size: f32,                // Instance: particle radius
}

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) color: vec4<f32>,
  @location(1) uv: vec2<f32>,
}

struct Uniforms {
  viewProjection: mat4x4<f32>,
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

// Quad vertices (2 triangles)
const QUAD_POSITIONS = array<vec2<f32>, 6>(
  vec2<f32>(-1.0, -1.0),  // Bottom-left
  vec2<f32>( 1.0, -1.0),  // Bottom-right
  vec2<f32>( 1.0,  1.0),  // Top-right
  vec2<f32>(-1.0, -1.0),  // Bottom-left
  vec2<f32>( 1.0,  1.0),  // Top-right
  vec2<f32>(-1.0,  1.0),  // Top-left
);

@vertex
fn main(input: VertexInput) -> VertexOutput {
  var output: VertexOutput;

  // Get quad corner position (-1 to 1)
  let quadPos = QUAD_POSITIONS[input.vertexIndex];

  // Scale by particle size and offset by particle position
  let worldPos = input.position + quadPos * input.size;

  // Transform to clip space
  output.position = uniforms.viewProjection * vec4<f32>(worldPos, 0.0, 1.0);
  output.color = input.color;
  output.uv = quadPos;  // UV coords for circle rendering

  return output;
}
`;

export const particleFragmentWGSL = `
struct FragmentInput {
  @location(0) color: vec4<f32>,
  @location(1) uv: vec2<f32>,
}

@fragment
fn main(input: FragmentInput) -> @location(0) vec4<f32> {
  // Render as circles - discard pixels outside unit circle
  let dist = length(input.uv);
  if (dist > 1.0) {
    discard;
  }

  // Optional: soft edge
  let alpha = 1.0 - smoothstep(0.8, 1.0, dist);

  return vec4<f32>(input.color.rgb, input.color.a * alpha);
}
`;

export const lineVertexWGSL = `
struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) color: vec4<f32>,
}

struct Uniforms {
  viewProjection: mat4x4<f32>,
  lineColor: vec4<f32>,
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var<storage, read> positions: array<vec2<f32>>;

@vertex
fn main(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
  var output: VertexOutput;

  let pos = positions[vertexIndex];
  output.position = uniforms.viewProjection * vec4<f32>(pos, 0.0, 1.0);
  output.color = uniforms.lineColor;

  return output;
}
`;

export const lineFragmentWGSL = `
@fragment
fn main(@location(0) color: vec4<f32>) -> @location(0) vec4<f32> {
  return color;
}
`;
