import { describe, expect, test } from 'vitest';

import { handleCollision } from './collision';
import { dimensionDistance } from './distance';

const testDataA = {
  p1: {
    x: 1,
    y: 1,
    vx: 1,
    vy: 1,
    radius: 1.1,
    mass: 3,
  },
  p2: {
    x: 2,
    y: 2,
    vx: 1,
    vy: 1,
    radius: 1.1,
    mass: 2,
  },
};

const expectedA = {
  p1: {
    vx: 0.999,
    vy: 0.999,
    x: 1.999,
    y: 1.999,
  },
  p2: {
    vx: 0.999,
    vy: 0.999,
    x: 2.999,
    y: 2.999,
  },
};

describe('Collision Detection', () => {
  test('calculates the result of a collision', () => {
    const { p1, p2 } = testDataA;
    const { dx, dy } = dimensionDistance(p1, p2);
    const res = handleCollision(p1, p2, dx, dy);

    expect(res).toStrictEqual(expectedA);
  });
});
