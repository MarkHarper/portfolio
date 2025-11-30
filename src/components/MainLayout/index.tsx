import { Link } from 'react-router';

import '@awesome.me/webawesome/dist/components/icon/icon.js';
import '@awesome.me/webawesome/dist/components/button/button.js';

import '~/elements/graph-canvas';

import './styles.css';

const MainLayout = ({ children }) => (
  <main className='wa-glass'>
    <Link to='/' className='close-btn'>
      <wa-button appearance='plain'>
        <wa-icon name='close'></wa-icon>
      </wa-button>
    </Link>
    <article>{children}</article>
  </main>
);

export default MainLayout;
