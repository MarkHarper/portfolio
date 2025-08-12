import { useEffect } from 'react';
import preloadWaElements from './waPreload';

const WaPreloader = () => {
  useEffect(() => {
    preloadWaElements();
  }, []);

  return null;
};

export default WaPreloader;
