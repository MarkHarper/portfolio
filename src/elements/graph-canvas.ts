import React from 'react';
import { LitElement, css, html } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';

import { getThemeConfig } from '~/services/theme';
import type { ThemeConfig, ThemeName } from '~/services/theme/config';
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

  @property({ attribute: 'data-theme', reflect: true })
  theme?: ThemeName = undefined;

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

  @state()
  private field?: Field = undefined;

  connectedCallback() {
    super.connectedCallback();

    this.init();
  }

  private init() {
    const { width, height, theme } = this;
    const themeConfig = getThemeConfig();
    const settings = {
      density: this.density,
      lineColor: this.lineColor,
      edgeDistance: this.edgeDistance,
      maxVelocity: this.maxVelocity,
      springStrength: this.springStrength,
      nodes: this.nodes,
    };

    if (!width || !height || !theme || !themeConfig || !this._canvas) {
      return;
    }

    const themeTuple: [ThemeName, ThemeConfig] = [theme, themeConfig];

    this.field = new Field(width, height, themeTuple, settings, this._canvas);
    this.animation.setRender(this.field.render);
    this.animation.start();

    this.play = true;
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
      } else {
        this.animation.setRender(this.field?.render);
        this.animation?.start();
      }
    }

    if (changedProperties.has('theme')) {
      const { theme } = changedProperties;

      const themeConfig = getThemeConfig();

      if (!themeConfig) return;

      this.field?.setTheme([theme, themeConfig]);
      this.field?.draw();
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
      this.animation.setRender(this.field?.render);
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
      this.animation.setRender(this.field?.render);
      this.animation?.start();
    } else if (changedProperties.has('density')) {
      this.animation?.stop();
      this.field?.updateSettings({
        density: this.density,
      });
      this.field?.updateParticles();
      this.animation.setRender(this.field?.render);
      this.animation?.start();
    } else if (changedProperties.has('nodes')) {
      this.animation?.stop();
      this.field?.updateSettings({
        nodes: this.nodes,
      });
      this.field?.updateParticles();
      this.animation.setRender(this.field?.render);
      this.animation?.start();
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
