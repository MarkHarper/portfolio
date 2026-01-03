import { useCallback, useMemo } from 'react';
import '@awesome.me/webawesome/dist/components/slider/slider.js';
import { scaleLinear } from 'd3-scale';

import { useViz, useVizDispatch } from '~/services/contexts/viz';

const MAX_SPRING = 0.1;
const MIN_SPRING = 0.01;
const SPRING_RANGE = [MIN_SPRING, MAX_SPRING];

const MAX_SLIDER = 1000;
const MIN_SLIDER = 1;
const SLIDER_RANGE = [MIN_SLIDER, MAX_SLIDER];

const springScale = scaleLinear().domain(SPRING_RANGE).range(SLIDER_RANGE);
const toSliderVal = (spring: number) => +springScale(spring).toFixed(1);

const fromSliderVal = (spring: number) =>
  +springScale.invert(spring).toFixed(5);

const SpringStrengthSlider = () => {
  const { springStrength } = useViz();
  const dispatch = useVizDispatch();

  const sliderVal = useMemo(
    () => toSliderVal(springStrength),
    [springStrength],
  );

  const onChange = useCallback(
    (e) => {
      dispatch({
        type: 'springStrength',
        springStrength: fromSliderVal(e.target.value),
      });
    },
    [dispatch],
  );

  return (
    <wa-slider
      label='Spring Strength'
      name='springStrength'
      value={sliderVal}
      min={MIN_SLIDER}
      max={MAX_SLIDER}
      step={0.5}
      onchange={onChange}
    ></wa-slider>
  );
};

export default SpringStrengthSlider;
