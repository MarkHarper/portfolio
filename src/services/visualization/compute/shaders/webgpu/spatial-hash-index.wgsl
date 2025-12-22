// Spatial Hash Grid - Pass 3: Index particles into grid cells
// Write particle indices to sorted array based on their cell

struct Params {
  particleCount: u32,
  cellSize: f32,
  gridWidth: u32,
  gridHeight: u32,
  width: f32,
  height: f32,
}

@group(0) @binding(0) var<storage, read> positions: array<vec2<f32>>;
@group(0) @binding(1) var<storage, read> cellOffsets: array<u32>;
@group(0) @binding(2) var<storage, read_write> cellCounts: array<atomic<u32>>;  // Reused as write cursors
@group(0) @binding(3) var<storage, read_write> particleIndices: array<u32>;
@group(0) @binding(4) var<uniform> params: Params;

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

  // Get base offset for this cell
  let baseOffset = cellOffsets[cellKey];

  // Atomically get write position (reusing cellCounts as cursors)
  let writeOffset = atomicAdd(&cellCounts[cellKey], 1u);

  // Write particle index to sorted array
  particleIndices[baseOffset + writeOffset] = idx;
}
