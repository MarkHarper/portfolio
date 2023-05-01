import { Sizes } from '~/types/variant';
import { useSize } from '~/services/contexts/size';
import Divider, { Orientations } from '~/components/Divider';

import PlayButton from '../PlayButton';
import ThemeToggle from '../ThemeToggle';
import './styles.css';
import RestartButton from '../RestartButton';

const ControlsList = () => {
  const {
    size: { isBelowBreakpoint1 },
  } = useSize();
  const iconSize = isBelowBreakpoint1 ? Sizes.LG : Sizes.MD;
  const ControlDivider = (
    <Divider
      className='control-divider'
      orientation={
        isBelowBreakpoint1 ? Orientations.VERTICAL : Orientations.HORIZONTAL
      }
    />
  );

  return (
    <div className='controls-list'>
      <ThemeToggle className='theme-toggle' iconSize={iconSize} />
      {ControlDivider}
      <PlayButton className='play-button' iconSize={iconSize} />
      {ControlDivider}
      <RestartButton className='restart-button' iconSize={iconSize} />
    </div>
  );
};

export default ControlsList;
