import React from 'react';
import { LitElement, css, html } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';

import { ThreeField } from '~/services/visualization/field/three-field';
import { WebGPUField } from '~/services/visualization/field/webgpu-field';
import { supportsWebGPU } from '~/services/visualization/compute/backends/capability-detector';

import { AnimationController } from './AnimationController';

@customElement('graph-canvas')
export class GraphCanvas extends LitElement {
  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      background-color: var(--canvas);
      position: relative;
    }

    .fps-counter {
      position: absolute;
      top: 10px;
      left: 10px;
      font-family: monospace;
      font-size: 16px;
      color: var(--text-primary);
      pointer-events: none;
      z-index: 10;
    }
  `;

  private animation = new AnimationController(this);

  @query('#graph-canvas')
  _canvas?: HTMLCanvasElement;

  @property({ type: Number, attribute: 'data-width', reflect: true })
  width?: number = undefined;

  @property({ type: Number, attribute: 'data-height', reflect: true })
  height?: number = undefined;

  @property({ type: Boolean, attribute: 'data-play', reflect: true })
  play: boolean = false;

  @property({ type: Number, attribute: 'data-density', reflect: true })
  density?: number = undefined;

  @property({ type: String, attribute: 'data-line-color', reflect: true })
  lineColor?: string = undefined;

  @property({ type: Number, attribute: 'data-max-velocity', reflect: true })
  maxVelocity?: number = undefined;

  @property({ type: Number, attribute: 'data-edge-distance', reflect: true })
  edgeDistance?: number = undefined;

  @property({ type: Number, attribute: 'data-spring-strength', reflect: true })
  springStrength?: number = undefined;

  @property({ type: Array, reflect: true })
  nodes?: any[] = undefined;

  @property({ type: Boolean, attribute: 'data-show-fps', reflect: true })
  showFps: boolean = false;

  @state()
  private field?: ThreeField | WebGPUField = undefined;

  @state()
  private fps: number = 0;

  @state()
  private useWebGPU: boolean = false;

  connectedCallback() {
    super.connectedCallback();

    this.init();
    this.startFPSUpdates();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.stopFPSUpdates();
  }

  private fpsUpdateInterval?: number;

  private startFPSUpdates() {
    this.fpsUpdateInterval = window.setInterval(() => {
      this.fps = this.animation.getFPS();
    }, 100);
  }

  private stopFPSUpdates() {
    if (this.fpsUpdateInterval) {
      clearInterval(this.fpsUpdateInterval);
    }
  }

  getFPS(): number {
    return this.fps;
  }

  private async init() {
    const { width, height } = this;
    const settings = {
      density: this.density,
      lineColor: this.lineColor,
      edgeDistance: this.edgeDistance,
      maxVelocity: this.maxVelocity,
      springStrength: this.springStrength,
      nodes: this.nodes,
    };

    if (!width || !height || !this._canvas) {
      return;
    }

    // Detect Firefox - use Three.js for better performance
    const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');

    if (isFirefox) {
      console.log('[GraphCanvas] 🦊 Firefox detected - Using Three.js renderer for optimal performance');
      console.log('[GraphCanvas] 💡 Firefox WebGPU is experimental. Three.js (WebGL) provides better stability and performance.');
      this.useWebGPU = false;
      this.field = new ThreeField(width, height, settings, this._canvas);
    } else {
      // Detect WebGPU support for non-Firefox browsers
      this.useWebGPU = await supportsWebGPU();

      if (this.useWebGPU) {
        console.log('[GraphCanvas] Using WebGPU renderer');
        try {
          this.field = new WebGPUField(width, height, settings, this._canvas);
        } catch (e) {
          console.warn('[GraphCanvas] WebGPU failed, falling back to Three.js:', e);
          this.useWebGPU = false;
          this.field = new ThreeField(width, height, settings, this._canvas);
        }
      } else {
        console.log('[GraphCanvas] Using Three.js renderer');
        this.field = new ThreeField(width, height, settings, this._canvas);
      }
    }

    this.animation.setRender(this.createRenderFunction());
    this.animation.start();

    this.play = true;
  }

  private createRenderFunction() {
    return () => {
      this.field?.render();
    };
  }

  updated(changedProperties: Map<string, any>) {
    if (!this.field) {
      this.init();
    }

    if (changedProperties.has('height') || changedProperties.has('width')) {
      const width = changedProperties.get('width');
      const height = changedProperties.get('height');
      const nextWidth = width ?? this.width;
      const nextHeight = height ?? this.height;

      this.animation?.stop();
      this.field?.setDimensions(nextWidth, nextHeight);

      if (!this.play) {
        this.field?.draw();
      } else {
        this.animation.setRender(this.createRenderFunction());
        this.animation?.start();
      }
    }

    if (changedProperties.has('play') && this.play && !changedProperties.get('play')) {
      this.animation?.stop();
    } else if (
      changedProperties.has('play') &&
      !this.play &&
      changedProperties.get('play')
    ) {
      const { width, height } = this;

      if (width && height) {
        this.animation?.stop();
        this.field?.setDimensions(width, height);
        this.animation.setRender(this.createRenderFunction());
        this.animation?.start();
      }
    }

    if (
      changedProperties.has('lineColor') ||
      changedProperties.has('maxVelocity') ||
      changedProperties.has('springStrength') ||
      changedProperties.has('edgeDistance')
    ) {
      const settings = {
        lineColor: this.lineColor,
        edgeDistance: this.edgeDistance,
        maxVelocity: this.maxVelocity,
        springStrength: this.springStrength,
      };

      this.animation?.stop();
      this.field?.updateSettings(settings);
      this.animation.setRender(this.createRenderFunction());
      this.animation?.start();
    } else if (changedProperties.has('density')) {
      this.animation?.stop();
      this.field?.updateSettings({
        density: this.density,
      });
      this.field?.updateParticles();
      this.animation.setRender(this.createRenderFunction());
      this.animation?.start();
    } else if (changedProperties.has('nodes')) {
      this.animation?.stop();
      this.field?.updateSettings({
        nodes: this.nodes,
      });
      this.field?.updateParticles();
      this.animation.setRender(this.createRenderFunction());
      this.animation?.start();
    }

  }

  render() {
    return html`
      <canvas
        id="graph-canvas"
        width="${this.width}"
        height="${this.height}"
      ></canvas>
      ${this.showFps ? html`<div class="fps-counter">FPS: ${this.fps}</div>` : ''}
    `;
  }
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'graph-canvas': React.DetailedHTMLProps<
        React.HTMLAttributes<GraphCanvas>,
        GraphCanvas
      >;
    }
  }
}
