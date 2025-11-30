import '@awesome.me/webawesome/dist/components/slider/slider.js';
import { useCallback, useMemo } from 'react';
import { useViz, useVizDispatch } from '~/services/contexts/viz';

const toSliderVal = (density: number) => +(density * 10000).toFixed(1);
const fromSliderVal = (density: number) => +(density / 10000).toFixed(5);

const DensitySlider = () => {
  const { density } = useViz();
  const dispatch = useVizDispatch();
  const sliderVal = useMemo(() => toSliderVal(density), [density]);

  const onChange = useCallback(
    (e) => {
      dispatch({
        type: 'density',
        density: fromSliderVal(e.target.value),
      });
    },
    [dispatch],
  );

  return (
    <wa-slider
      label='Density'
      name='density'
      value={sliderVal}
      min={1}
      max={10}
      step={0.5}
      onchange={onChange}
    ></wa-slider>
  );
};

export default DensitySlider;
