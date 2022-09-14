import { useContext, useEffect } from 'react';
import { SizingContext } from '../../services/contexts';
import visualize from '../../services/visualization';
import './styles.css';

const Home = () => {
  const { width, height } = useContext(SizingContext);

  useEffect(() => {
    const canvas = document.getElementById('viz-home') as HTMLCanvasElement;
    if (width == null || height == null || canvas == null) return;

    visualize(width, height, canvas);
  }, [width, height]);

  return <canvas id='viz-home' height={height?.toString()} width={width?.toString()}></canvas>;
};

export default Home;
