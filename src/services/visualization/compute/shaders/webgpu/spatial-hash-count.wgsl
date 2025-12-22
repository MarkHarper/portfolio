// Spatial Hash Grid - Pass 1: Count particles per cell
// Each particle atomically increments its cell's counter

struct Params {
  particleCount: u32,
  cellSize: f32,
  gridWidth: u32,
  gridHeight: u32,
  width: f32,
  height: f32,
}

@group(0) @binding(0) var<storage, read> positions: array<vec2<f32>>;
@group(0) @binding(1) var<storage, read_write> cellCounts: array<atomic<u32>>;
@group(0) @binding(2) var<uniform> params: Params;

@compute @workgroup_size(256)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let idx = global_id.x;
  if (idx >= params.particleCount) {
    return;
  }

  let pos = positions[idx];

  // Calculate grid cell
  let cellX = u32(floor(pos.x / params.cellSize));
  let cellY = u32(floor(pos.y / params.cellSize));

  // Bounds check
  if (cellX >= params.gridWidth || cellY >= params.gridHeight) {
    return;
  }

  let cellKey = cellX + cellY * params.gridWidth;

  // Atomically increment cell count
  atomicAdd(&cellCounts[cellKey], 1u);
}
