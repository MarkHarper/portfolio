import { useState } from 'react';
import { useSize } from '~/services/contexts/size';
import { useVisualization } from '~/services/visualization';

import './styles.css';

const Canvas = () => {
  const {
    size: { width, height },
  } = useSize();
  const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null);
  useVisualization(canvasRef);

  return (
    <canvas
      ref={(canvas) => setCanvasRef(canvas)}
      id='viz-home'
      height={height?.toString()}
      width={width?.toString()}
    />
  );
};

export default Canvas;
