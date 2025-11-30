import '@awesome.me/webawesome/dist/components/slider/slider.js';
import { useCallback } from 'react';
import { useViz, useVizDispatch } from '~/services/contexts/viz';

const MIN_RADIUS = 1;
const MAX_RADIUS = 20;

const RadiusSlider = ({ id }: { id: number }) => {
  const { nodes } = useViz();
  const dispatch = useVizDispatch();
  const { radius } = nodes.get(id);

  const onChange = useCallback(
    (e) => {
      dispatch({
        type: 'nodeRadius',
        id,
        radius: e.target.value,
      });
    },
    [dispatch, id],
  );

  return (
    <wa-slider
      label='Radius'
      name='radius'
      value={radius}
      min={MIN_RADIUS}
      max={MAX_RADIUS}
      step={1}
      onchange={onChange}
    ></wa-slider>
  );
};

export default RadiusSlider;
