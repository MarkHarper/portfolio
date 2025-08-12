import { useCallback, useRef } from 'react';

import { noop } from '~/types/effect';
import Text from '~/components/Text';
import Link from '~/components/Link';
import { useSize } from '~/services/contexts/size';
import { BLURB, TAG_LINE } from '~/services/content';
import { Sizes, Variants } from '~/types/variant';
import './styles.css';

const Nav = () => {
  const headingRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef(null);
  const {
    size: { isBelowBreakpoint2 },
  } = useSize();

  const addTextShadow = useCallback(() => {
    if (headingRef?.current) {
      headingRef.current.classList.add('enter-shadow');
      headingRef.current.classList.remove('show-shadow');
      headingRef.current.classList.remove('exit-shadow');
    }
  }, [headingRef]);

  const showOnlyShadow = useCallback(() => {
    if (headingRef?.current) {
      headingRef.current.classList.remove('enter-shadow');
      headingRef.current.classList.add('show-shadow');
      headingRef.current.classList.remove('exit-shadow');
    }
  }, [headingRef]);

  const removeCustomStyle = useCallback(() => {
    if (headingRef?.current) {
      headingRef.current.classList.remove('enter-shadow');
      headingRef.current.classList.remove('show-shadow');
      headingRef.current.classList.add('exit-shadow');
    }
  }, [headingRef]);

  // TODO need to properly set isOpen on load
  // currently it is undefined
  const isOpen = tooltipRef.current?.getAttribute('open');
  return (
    <header>
      <wa-dropdown
        class='nav-info-tooltip'
        placement='bottom'
        distance={8}
        trigger='manual'
        onwa-after-hide={showOnlyShadow}
        ref={tooltipRef}
        sync='width'
        open={true}
      >
        <Text
          slot='trigger'
          variant={Variants.ACCENT}
          className='header blend-header'
          size={isBelowBreakpoint2 ? Sizes.LG : Sizes.XL}
          onMouseEnter={!isOpen ? removeCustomStyle : noop}
          onMouseDown={!isOpen ? removeCustomStyle : noop}
          onMouseOver={() => !isOpen && tooltipRef.current?.show()}
          ref={headingRef}
        >
          Mark Harper
        </Text>
        <wa-menu class='tooltip-menu'>
          {' '}
          <div className='nav-info-tooltip-content'>
            <Text className='tagline'>{TAG_LINE}</Text>
            <p className='details'>
              {BLURB} To learn more about me, check out my{' '}
              <Link to='/resume.pdf' external>
                resume
              </Link>
              .
            </p>
          </div>
          <wa-icon-button
            class='nav-info-tooltip-close'
            appearance='plain'
            onMouseDown={addTextShadow}
            onClick={() => tooltipRef.current?.hide()}
            family='solid'
            name='xmark'
          ></wa-icon-button>
        </wa-menu>
      </wa-dropdown>
    </header>
  );
};

export default Nav;
