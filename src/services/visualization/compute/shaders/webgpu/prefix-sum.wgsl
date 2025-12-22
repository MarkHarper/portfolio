// Spatial Hash Grid - Pass 2: Prefix Sum (Scan)
// Compute cell offsets from cell counts using parallel prefix sum

struct Params {
  cellCount: u32,
}

@group(0) @binding(0) var<storage, read> cellCounts: array<u32>;
@group(0) @binding(1) var<storage, read_write> cellOffsets: array<u32>;
@group(0) @binding(2) var<uniform> params: Params;

// Simplified prefix sum for now - sequential on single thread
// For better performance, implement work-efficient parallel scan
@compute @workgroup_size(1)
fn main() {
  var sum: u32 = 0u;

  cellOffsets[0] = 0u;

  for (var i = 0u; i < params.cellCount; i++) {
    let count = cellCounts[i];
    cellOffsets[i] = sum;
    sum += count;
  }

  // Sentinel value at end
  cellOffsets[params.cellCount] = sum;
}
