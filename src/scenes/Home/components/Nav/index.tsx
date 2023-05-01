import { useCallback, useRef } from 'react';
import Header from '~/components/Header';
import Heading from '~/components/Heading';
import Popup from '~/components/Popup';
import { useSize } from '~/services/contexts/size';
import { noop } from '~/types/effect';
import { Sizes, Variants } from '~/types/variant';
import InfoNav from './components/InfoNav';
import './styles.css';

const NAV_POPUP_POSITION = {
  top: 'calc(100% + 0.5rem)',
};

const Nav = () => {
  const headingRef = useRef<HTMLDivElement>(null);
  const {
    size: { isBelowBreakpoint2 },
  } = useSize();

  const addTextShadow = useCallback(() => {
    if (headingRef?.current) {
      headingRef.current.setAttribute(
        'style',
        'text-shadow: 0 0 10px var(--accent-color);',
      );
    }
  }, [headingRef]);

  const showOnlyShadow = useCallback(() => {
    if (headingRef?.current) {
      headingRef.current.setAttribute(
        'style',
        `
        transition: text-shadow ease-out 0.2s, -webkit-text-fill-color ease-in 0.2s;
        text-shadow: 0 0 5px var(--canvas-text);
        -webkit-text-fill-color: transparent;
      `,
      );
    }
  }, [headingRef]);

  const removeCustomStyle = useCallback(() => {
    if (headingRef?.current) {
      headingRef.current.setAttribute(
        'style',
        'transition: text-shadow ease-in 0.3s, -webkit-text-fill-color ease-out 0.3s;',
      );
    }
  }, [headingRef]);

  return (
    <Header>
      <Popup
        Tooltip={InfoNav}
        Trigger={({ isOpen, toggleIsOpen }) => (
          <Heading
            variant={Variants.ACCENT}
            className='blend-white'
            size={isBelowBreakpoint2 ? Sizes.LG : Sizes.XL}
            onClick={toggleIsOpen}
            onMouseEnter={!isOpen ? removeCustomStyle : noop}
            onMouseDown={!isOpen ? removeCustomStyle : noop}
            ref={headingRef}
          >
            Mark Harper
          </Heading>
        )}
        initialIsOpen={true}
        reopenOnHover={true}
        tooltipClass='nav-info-tooltip blend-primary'
        position={NAV_POPUP_POSITION}
        onClose={showOnlyShadow}
        onMouseDownClose={addTextShadow}
      />
    </Header>
  );
};

export default Nav;
