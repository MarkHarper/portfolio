import { Size } from '~/types/variant';
import { useViz } from '~/services/contexts/viz';

type Props = {
  className?: string;
  iconSize: Size;
};

const RestartButton = ({ className = '', iconSize }: Props) => {
  const { viz, restart } = useViz();
  if (!viz) return null;

  return (
    <wa-icon-button
      family='fontawesome'
      name='arrow-rotate-right'
      iconSize={iconSize}
      onClick={restart}
      class={className}
      disabled={!!viz.isRunning}
    ></wa-icon-button>
  );
};

export default RestartButton;
