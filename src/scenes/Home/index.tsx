import { useContext, useState } from 'react';
import { SizingContext } from '../../services/contexts/size';
import { useVisualization } from '../../services/visualization';
import Nav from '../../components/Nav';
import Controls from '../../components/Controls';
import './styles.css';

const Home = () => {
  const {
    size: { width, height },
  } = useContext(SizingContext);
  const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null);
  useVisualization(canvasRef);

  return (
    <>
      <canvas
        ref={(canvas) => setCanvasRef(canvas)}
        id='viz-home'
        height={height?.toString()}
        width={width?.toString()}
      />
      <Nav />
      <Controls />
    </>
  );
};

export default Home;
