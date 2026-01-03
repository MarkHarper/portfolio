import '@awesome.me/webawesome/dist/components/slider/slider.js';
import { useCallback } from 'react';
import { useViz, useVizDispatch } from '~/services/contexts/viz';

const EdgeDistanceSlider = () => {
  const { edgeDistance } = useViz();
  const dispatch = useVizDispatch();

  const onChange = useCallback(
    (e) => {
      dispatch({
        type: 'edgeDistance',
        edgeDistance: Number(e.target.value),
      });
    },
    [dispatch],
  );

  return (
    <wa-slider
      label='Edge distance'
      name='edgeDistance'
      value={edgeDistance}
      min={50}
      max={500}
      step={5}
      onchange={onChange}
    ></wa-slider>
  );
};

export default EdgeDistanceSlider;
