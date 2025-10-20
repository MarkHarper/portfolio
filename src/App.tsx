import { BrowserRouter, Routes, Route, Outlet } from 'react-router';
import '@awesome.me/webawesome/dist/styles/webawesome.css';

import { SizingContextProvider } from '~/services/contexts/size';
import { ThemeNameContextProvider } from '~/services/contexts/theme';
import Home from './pages/Home';
import NoMatch from './pages/NoMatch';

const App = () => {
  return (
    <ThemeNameContextProvider>
      <SizingContextProvider>
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<Outlet />}>
              <Route index element={<Home />} />
              <Route element={<NoMatch />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </SizingContextProvider>
    </ThemeNameContextProvider>
  );
};

export default App;
