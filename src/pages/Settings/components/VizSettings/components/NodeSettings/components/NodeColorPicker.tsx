import '@awesome.me/webawesome/dist/components/color-picker/color-picker.js';
import { useCallback } from 'react';
import { useViz, useVizDispatch } from '~/services/contexts/viz';

const NodeColorPicker = ({ id }: { id: string }) => {
  const { nodes } = useViz();
  const dispatch = useVizDispatch();
  const { color } = nodes.get(id);

  const onChange = useCallback(
    (e) => {
      dispatch({
        type: 'nodeColor',
        id,
        color: e.target.value,
      });
    },
    [dispatch, id],
  );

  return (
    <wa-color-picker
      label='Node Color'
      format='rgb'
      size='small'
      value={color}
      onchange={onChange}
    ></wa-color-picker>
  );
};

export default NodeColorPicker;
