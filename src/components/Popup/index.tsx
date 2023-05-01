import { FC, useState } from 'react';
import { faXmark } from '@fortawesome/pro-solid-svg-icons';

import { ReactSetter, RenderChild } from '~/types/react';
import { Sizes, Variants } from '~/types/variant';
import { noop } from '~/types/effect';
import Absolute, { Position } from '../Absolute';
import IconButton from '../IconButton';
import './styles.css';

type PopupHelpers = {
  setIsOpen: ReactSetter<boolean>;
  toggleIsOpen: () => void;
  isOpen: boolean;
};

type Props = {
  initialIsOpen?: boolean;
  tooltipClass?: string;
  onClose?: () => void;
  onMouseDownClose?: () => void;
  Tooltip?: FC;
  Trigger: RenderChild<PopupHelpers>;
  reopenOnHover?: boolean;
  position?: Position;
  useCloseButton?: boolean;
  className?: string;
};

const Popup = ({
  Tooltip,
  Trigger,
  reopenOnHover,
  onClose,
  onMouseDownClose,
  position,
  className = '',
  tooltipClass = '',
  initialIsOpen = false,
  useCloseButton = true,
}: Props): JSX.Element => {
  const [isOpen, setIsOpen] = useState<boolean>(initialIsOpen);
  const onHover = () => {
    if (!reopenOnHover) return;

    if (!isOpen) {
      setIsOpen(true);
    }
  };
  const close = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };
  const toggleIsOpen = () => setIsOpen(!isOpen);

  return (
    <div
      className={`container ${className}`}
      onMouseEnter={onHover}
      onFocus={onHover}
    >
      <Absolute
        El='div'
        className={`tooltip ${tooltipClass} ${isOpen ? 'open' : ''}`}
        {...position}
      >
        {!!useCloseButton && (
          <IconButton
            variant={Variants.GHOST}
            className='close'
            onClick={close}
            onMouseDown={onMouseDownClose ? onMouseDownClose : noop}
            icon={faXmark}
            iconSize={Sizes.LG}
          />
        )}
        {Tooltip && <Tooltip />}
      </Absolute>
      <Trigger
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        toggleIsOpen={toggleIsOpen}
      />
    </div>
  );
};

export default Popup;
