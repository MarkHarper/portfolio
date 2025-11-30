import '@awesome.me/webawesome/dist/components/color-picker/color-picker.js';
import { useCallback } from 'react';
import { useViz, useVizDispatch } from '~/services/contexts/viz';

const LineColorPicker = () => {
  const { lineColor } = useViz();
  const dispatch = useVizDispatch();

  const onChange = useCallback(
    (e) => {
      dispatch({
        type: 'lineColor',
        lineColor: e.target.value,
      });
    },
    [dispatch],
  );

  return (
    <wa-color-picker
      label='Line Color'
      format='hex'
      size='small'
      value={lineColor}
      onchange={onChange}
    ></wa-color-picker>
  );
};

export default LineColorPicker;
