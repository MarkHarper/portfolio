import { useCallback, useMemo } from 'react';
import '@awesome.me/webawesome/dist/components/slider/slider.js';
import { scaleLinear } from 'd3-scale';

import { useViz, useVizDispatch } from '~/services/contexts/viz';

const MAX_VELOCITY = 10;
const MIN_VELOCITY = 0.5;
const VELOCITY_RANGE = [MIN_VELOCITY, MAX_VELOCITY];

const MAX_SLIDER = 100;
const MIN_SLIDER = 1;
const SLIDER_RANGE = [MIN_SLIDER, MAX_SLIDER];

const velocityScale = scaleLinear().domain(VELOCITY_RANGE).range(SLIDER_RANGE);
const toSliderVal = (maxVelocity: number) =>
  +velocityScale(maxVelocity).toFixed(1);

const fromSliderVal = (maxVelocity: number) =>
  +velocityScale.invert(maxVelocity).toFixed(2);

const MaxVelocitySlider = () => {
  const { maxVelocity } = useViz();
  const dispatch = useVizDispatch();
  const sliderVal = useMemo(() => toSliderVal(maxVelocity), [maxVelocity]);

  const onChange = useCallback(
    (e) => {
      dispatch({
        type: 'maxVelocity',
        maxVelocity: fromSliderVal(e.target.value),
      });
    },
    [dispatch],
  );

  return (
    <wa-slider
      label='Max Velocity'
      name='maxVelocity'
      value={sliderVal}
      min={MIN_SLIDER}
      max={MAX_SLIDER}
      step={1}
      onchange={onChange}
    ></wa-slider>
  );
};

export default MaxVelocitySlider;
