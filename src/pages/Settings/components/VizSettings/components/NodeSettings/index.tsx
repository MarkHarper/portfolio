import '@awesome.me/webawesome/dist/components/card/card.js';
import '@awesome.me/webawesome/dist/components/button/button.js';
import '@awesome.me/webawesome/dist/components/icon/icon.js';

import NodeColorPicker from './components/NodeColorPicker';
import MassSlider from './components/MassSlider';
import RadiusSlider from './components/RadiusSlider';
import SpeedSlider from './components/SpeedSlider';
import { useVizDispatch } from '~/services/contexts/viz';
import { useCallback } from 'react';

const NodeSettings = ({ id }: { id: string }) => {
  const dispatch = useVizDispatch();
  const deleteNodeSetting = useCallback(
    () =>
      dispatch({
        type: 'deleteNodeSetting',
        id,
      }),
    [id, dispatch],
  );

  return (
    <wa-card class='card-header'>
      <div slot='header'></div>
      <div slot='header-actions'>
        <wa-button appearance='plain' onclick={deleteNodeSetting}>
          <wa-icon name='trash'></wa-icon>
        </wa-button>
      </div>
      <div className='wa-grid wa-gap-xl'>
        <NodeColorPicker id={id} />
        <MassSlider id={id} />
        <RadiusSlider id={id} />
        <SpeedSlider id={id} />
      </div>
    </wa-card>
  );
};

export default NodeSettings;
