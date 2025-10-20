import '@awesome.me/webawesome/dist/components/page/page.js';
import '@awesome.me/webawesome/dist/components/popover/popover.js';

import '~/elements/graph-canvas';
import { BLURB, TAG_LINE } from '~/services/content';
import { useSize } from '~/services/contexts/size';
import { useThemeName } from '~/services/contexts/theme';

import './styles.css';

const DEFAULT_OPEN = true;

const Home = () => {
  const {
    size: { width, height },
  } = useSize();
  const { themeName } = useThemeName();

  return (
    <wa-page>
      <header slot='header' className='wa-split'>
        <div>
          <wa-popover
            for='name-button'
            placement='bottom-start'
            open={DEFAULT_OPEN}
          >
            <div>{TAG_LINE}</div>
            <div>{BLURB}</div>
          </wa-popover>
          <wa-button id='name-button' variant='brand'>
            Mark Harper
          </wa-button>
        </div>
      </header>
      <graph-canvas
        className='viz-home'
        data-theme={themeName}
        data-width={width}
        data-height={height}
      ></graph-canvas>
    </wa-page>
  );
};

export default Home;
