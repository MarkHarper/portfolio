import { useCallback, useMemo } from 'react';
import '@awesome.me/webawesome/dist/components/button/button.js';

import { useViz, useVizDispatch } from '~/services/contexts/viz';
import { getTokens } from '~/services/theme/html';
import {
  LARGE_MASS,
  LARGE_RADIUS,
} from '~/services/visualization/field/constants';

import NodeSettings from './NodeSettings';

export const NodeList = () => {
  const context = useViz();
  const dispatch = useVizDispatch();
  const nodesArr = Array.from(context?.nodes?.values() || []);
  const tokens = useMemo(() => getTokens(), []);

  const addNodeType = useCallback(
    () =>
      dispatch({
        type: 'addNodeSetting',
        nodeSetting: {
          color: tokens['--color-item-A'],
          mass: LARGE_MASS,
          radius: LARGE_RADIUS,
          speed: 0.5,
        },
      }),
    [dispatch, tokens],
  );

  if (!context?.nodes) return null;

  return (
    <div className='wa-stack'>
      <wa-button onclick={addNodeType}>Add Node Type</wa-button>
      <div className='wa-stack'>
        {nodesArr.map((n, i) => (
          <NodeSettings key={n.id} id={n.id} />
        ))}
      </div>
    </div>
  );
};
