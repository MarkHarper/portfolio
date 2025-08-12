import { useState, useRef } from 'react';
import { useSize } from '~/services/contexts/size';
import ControlsList from './components/ControlsList';
import './styles.css';

const Controls = () => {
  const {
    size: { isBelowBreakpoint1 },
  } = useSize();
  const dropdownRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  if (isBelowBreakpoint1) {
    return <ControlsList />;
  }

  return (
    <div className='controls'>
      <wa-dropdown
        placement='top'
        distance={4}
        stayOpenOnSelect
        onMouseOver={() => {
          if (dropdownRef.current && !dropdownRef.current.open) {
            setIsOpen(true);
            dropdownRef.current.show();
          }
        }}
        onClick={() => setIsOpen(!isOpen)}
        ref={dropdownRef}
      >
        <wa-icon-button
          slot='trigger'
          class='settings-button'
          appearance='accent'
          name={isOpen ? 'x' : 'cog'}
        ></wa-icon-button>
        <ControlsList />
      </wa-dropdown>
    </div>
  );
};

export default Controls;
