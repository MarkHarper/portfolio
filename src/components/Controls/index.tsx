import { FC, useContext } from 'react';
import { faPause, faPlay } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { VizContext } from '../../services/contexts/viz';
import './styles.css';

interface Props {
  onPlayToggle?: () => void;
}

const Controls: FC<Props> = () => {
  const { viz, setViz } = useContext(VizContext);
  const { isRunning } = viz || {};
  if (!viz) return null;
  const toggle = () => {
    if (!viz) return;
    if (viz.runner.running) {
      viz.runner.stop();
      setViz({
        ...viz,
        isRunning: false,
      });
      return;
    }

    viz.runner.start();
    setViz({
      ...viz,
      isRunning: true,
    });
  };

  return (
    <div className='controls'>
      <button className='btn-control' onClick={toggle}>
        <FontAwesomeIcon size='lg' icon={isRunning ? faPause : faPlay} />
      </button>
    </div>
  );
};

export default Controls;
