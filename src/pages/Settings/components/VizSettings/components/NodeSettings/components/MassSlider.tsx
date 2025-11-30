import { useCallback, useMemo } from 'react';
import '@awesome.me/webawesome/dist/components/slider/slider.js';
import { scaleLinear } from 'd3-scale';

import { useViz, useVizDispatch } from '~/services/contexts/viz';

const MAX_MASS = 10;
const MIN_MASS = 0.1;
const MASS_RANGE = [MIN_MASS, MAX_MASS];

const MAX_SLIDER = 20;
const MIN_SLIDER = 1;
const SLIDER_RANGE = [MIN_SLIDER, MAX_SLIDER];

const massScale = scaleLinear().domain(MASS_RANGE).range(SLIDER_RANGE);
const toSliderVal = (density: number) => +massScale(density).toFixed(1);

const fromSliderVal = (density: number) =>
  +massScale.invert(density).toFixed(5);

const MassSlider = ({ id }: { id: string }) => {
  const { nodes } = useViz();
  const dispatch = useVizDispatch();
  const { mass } = nodes.get(id);

  const sliderVal = useMemo(() => toSliderVal(mass), [mass]);

  const onChange = useCallback(
    (e) => {
      dispatch({
        type: 'nodeMass',
        id,
        mass: fromSliderVal(e.target.value),
      });
    },
    [dispatch, id],
  );

  return (
    <wa-slider
      label='Mass'
      name='mass'
      value={sliderVal}
      min={MIN_SLIDER}
      max={MAX_SLIDER}
      step={1}
      onchange={onChange}
    ></wa-slider>
  );
};

export default MassSlider;
