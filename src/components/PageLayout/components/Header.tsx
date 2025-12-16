import { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router';

import '@awesome.me/webawesome/dist/components/popover/popover.js';
import '@awesome.me/webawesome/dist/components/button/button.js';
import '@awesome.me/webawesome/dist/components/icon/icon.js';

import { BLURB, TAG_LINE } from '~/services/content';

import '~/elements/graph-canvas';
import ThemeToggle from './ThemeToggle';

const Header = () => {
  const popover = useRef<HTMLElement>(null);
  const location = useLocation();

  useEffect(() => {
    if (popover.current && location.pathname === '/') {
      popover.current.show();
    }
  }, []);

  return (
    <header slot='header' className='header wa-split wa-glass'>
      <div className='wa-split'>
        <div>
          <wa-popover for='name-button' placement='bottom-start' ref={popover}>
            <div>{TAG_LINE}</div>
            <div>{BLURB}</div>
          </wa-popover>
          <wa-button id='name-button' variant='brand' appearance='plain'>
            Mark Harper
          </wa-button>
        </div>
        <div>
          <Link to='/about'>
            <wa-button appearance='plain'>About</wa-button>
          </Link>
          <Link to='/work'>
            <wa-button appearance='plain'>Work</wa-button>
          </Link>
        </div>
        <div className='wa-align-items-center wa-gap-2xs'>
          <Link to='/themes'>
            <wa-button appearance='plain' size='small' pill>
              <wa-icon name='palette'></wa-icon>
            </wa-button>
          </Link>
          <Link to='/settings'>
            <wa-button appearance='plain' size='small' pill>
              <wa-icon name='gear'></wa-icon>
            </wa-button>
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
