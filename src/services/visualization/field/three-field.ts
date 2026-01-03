import * as THREE from 'three';
import { hexToRGB } from '../canvas/color';
import { checkCollision, handleCollision } from '../canvas/physics/collision';
import { clamp } from '../canvas/physics/clamp';
import { distanceSquared } from '../canvas/physics/distance';
import { Particle } from './particle';
import { SpatialHashGrid } from '../canvas/spatial-hash-grid';
import { IComputeBackend, createOptimalBackend } from '../compute';

export class ThreeField {
  width: number;
  height: number;
  settings: any;
  contents: Particle[];

  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private renderer: THREE.WebGLRenderer;
  private particleGeometry: THREE.BufferGeometry;
  private particlePoints: THREE.Points;
  private lineGeometry: THREE.BufferGeometry;
  private lineSegments: THREE.LineSegments;
  private spatialGrid: SpatialHashGrid;
  private particleIndexMap: Map<Particle, number>;
  private linePositionsArray: number[];

  // Compute backend for GPU acceleration
  private computeBackend: IComputeBackend | null = null;
  private useComputeBackend: boolean = false;
  private isInitializing: boolean = false;
  private isRendering: boolean = false;

  constructor(
    width: number,
    height: number,
    settings: any,
    canvas: HTMLCanvasElement,
  ) {
    this.width = width;
    this.height = height;
    this.settings = settings;
    this.contents = [];
    this.particleIndexMap = new Map();

    // Ensure reasonable defaults for undefined settings (match WebGPUField)
    if (settings.edgeDistance === undefined || settings.edgeDistance > 500) {
      console.log(`[ThreeField] Invalid edgeDistance: ${settings.edgeDistance}, using default 150`);
      settings.edgeDistance = 150;
    }
    if (settings.springStrength === undefined || settings.springStrength < 0.01) {
      settings.springStrength = 0.05;
    }
    if (settings.maxVelocity === undefined) {
      settings.maxVelocity = 2;
    }

    console.log('[ThreeField] Settings:', {
      edgeDistance: settings.edgeDistance,
      springStrength: settings.springStrength,
      maxVelocity: settings.maxVelocity,
      density: settings.density,
    });

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: true,
    });
    this.renderer.setSize(width, height);
    this.renderer.setClearColor(0x000000, 0);

    this.camera = new THREE.OrthographicCamera(0, width, 0, height, 0.1, 1000);
    this.camera.position.z = 10;

    this.scene = new THREE.Scene();

    this.particleGeometry = new THREE.BufferGeometry();
    this.lineGeometry = new THREE.BufferGeometry();

    const rgb = hexToRGB(settings.lineColor);
    const lineColor = new THREE.Color(rgb.r / 255, rgb.g / 255, rgb.b / 255);

    const particleMaterial = new THREE.ShaderMaterial({
      uniforms: {},
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        void main() {
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);
          if (dist > 0.5) discard;
          gl_FragColor = vec4(vColor, 1.0);
        }
      `,
    });
    const lineMaterial = new THREE.LineBasicMaterial({
      color: lineColor,
      opacity: 0.3,
      transparent: true,
      depthWrite: false,
    });
    this.lineSegments = new THREE.LineSegments(this.lineGeometry, lineMaterial);
    this.scene.add(this.lineSegments);

    particleMaterial.depthTest = true;
    this.particlePoints = new THREE.Points(this.particleGeometry, particleMaterial);
    this.scene.add(this.particlePoints);

    this.spatialGrid = new SpatialHashGrid(settings.edgeDistance);
    this.linePositionsArray = [];

    this.createParticles();

    // Initialize compute backend asynchronously
    this.initializeComputeBackend();
  }

  private async initializeComputeBackend(): Promise<void> {
    if (this.isInitializing) return;
    this.isInitializing = true;

    try {
      this.computeBackend = await createOptimalBackend();
      this.computeBackend.createParticleBuffers(this.contents);
      this.useComputeBackend = true;
      console.log(`[ThreeField] Initialized ${this.computeBackend.getBackendName()} backend for ${this.contents.length} particles`);
    } catch (e) {
      console.error('[ThreeField] Failed to initialize compute backend:', e);
      this.useComputeBackend = false;
    } finally {
      this.isInitializing = false;
    }
  }

  updateSettings(updates: any): void {
    // Filter out undefined values to avoid overwriting existing settings
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    this.settings = {
      ...this.settings,
      ...filteredUpdates,
    };

    if (updates.lineColor) {
      const rgb = hexToRGB(updates.lineColor);
      const color = new THREE.Color(rgb.r / 255, rgb.g / 255, rgb.b / 255);
      (this.lineSegments.material as THREE.LineBasicMaterial).color = color;
    }

    if (updates.edgeDistance) {
      this.spatialGrid = new SpatialHashGrid(updates.edgeDistance);

      // Recreate compute backend buffers with new grid dimensions if using compute
      if (this.computeBackend && this.contents.length > 0) {
        this.computeBackend.createParticleBuffers(this.contents);
      }
    }
  }

  createParticles(): void {
    const { density, nodes } = this.settings;
    const area = this.width * this.height;
    const particleCount = Math.floor(area * density);
    const nodeOptionsArr = nodes ? [...nodes.values()] : [];
    const optionsCount = nodeOptionsArr.length;

    if (!nodes) {
      this.contents = [];
      return;
    }

    this.contents = Array(particleCount)
      .fill(null)
      .map(() => {
        const optionIndex = Math.floor(Math.random() * optionsCount);
        const option = nodeOptionsArr[optionIndex];
        const vxRand = Math.random();
        const vxMag = vxRand * option.speed;
        const vyRand = Math.random();
        const vyMag = vyRand * option.speed;

        return new Particle({
          tag: option.id,
          radius: option.radius,
          mass: option.mass,
          fillStyle: option.color,
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          vx: vxRand > 0.5 ? vxMag : -vxMag,
          vy: vyRand > 0.5 ? vyMag : -vyMag,
        });
      });

    this.updateParticleGeometry();

    // Update compute backend if it's already initialized
    if (this.computeBackend) {
      this.computeBackend.updateParticleData(this.contents);
    }
  }

  updateParticles(): void {
    const { density, nodes } = this.settings;
    const area = this.width * this.height;
    const newParticleCount = Math.floor(area * density);
    const newContents = [];
    const nodeOptionsArr = nodes ? [...nodes.values()] : [];
    const optionsCount = nodes?.size;

    if (optionsCount) {
      for (let i = 0; i < newParticleCount; i++) {
        const existingParticle = this.contents[i];
        const option = nodes.get(existingParticle?.tag);

        if (existingParticle && option) {
          existingParticle.setMass(option.mass);
          existingParticle.setRadius(option.radius);
          existingParticle.setFillStyle(option.color);
          newContents.push(existingParticle);
        } else if (!existingParticle || !option) {
          const optionIndex = (Math.random() * optionsCount) | 0;
          const option = nodeOptionsArr[optionIndex];
          const vxRand = Math.random();
          const vxMag = vxRand * option.speed;
          const vyRand = Math.random();
          const vyMag = vyRand * option.speed;

          const newParticle = new Particle({
            tag: option.id,
            radius: option.radius,
            mass: option.mass,
            fillStyle: option.color,
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            vx: vxRand > 0.5 ? vxMag : -vxMag,
            vy: vyRand > 0.5 ? vyMag : -vyMag,
          });

          newContents.push(newParticle);
        }
      }
    }

    this.contents = newContents;
    this.updateParticleGeometry();

    // Update compute backend if active
    if (this.computeBackend) {
      this.computeBackend.updateParticleData(this.contents);
    }
  }

  setDimensions(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.renderer.setSize(width, height);
    this.camera.left = 0;
    this.camera.right = width;
    this.camera.top = 0;
    this.camera.bottom = height;
    this.camera.updateProjectionMatrix();
  }

  private updateParticleGeometry(): void {
    const positionAttr = this.particleGeometry.getAttribute('position') as THREE.BufferAttribute;

    const needsRealloc = !positionAttr || positionAttr.count !== this.contents.length;

    if (needsRealloc) {
      const positions = new Float32Array(this.contents.length * 3);
      const colors = new Float32Array(this.contents.length * 3);
      const sizes = new Float32Array(this.contents.length);

      for (let i = 0; i < this.contents.length; i++) {
        const particle = this.contents[i];
        positions[i * 3] = particle.x;
        positions[i * 3 + 1] = particle.y;
        positions[i * 3 + 2] = 1;

        const color = new THREE.Color(particle.fillStyle);
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;

        sizes[i] = particle.radius * 2;
      }

      this.particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      this.particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      this.particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    } else {
      // Update existing buffers
      const colorAttr = this.particleGeometry.getAttribute('color') as THREE.BufferAttribute;
      const sizeAttr = this.particleGeometry.getAttribute('size') as THREE.BufferAttribute;

      const positions = positionAttr.array as Float32Array;
      const colors = colorAttr.array as Float32Array;
      const sizes = sizeAttr.array as Float32Array;

      for (let i = 0; i < this.contents.length; i++) {
        const particle = this.contents[i];

        // Update positions
        positions[i * 3] = particle.x;
        positions[i * 3 + 1] = particle.y;

        // Update colors
        const color = new THREE.Color(particle.fillStyle);
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;

        // Update sizes
        sizes[i] = particle.radius * 2;
      }

      positionAttr.needsUpdate = true;
      colorAttr.needsUpdate = true;
      sizeAttr.needsUpdate = true;
    }
  }

  draw(): void {
    this.spatialGrid.clear();
    this.particleIndexMap.clear();
    for (let i = 0; i < this.contents.length; i++) {
      const particle = this.contents[i];
      this.spatialGrid.insert(particle);
      this.particleIndexMap.set(particle, i);
    }

    this.updateParticleGeometry();
    this.updateLineGeometry();
    this.renderer.render(this.scene, this.camera);
  }

  render(): void {
    if (this.useComputeBackend && this.computeBackend) {
      // Skip frame if previous GPU work still in progress
      if (this.isRendering) {
        return;
      }

      // Use GPU compute backend
      this.isRendering = true;
      this.renderWithCompute()
        .catch(e => {
          console.error('[ThreeField] Compute backend error, falling back to CPU:', e);
          this.useComputeBackend = false;
        })
        .finally(() => {
          this.isRendering = false;
        });
    } else {
      // Fall back to CPU rendering
      this.renderCPU();
    }
  }

  private async renderWithCompute(): Promise<void> {
    if (!this.computeBackend) return;

    const { width, height } = this;
    const { springStrength, edgeDistance, maxVelocity } = this.settings;

    const cellSize = edgeDistance;
    const gridWidth = Math.ceil(width / cellSize);
    const gridHeight = Math.ceil(height / cellSize);

    try {
      // Execute spatial hash grid construction
      this.computeBackend.executeSpatialHashPass({
        particleCount: this.contents.length,
        cellSize,
        gridWidth,
        gridHeight,
        width,
        height,
      });

      // Execute physics simulation and line geometry generation
      this.computeBackend.executePhysicsPass({
        particleCount: this.contents.length,
        springStrength,
        edgeDistance,
        edgeDistanceSquared: edgeDistance * edgeDistance,
        maxVelocity,
        width,
        height,
        cellSize,
        gridWidth,
        gridHeight,
      });

      // GPU-ONLY PATH: Update Three.js buffers directly from GPU
      // No CPU particle sync needed!
      await this.updateGeometryFromGPUDirect();

      // Render
      this.renderer.render(this.scene, this.camera);
    } catch (e) {
      console.error('[ThreeField] Compute backend error:', e);
      this.useComputeBackend = false;
      throw e; // Re-throw to trigger the catch in render()
    }
  }

  private async updateGeometryFromGPUDirect(): Promise<void> {
    // Get or create particle position buffer
    let positionAttr = this.particleGeometry.getAttribute('position') as THREE.BufferAttribute;

    if (!positionAttr || positionAttr.count !== this.contents.length) {
      // Allocate new buffer
      const positions = new Float32Array(this.contents.length * 3);
      positionAttr = new THREE.BufferAttribute(positions, 3);
      this.particleGeometry.setAttribute('position', positionAttr);
    }

    // Update particle positions directly from GPU into Three.js buffer
    await this.computeBackend!.readParticlePositionsInto(positionAttr.array as Float32Array);
    positionAttr.needsUpdate = true;

    // Get or create line position buffer (conservatively sized)
    const maxLines = this.contents.length * 10; // Conservative estimate
    let linePositionAttr = this.lineGeometry.getAttribute('position') as THREE.BufferAttribute;

    if (!linePositionAttr || linePositionAttr.count < maxLines * 2) {
      // Allocate new buffer
      const positions = new Float32Array(maxLines * 6); // 2 vertices × 3 coords per line
      linePositionAttr = new THREE.BufferAttribute(positions, 3);
      this.lineGeometry.setAttribute('position', linePositionAttr);
    }

    // Update line positions directly from GPU
    const lineCount = await this.computeBackend!.readLineGeometryInto(
      linePositionAttr.array as Float32Array,
      maxLines
    );

    // Update draw range to only render actual lines
    this.lineGeometry.setDrawRange(0, lineCount * 2);
    linePositionAttr.needsUpdate = true;
  }

  private renderCPU(): void {
    const { width, height } = this;
    const { springStrength, edgeDistance, maxVelocity } = this.settings;
    const edgeDistanceSquared = edgeDistance * edgeDistance;

    this.spatialGrid.clear();
    this.particleIndexMap.clear();
    for (let i = 0; i < this.contents.length; i++) {
      const particle = this.contents[i];
      this.spatialGrid.insert(particle);
      this.particleIndexMap.set(particle, i);
    }

    // Create buffers to accumulate changes (double-buffer like GPU)
    const velocityUpdates = new Map<number, { vx: number; vy: number } | null>();
    const positionDeltas = new Map<number, { dx: number; dy: number }>();

    for (let i = 0; i < this.contents.length; i++) {
      velocityUpdates.set(i, null);
      positionDeltas.set(i, { dx: 0, dy: 0 });
    }

    for (let i = 0; i < this.contents.length; i++) {
      const p1 = this.contents[i];
      const nearby = this.spatialGrid.getNearbyParticles(p1);

      for (let j = 0; j < nearby.length; j++) {
        const p2 = nearby[j];
        const p2Index = this.particleIndexMap.get(p2)!;
        if (p2Index <= i) continue;  // Skip already-processed pairs and self-interaction

        const { dx, dy, directSquared } = distanceSquared(p1, p2);
        if (checkCollision(p1, p2, directSquared)) {
          const { p1: nextP1, p2: nextP2 } = handleCollision(p1, p2, dx, dy, maxVelocity);
          // Store new velocities (will be applied after all interactions)
          velocityUpdates.set(i, { vx: nextP1.vx, vy: nextP1.vy });
          velocityUpdates.set(p2Index, { vx: nextP2.vx, vy: nextP2.vy });

          // Accumulate separation displacement
          const dist = Math.sqrt(directSquared);
          if (dist > 0.0001) {
            const nx = dx / dist;
            const ny = dy / dist;
            const combinedRadius = p1.radius + p2.radius;
            const overlap = combinedRadius - dist;
            const separation = overlap * 0.5;

            const posDelta1 = positionDeltas.get(i)!;
            const posDelta2 = positionDeltas.get(p2Index)!;
            posDelta1.dx -= nx * separation;
            posDelta1.dy -= ny * separation;
            posDelta2.dx += nx * separation;
            posDelta2.dy += ny * separation;
          }
        } else if (directSquared < edgeDistanceSquared) {
          // Apply repulsive force (pushes particles apart) - matches GPU shader
          const dist = Math.sqrt(directSquared);
          const force = springStrength * (edgeDistance - dist) / edgeDistance;
          const nx = dx / dist;
          const ny = dy / dist;

          // Get current velocity (or already-computed collision velocity)
          const vel1 = velocityUpdates.get(i) || { vx: p1.vx, vy: p1.vy };
          const vel2 = velocityUpdates.get(p2Index) || { vx: p2.vx, vy: p2.vy };

          // Push away from neighbor (negative force)
          velocityUpdates.set(i, { vx: vel1.vx - nx * force, vy: vel1.vy - ny * force });
          velocityUpdates.set(p2Index, { vx: vel2.vx + nx * force, vy: vel2.vy + ny * force });
        }
      }
    }

    // Apply all accumulated changes
    for (let i = 0; i < this.contents.length; i++) {
      const particle = this.contents[i];

      // Apply velocity changes
      const velUpdate = velocityUpdates.get(i);
      if (velUpdate) {
        particle.setVelocity(velUpdate.vx, velUpdate.vy);
      }

      // Apply position separation
      const posDelta = positionDeltas.get(i)!;
      if (posDelta.dx !== 0 || posDelta.dy !== 0) {
        particle.setPosition(particle.x + posDelta.dx, particle.y + posDelta.dy);
      }
    }

    // Update positions based on final velocities
    for (let i = 0; i < this.contents.length; i++) {
      const particle = this.contents[i];
      const possibleX = particle.x + particle.vx;
      const x = clamp(possibleX, 0, width);
      const possibleY = particle.y + particle.vy;
      const y = clamp(possibleY, 0, height);
      particle.setPosition(x, y);
    }

    this.updateParticleGeometry();
    this.updateLineGeometry();
    this.renderer.render(this.scene, this.camera);
  }

  private updateLineGeometryFromCompute(linePositions: Float32Array, lineCount: number): void {
    const positionAttr = this.lineGeometry.getAttribute('position') as THREE.BufferAttribute;
    const vertexCount = lineCount * 2; // 2 vertices per line

    if (!positionAttr || positionAttr.count !== vertexCount) {
      // Need to reallocate
      const positions = new Float32Array(vertexCount * 3);
      for (let i = 0; i < lineCount; i++) {
        // First endpoint
        positions[i * 6] = linePositions[i * 4];
        positions[i * 6 + 1] = linePositions[i * 4 + 1];
        positions[i * 6 + 2] = 0;
        // Second endpoint
        positions[i * 6 + 3] = linePositions[i * 4 + 2];
        positions[i * 6 + 4] = linePositions[i * 4 + 3];
        positions[i * 6 + 5] = 0;
      }
      this.lineGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    } else {
      // Update in place
      const positions = positionAttr.array as Float32Array;
      for (let i = 0; i < lineCount; i++) {
        // First endpoint
        positions[i * 6] = linePositions[i * 4];
        positions[i * 6 + 1] = linePositions[i * 4 + 1];
        positions[i * 6 + 2] = 0;
        // Second endpoint
        positions[i * 6 + 3] = linePositions[i * 4 + 2];
        positions[i * 6 + 4] = linePositions[i * 4 + 3];
        positions[i * 6 + 5] = 0;
      }
      positionAttr.needsUpdate = true;
    }
  }

  private updateLineGeometry(): void {
    const { edgeDistance } = this.settings;
    const edgeDistanceSquared = edgeDistance * edgeDistance;
    let lineIndex = 0;

    for (let i = 0; i < this.contents.length; i++) {
      const p1 = this.contents[i];
      const nearby = this.spatialGrid.getNearbyParticles(p1);

      for (let j = 0; j < nearby.length; j++) {
        const p2 = nearby[j];
        const p2Index = this.particleIndexMap.get(p2)!;
        if (p2Index <= i) continue;

        const { directSquared } = distanceSquared(p1, p2);
        if (directSquared < edgeDistanceSquared) {
          this.linePositionsArray[lineIndex++] = p1.x;
          this.linePositionsArray[lineIndex++] = p1.y;
          this.linePositionsArray[lineIndex++] = 0;
          this.linePositionsArray[lineIndex++] = p2.x;
          this.linePositionsArray[lineIndex++] = p2.y;
          this.linePositionsArray[lineIndex++] = 0;
        }
      }
    }

    const positionAttr = this.lineGeometry.getAttribute('position') as THREE.BufferAttribute;
    const expectedCount = lineIndex / 3;

    if (!positionAttr || positionAttr.count !== expectedCount) {
      const linePositions = new Float32Array(lineIndex);
      for (let i = 0; i < lineIndex; i++) {
        linePositions[i] = this.linePositionsArray[i];
      }
      this.lineGeometry.setAttribute(
        'position',
        new THREE.BufferAttribute(linePositions, 3)
      );
    } else {
      const positions = positionAttr.array as Float32Array;
      for (let i = 0; i < lineIndex; i++) {
        positions[i] = this.linePositionsArray[i];
      }
      positionAttr.needsUpdate = true;
    }
  }

  renderFPS(_fps: number): void {
  }
}
