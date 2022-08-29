export interface Point {
  x: number;
  y: number;

  setX: (a: number) => void;
  setY: (a: number) => void;
}

export type DataPoint = Omit<Point, "setX" | "setY">;

export interface PointDifference {
  dx: number;
  dy: number;
  directSquared: number;
  direct: number;
}

export interface DataCircle extends DataPoint {
  radius: number;
}

export interface Vector2d {
  vx: number;
  vy: number;

  setVx: (a: number) => void;
  setVy: (a: number) => void;
}

export type DataVector2d = Omit<Vector2d, "setVx" | "setVy">;

export interface Vector2dDifference {
  dvx: number;
  dvy: number;
}

export interface MovingPoint extends Point, Vector2d {}

export type DataMovingPoint = Omit<
  MovingPoint,
  "setX" | "setY" | "setVx" | "setVy"
>;

export interface CircleObject {
  radius: number;
  mass: number;

  setRadius: (a: number) => void;
  setMass: (a: number) => void;
}

export type DataCircleObject = Omit<CircleObject, 'setRadius' | 'setMass'>;

export interface MovingCircleObject extends Point, Vector2d, CircleObject {}

export type DataMovingCircleObject = Omit<
  MovingCircleObject,
  "setX" | "setY" | "setVx" | "setVy" | "setRadius" | "setMass"
>;
