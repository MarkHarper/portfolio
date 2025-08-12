import { Size } from '~/types/variant';
import { useViz } from '~/services/contexts/viz';
import './styles.css';

type Props = {
  className?: string;
  iconSize: Size;
};

const PlayButton = ({ className = '', iconSize }: Props) => {
  const { viz, toggle } = useViz();
  const { isRunning } = viz || {};
  if (!viz) return null;

  return (
    <wa-icon-button
      class={`${className} ${!isRunning ? 'play-icon' : ''}`}
      size={iconSize}
      family='fontawesome'
      name={isRunning ? 'pause' : 'play'}
      onClick={toggle}
    ></wa-icon-button>
  );
};

export default PlayButton;
