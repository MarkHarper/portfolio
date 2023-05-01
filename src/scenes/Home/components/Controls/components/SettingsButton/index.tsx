import { faCog, faX } from '@fortawesome/pro-solid-svg-icons';
import IconButton from '~/components/IconButton';
import { Variants } from '~/types/variant';
import './styles.css';

type Props = {
  isOpen: boolean;
  toggleIsOpen: () => void;
};

const SettingsButton = ({ isOpen, toggleIsOpen }: Props): JSX.Element => (
  <IconButton
    variant={Variants.ACCENT}
    icon={isOpen ? faX : faCog}
    onClick={() => toggleIsOpen()}
    className='settings-button'
  />
);

export default SettingsButton;
