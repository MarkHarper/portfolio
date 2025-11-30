import { useCallback, useMemo } from 'react';
import '@awesome.me/webawesome/dist/components/slider/slider.js';
import { scaleLinear } from 'd3-scale';

import { useViz, useVizDispatch } from '~/services/contexts/viz';

const MAX_SPEED = 2;
const MIN_SPEED = 0.1;
const SPEED_RANGE = [MIN_SPEED, MAX_SPEED];

const MAX_SLIDER = 40;
const MIN_SLIDER = 1;
const SLIDER_RANGE = [MIN_SLIDER, MAX_SLIDER];

const speedScale = scaleLinear().domain(SPEED_RANGE).range(SLIDER_RANGE);
const toSliderVal = (density: number) => +speedScale(density).toFixed(1);

const fromSliderVal = (density: number) =>
  +speedScale.invert(density).toFixed(5);

const SpeedSlider = ({ id }: { id: number }) => {
  const { nodes } = useViz();
  const dispatch = useVizDispatch();
  const { speed } = nodes.get(id);

  const sliderVal = useMemo(() => toSliderVal(speed), [speed]);

  const onChange = useCallback(
    (e) => {
      dispatch({
        type: 'nodeSpeed',
        id,
        speed: fromSliderVal(e.target.value),
      });
    },
    [dispatch, id],
  );

  return (
    <wa-slider
      label='Initial Speed'
      name='speed'
      value={sliderVal}
      min={MIN_SLIDER}
      max={MAX_SLIDER}
      step={1}
      onchange={onChange}
    ></wa-slider>
  );
};

export default SpeedSlider;
