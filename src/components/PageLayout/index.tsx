import { Outlet } from 'react-router';

import '~/elements/graph-canvas';

import Header from './components/Header';
import Visualization from './components/Visualization';
import CanvasGradientIndicator from './components/CanvasGradientIndicator';
import './styles.css';

const PageLayout = () => (
  <>
    <wa-page>
      <Header />
      <Outlet />
    </wa-page>

    <Visualization />
    <CanvasGradientIndicator />
  </>
);

export default PageLayout;
