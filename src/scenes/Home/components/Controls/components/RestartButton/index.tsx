import { faArrowRotateRight } from '@fortawesome/pro-solid-svg-icons';

import { Size, Variants } from '~/types/variant';
import { useViz } from '~/services/contexts/viz';
import IconButton from '~/components/IconButton';

type Props = {
  className?: string;
  iconSize: Size;
};

const RestartButton = ({
  className = '',
  iconSize,
}: Props): JSX.Element | null => {
  const { viz, restart } = useViz();
  if (!viz) return null;

  return (
    <IconButton
      variant={Variants.GHOST}
      icon={faArrowRotateRight}
      title='Restart'
      iconSize={iconSize}
      onClick={restart}
      className={className}
      disabled={!!viz.isRunning}
    />
  );
};

export default RestartButton;
