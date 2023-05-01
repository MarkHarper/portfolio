import { useSize } from '~/services/contexts/size';
import Popup from '~/components/Popup';
import SettingsButton from './components/SettingsButton';
import ControlsList from './components/ControlsList';
import './styles.css';

const CONTROLS_POSITION = {
  bottom: 'calc(100% + 0.5rem)',
  right: true,
};

const Controls = (): JSX.Element => {
  const {
    size: { isBelowBreakpoint1 },
  } = useSize();

  if (isBelowBreakpoint1) {
    return <ControlsList />;
  }

  return (
    <div className='controls'>
      <Popup
        Tooltip={() => <ControlsList />}
        Trigger={SettingsButton}
        initialIsOpen={false}
        useCloseButton={false}
        reopenOnHover={true}
        position={CONTROLS_POSITION}
      />
    </div>
  );
};

export default Controls;
