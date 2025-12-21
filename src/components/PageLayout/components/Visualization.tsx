import { useEffect, useRef } from 'react';
import '~/elements/graph-canvas';

import { useSize } from '~/services/contexts/size';
import { useViz } from '~/services/contexts/viz';

const Visualization = () => {
  const {
    size: { width, height },
  } = useSize();
  const settings = useViz();
  const ref = useRef();

  useEffect(() => {
    if (!ref.current || !settings?.nodes) return;

    ref.current.nodes = settings?.nodes;
  }, [settings?.nodes]);

  if (!settings || !settings.nodes) return null;

  const {
    density,
    lineColor,
    maxVelocity,
    edgeDistance,
    springStrength,
    isRunning,
  } = settings;

  return (
    <>
      <graph-canvas
        ref={ref}
        className='viz-home'
        data-width={width}
        data-height={height}
        data-density={density}
        data-line-color={lineColor}
        data-max-velocity={maxVelocity}
        data-edge-distance={edgeDistance}
        data-spring-strength={springStrength}
        data-play={isRunning}
        data-show-fps={true}
      ></graph-canvas>
    </>
  );
};

export default Visualization;
