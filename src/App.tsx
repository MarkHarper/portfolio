import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';

import { SizingContextProvider } from './services/contexts/size';
import { VizContextProvider } from './services/contexts/viz';
import Home from './scenes/Home';
import NoMatch from './scenes/NoMatch';

import './App.css';

const App = () => {
  return (
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
  );
};

export default App;
