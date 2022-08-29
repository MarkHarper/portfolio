import { DataPoint, Vector2dDifference } from "../types";

// rv: relative velocity
// ncv: normalized collision vector
export const speed = (rv: Vector2dDifference, ncv: DataPoint): number =>
  rv.dvx * ncv.x + rv.dvy * ncv.y;
