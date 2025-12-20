import { BrowserRouter, Routes, Route } from 'react-router';
import '@awesome.me/webawesome/dist/styles/webawesome.css';

import { SizingContextProvider } from '~/services/contexts/size';
import { ThemeContextProvider } from '~/services/contexts/theme';

import PageLayout from './components/PageLayout';
import Home from './pages/Home';
import NoMatch from './pages/NoMatch';
import Work from './pages/Work';
import About from './pages/About';
import Palettes from './pages/Palettes';
import Settings from './pages/Settings';
import { VizContextProvider } from './services/contexts/viz';

const App = () => {
  return (
    <ThemeContextProvider>
      <SizingContextProvider>
        <VizContextProvider>
          <BrowserRouter>
            <Routes>
              <Route path='/' element={<PageLayout />}>
                <Route index element={<Home />} />
                <Route path='about' element={<About />} />
                <Route path='work' element={<Work />} />
                <Route path='palettes' element={<Palettes />} />
                <Route path='settings' element={<Settings />} />
                <Route element={<NoMatch />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </VizContextProvider>
      </SizingContextProvider>
    </ThemeContextProvider>
  );
};

export default App;
