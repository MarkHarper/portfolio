// WGSL Shader code exported as strings

export const spatialHashCountWGSL = `// Spatial Hash Grid - Pass 1: Count particles per cell
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
}`;

export const prefixSumWGSL = `// Spatial Hash Grid - Pass 2: Prefix Sum (Scan)
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
}`;

export const spatialHashIndexWGSL = `// Spatial Hash Grid - Pass 3: Index particles into grid cells
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
}`;

export const physicsFusedWGSL = `// Physics + Line Geometry - Fused Pass
// Performs collision detection, spring forces, position updates, and line generation

struct Params {
  particleCount: u32,
  springStrength: f32,
  edgeDistance: f32,
  edgeDistanceSquared: f32,
  maxVelocity: f32,
  width: f32,
  height: f32,
  cellSize: f32,
  gridWidth: u32,
  gridHeight: u32,
}

// REDUCED BINDINGS: Combined buffers to stay within WebGPU limits
@group(0) @binding(0) var<storage, read_write> positions: array<vec2<f32>>;  // Read and write same buffer
@group(0) @binding(1) var<storage, read_write> velocities: array<vec2<f32>>; // Read and write same buffer
@group(0) @binding(2) var<storage, read> properties: array<vec4<f32>>;       // mass, radius, tag, padding
@group(0) @binding(3) var<storage, read> cellOffsets: array<u32>;
@group(0) @binding(4) var<storage, read> particleIndices: array<u32>;
@group(0) @binding(5) var<storage, read_write> linePositions: array<vec2<f32>>;
@group(0) @binding(6) var<storage, read_write> lineCount: atomic<u32>;
@group(0) @binding(7) var<uniform> params: Params;

fn clampValue(value: f32, minVal: f32, maxVal: f32) -> f32 {
  return max(minVal, min(maxVal, value));
}

fn clampVelocity(vel: f32, maxVel: f32) -> f32 {
  return clampValue(vel, -maxVel, maxVel);
}

@compute @workgroup_size(256)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let idx = global_id.x;
  if (idx >= params.particleCount) {
    return;
  }

  // Load particle data
  var pos = positions[idx];
  var vel = velocities[idx];
  let props = properties[idx];
  let mass = props.x;
  let radius = props.y;

  // Calculate grid cell
  let cellX = i32(floor(pos.x / params.cellSize));
  let cellY = i32(floor(pos.y / params.cellSize));

  // Iterate 9 neighboring cells (3x3 grid)
  for (var dx = -1; dx <= 1; dx++) {
    for (var dy = -1; dy <= 1; dy++) {
      let nx = cellX + dx;
      let ny = cellY + dy;

      // Bounds check
      if (nx < 0 || ny < 0 || nx >= i32(params.gridWidth) || ny >= i32(params.gridHeight)) {
        continue;
      }

      let cellKey = u32(nx) + u32(ny) * params.gridWidth;
      let startIdx = cellOffsets[cellKey];
      let endIdx = cellOffsets[cellKey + 1];

      // Iterate particles in this cell
      for (var i = startIdx; i < endIdx; i++) {
        let neighborIdx = particleIndices[i];

        // Avoid self-interaction
        if (neighborIdx == idx) {
          continue;
        }

        // Load neighbor data
        let neighborPos = positions[neighborIdx];
        let neighborVel = velocities[neighborIdx];
        let neighborProps = properties[neighborIdx];
        let neighborMass = neighborProps.x;
        let neighborRadius = neighborProps.y;

        // Calculate distance
        let dx = neighborPos.x - pos.x;
        let dy = neighborPos.y - pos.y;
        let distSq = dx * dx + dy * dy;

        // Check for collision
        let combinedRadius = radius + neighborRadius;
        let collisionDistSq = combinedRadius * combinedRadius;

        if (distSq < collisionDistSq && distSq > 0.0001) {
          // Collision detected - apply impulse-based response
          let dist = sqrt(distSq);
          let nx = dx / dist;
          let ny = dy / dist;

          // Always separate overlapping particles
          // Use full overlap since we can't update neighbor
          let overlap = combinedRadius - dist;
          pos.x -= nx * overlap;
          pos.y -= ny * overlap;

          // Relative velocity
          let relVelX = neighborVel.x - vel.x;
          let relVelY = neighborVel.y - vel.y;
          let relVelDotNormal = relVelX * nx + relVelY * ny;

          // Apply collision impulse if moving toward each other
          if (relVelDotNormal < 0.0) {
            // Stronger impulse for better collision response
            let impulse = 3.0 * relVelDotNormal / (mass + neighborMass);

            // Apply impulse
            vel.x += impulse * neighborMass * nx;
            vel.y += impulse * neighborMass * ny;
          } else {
            // Also push away if moving apart (ensures separation)
            vel.x -= nx * 0.5;
            vel.y -= ny * 0.5;
          }

          // Apply velocity decay on collision
          vel.x *= 0.95;
          vel.y *= 0.95;

          // Clamp velocities
          vel.x = clampVelocity(vel.x, params.maxVelocity);
          vel.y = clampVelocity(vel.y, params.maxVelocity);
        }
        // Check for spring connection (within edgeDistance but not colliding)
        else if (distSq < params.edgeDistanceSquared) {
          // Apply repulsive force (pushes particles apart)
          // Force is inversely proportional to distance
          let dist = sqrt(distSq);
          let force = params.springStrength * (params.edgeDistance - dist) / params.edgeDistance;
          let nx = dx / dist;
          let ny = dy / dist;

          // Push away from neighbor
          vel.x -= nx * force;
          vel.y -= ny * force;

          // Write line geometry (atomic allocation)
          let lineIdx = atomicAdd(&lineCount, 2u);
          linePositions[lineIdx] = pos;
          linePositions[lineIdx + 1] = neighborPos;
        }
      }
    }
  }

  // Update position with wrapping (toroidal boundaries)
  pos.x += vel.x;
  pos.y += vel.y;

  // Wrap around boundaries (pac-man style)
  if (pos.x < 0.0) { pos.x += params.width; }
  if (pos.x > params.width) { pos.x -= params.width; }
  if (pos.y < 0.0) { pos.y += params.height; }
  if (pos.y > params.height) { pos.y -= params.height; }

  // Write results back to same buffers (in-place update)
  positions[idx] = pos;
  velocities[idx] = vel;
}`;
