import { Sizes } from '~/types/variant';
import { useSize } from '~/services/contexts/size';

import PlayButton from '../PlayButton';
import ThemeToggle from '../ThemeToggle';
import RestartButton from '../RestartButton';
import './styles.css';

const ControlsList = () => {
  const {
    size: { isBelowBreakpoint1 },
  } = useSize();
  const iconSize = isBelowBreakpoint1 ? Sizes.XL : Sizes.MD;
  const ControlDivider = (
    <wa-divider
      class='control-divider'
      vertical={isBelowBreakpoint1}
    ></wa-divider>
  );

  return (
    <div className='controls-list' onClick={(e) => e.stopPropagation()}>
      <ThemeToggle className='theme-toggle' iconSize={iconSize} />
      {ControlDivider}
      <PlayButton className='play-button' iconSize={iconSize} />
      {ControlDivider}
      <RestartButton className='restart-button' iconSize={iconSize} />
    </div>
  );
};

export default ControlsList;
