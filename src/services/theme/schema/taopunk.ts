import { Schema, Struct } from 'effect';

const GENERAL_VAR_NAMES = [
  '--wa-border-radius-scale',
  '--wa-space-scale',
  '--wa-border-width-scale',
] as const;

const SEMANTIC_COLOR_NAMES = [
  '--color-item-A',
  '--color-item-B',
  '--color-item-C',
  '--color-item-D',
] as const;

const TaoPunkVars = Schema.Struct({
  // general
  '--wa-border-radius-scale': Schema.NumberFromString,
  '--wa-space-scale': Schema.NumberFromString,
  '--wa-border-width-scale': Schema.NumberFromString,

  // fonts
  // '--wa-font-family-heading': Schema.Union(Schema.Literal('')),
  // '--wa-font-weight-heading': Schema.Union(Schema.Literal('')),

  // palette
  '--color-item-A': Schema.String,
  '--color-item-B': Schema.String,
  '--color-item-C': Schema.String,
  '--color-item-D': Schema.String,
});

export type TTaoPunkVars = Schema.Type<typeof TaoPunkVars>;

export const TaopunkVarsGrouped = Schema.Struct({
  general: Schema.Struct({
    '--wa-border-radius-scale': Schema.Number,
    '--wa-space-scale': Schema.Number,
    '--wa-border-width-scale': Schema.Number,
  }),

  semanticColors: Schema.Struct({
    '--color-item-A': Schema.String,
    '--color-item-B': Schema.String,
    '--color-item-C': Schema.String,
    '--color-item-D': Schema.String,
  }),
});

export type TTaopunkVarsGrouped = Schema.Type<typeof TaopunkVarsGrouped>;

export const TaopunkSchema = Schema.transform(TaoPunkVars, TaopunkVarsGrouped, {
  strict: true,
  decode: (inputVars) => ({
    general: Struct.pick(inputVars, ...GENERAL_VAR_NAMES),
    colors: Struct.pick(inputVars, ...SEMANTIC_COLOR_NAMES),
  }),
  encode: (outputGroups) => ({
    ...outputGroups.general,
  }),
});

export const parseTaopunkVars = Schema.decodeUnknown(TaoPunkVars);
export const encodeTaopunkVars = Schema.encode(TaoPunkVars);
