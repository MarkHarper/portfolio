import React from 'react';
import { LitElement, css, html } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { getThemeConfig } from '~/services/theme';
import type { ThemeConfig, ThemeName } from '~/services/theme/config';
import { Runner } from '~/services/visualization/runner';
import { Field } from '~/services/visualization/field';

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

  @query('#graph-canvas')
  _canvas?: HTMLCanvasElement;

  @property({ attribute: 'data-theme', reflect: true })
  theme?: ThemeName = undefined;

  @property({ type: Number, attribute: 'data-width', reflect: true })
  width?: number = undefined;

  @property({ type: Number, attribute: 'data-height', reflect: true })
  height?: number = undefined;

  @property()
  isRunning: boolean = false;

  @state()
  private _field?: Field = undefined;

  @state()
  private _runner?: Runner = undefined;

  _init() {
    const { width, height, theme } = this;
    const themeConfig = getThemeConfig();

    if (!width || !height || !theme || !themeConfig || !this._canvas) {
      return;
    }

    const themeTuple: [ThemeName, ThemeConfig] = [theme, themeConfig];
    const field = new Field(width, height, themeTuple);
    const runner = new Runner(this._canvas, field, width, height);

    runner.start(width, height);

    this._field = field;
    this._runner = runner;
    this.isRunning = true;
  }

  connectedCallback() {
    super.connectedCallback();

    this._init();
  }

  updated(changedProperties) {
    if (!this._runner) {
      this._init();
    }

    if (changedProperties.has('height') || changedProperties.has('width')) {
      const { width, height } = changedProperties;
      const nextWidth = width ?? this.width;
      const nextHeight = height ?? this.height;

      this._runner.stop();
      this._field.setDimensions(nextWidth, nextHeight);
      this._runner.setDimensions(nextWidth, nextHeight);

      if (this.isRunning) {
        this._runner.start(nextWidth, nextHeight);
      } else {
        this._runner.draw();
      }
    }

    if (changedProperties.has('theme')) {
      const { theme } = changedProperties;

      const themeConfig = getThemeConfig(theme);
      this._field.setTheme([theme, themeConfig]);
      this._runner.draw();
    }
  }

  render() {
    return html`<canvas id="graph-canvas" />`;
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
