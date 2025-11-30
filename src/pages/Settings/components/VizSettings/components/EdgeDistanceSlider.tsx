import '@awesome.me/webawesome/dist/components/slider/slider.js';
import { useCallback, useMemo } from 'react';
import { useViz, useVizDispatch } from '~/services/contexts/viz';

const toSliderVal = (edgeDistance: number) =>
  +Math.sqrt(edgeDistance).toFixed(0);
const fromSliderVal = (edgeDistance: number) =>
  +(edgeDistance * edgeDistance).toFixed(0);

const EdgeDistanceSlider = () => {
  const { edgeDistance } = useViz();
  const dispatch = useVizDispatch();

  const sliderVal = useMemo(() => toSliderVal(edgeDistance), [edgeDistance]);

  const onChange = useCallback(
    (e) => {
      dispatch({
        type: 'edgeDistance',
        edgeDistance: fromSliderVal(e.target.value),
      });
    },
    [dispatch],
  );

  return (
    <wa-slider
      label='Edge distance'
      name='edgeDistance'
      value={sliderVal}
      min={50}
      max={150}
      step={1}
      onchange={onChange}
    ></wa-slider>
  );
};

export default EdgeDistanceSlider;
