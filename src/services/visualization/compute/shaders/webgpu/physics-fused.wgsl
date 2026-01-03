// Physics + Line Geometry - Fused Pass
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

@group(0) @binding(0) var<storage, read> positionsIn: array<vec2<f32>>;
@group(0) @binding(1) var<storage, read> velocitiesIn: array<vec2<f32>>;
@group(0) @binding(2) var<storage, read> properties: array<vec4<f32>>;  // mass, radius, tag, padding
@group(0) @binding(3) var<storage, read_write> positionsOut: array<vec2<f32>>;
@group(0) @binding(4) var<storage, read_write> velocitiesOut: array<vec2<f32>>;
@group(0) @binding(5) var<storage, read> cellOffsets: array<u32>;
@group(0) @binding(6) var<storage, read> particleIndices: array<u32>;
@group(0) @binding(7) var<storage, read_write> linePositions: array<vec2<f32>>;
@group(0) @binding(8) var<storage, read_write> lineCount: atomic<u32>;
@group(0) @binding(9) var<uniform> params: Params;

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
  var pos = positionsIn[idx];
  var vel = velocitiesIn[idx];
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
        let neighborPos = positionsIn[neighborIdx];
        let neighborVel = velocitiesIn[neighborIdx];
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

          // Relative velocity
          let relVelX = neighborVel.x - vel.x;
          let relVelY = neighborVel.y - vel.y;
          let relVelDotNormal = relVelX * nx + relVelY * ny;

          // Only resolve if objects are moving toward each other
          if (relVelDotNormal < 0.0) {
            // Impulse magnitude (simplified elastic collision)
            let impulse = 2.0 * relVelDotNormal / (mass + neighborMass);

            // Apply impulse
            vel.x += impulse * neighborMass * nx;
            vel.y += impulse * neighborMass * ny;

            // Separate particles to avoid overlap
            let overlap = combinedRadius - dist;
            let separation = overlap * 0.5;
            pos.x -= nx * separation;
            pos.y -= ny * separation;
          }

          // Apply velocity decay
          vel.x *= 0.999;
          vel.y *= 0.999;

          // Clamp velocities
          vel.x = clampVelocity(vel.x, params.maxVelocity);
          vel.y = clampVelocity(vel.y, params.maxVelocity);
        }
        // Check for spring connection (within edgeDistance but not colliding)
        else if (distSq < params.edgeDistanceSquared) {
          // Apply spring force
          vel.x += dx * params.springStrength;
          vel.y += dy * params.springStrength;

          // Write line geometry (atomic allocation)
          let lineIdx = atomicAdd(&lineCount, 2u);
          linePositions[lineIdx] = pos;
          linePositions[lineIdx + 1] = neighborPos;
        }
      }
    }
  }

  // Update position with clamping to boundaries
  pos.x = clampValue(pos.x + vel.x, 0.0, params.width);
  pos.y = clampValue(pos.y + vel.y, 0.0, params.height);

  // Write results to output buffers
  positionsOut[idx] = pos;
  velocitiesOut[idx] = vel;
}
