import { faPause, faPlay } from '@fortawesome/pro-solid-svg-icons';

import { Size, Variants } from '~/types/variant';
import { useViz } from '~/services/contexts/viz';
import IconButton from '~/components/IconButton';
import './styles.css';

type Props = {
  className?: string;
  iconSize: Size;
};

const PlayButton = ({
  className = '',
  iconSize,
}: Props): JSX.Element | null => {
  const { viz, toggle } = useViz();
  const { isRunning } = viz || {};
  if (!viz) return null;

  return (
    <IconButton
      variant={Variants.GHOST}
      icon={isRunning ? faPause : faPlay}
      title={isRunning ? 'Pause' : 'Play'}
      iconSize={iconSize}
      onClick={toggle}
      className={`${className} ${!isRunning ? 'play-icon' : ''}`}
    />
  );
};

export default PlayButton;
