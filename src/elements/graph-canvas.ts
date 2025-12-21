import React from 'react';
import { LitElement, css, html } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';

import { Field } from '~/services/visualization/field';

import { AnimationController } from './AnimationController';

@customElement('graph-canvas')
export class GraphCanvas extends LitElement {
  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      background-color: var(--canvas);
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
  private field?: Field = undefined;

  @state()
  private fps: number = 0;

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

  private init() {
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

    this.field = new Field(width, height, settings, this._canvas);
    this.animation.setRender(this.createRenderFunction());
    this.animation.start();

    this.play = true;
  }

  private createRenderFunction() {
    return () => {
      this.field?.render();
      if (this.showFps) {
        this.field?.renderFPS(this.fps);
      }
    };
  }

  updated(changedProperties) {
    if (!this.field) {
      this.init();
    }

    if (changedProperties.has('height') || changedProperties.has('width')) {
      const { width, height } = changedProperties;
      const nextWidth = width ?? this.width;
      const nextHeight = height ?? this.height;

      this.animation?.stop();
      this.field?.setDimensions(nextWidth, nextHeight);

      if (!this.play) {
        this.field?.draw();
        if (this.showFps) {
          this.field?.renderFPS(this.fps);
        }
      } else {
        this.animation.setRender(this.createRenderFunction());
        this.animation?.start();
      }
    }

    if (changedProperties.has('play') && this.play && !changedProperties.play) {
      this.animation?.stop();
    } else if (
      changedProperties.has('play') &&
      !this.play &&
      changedProperties.play
    ) {
      const { width, height } = this;

      this.animation?.stop();
      this.field?.setDimensions(width, height);
      this.animation.setRender(this.createRenderFunction());
      this.animation?.start();
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

    if (changedProperties.has('showFps')) {
      if (this.play) {
        this.animation?.stop();
        this.animation.setRender(this.createRenderFunction());
        this.animation?.start();
      } else {
        this.field?.draw();
        if (this.showFps) {
          this.field?.renderFPS(this.fps);
        }
      }
    }
  }

  render() {
    return html`<canvas
      id="graph-canvas"
      width="${this.width}"
      height="${this.height}"
    />`;
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
