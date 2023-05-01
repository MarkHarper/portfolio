import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';

import { SizingContextProvider } from '~/services/contexts/size';
import { VizContextProvider } from '~/services/contexts/viz';
import { ThemeNameContextProvider } from '~/services/contexts/theme';
import Home from './scenes/Home';
import NoMatch from './scenes/NoMatch';

const App = () => {
  return (
    <ThemeNameContextProvider>
      <SizingContextProvider>
        <VizContextProvider>
          <BrowserRouter>
            <Routes>
              <Route path='/' element={<Outlet />}>
                <Route index element={<Home />} />
                <Route element={<NoMatch />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </VizContextProvider>
      </SizingContextProvider>
    </ThemeNameContextProvider>
  );
};

export default App;
