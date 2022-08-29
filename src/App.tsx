import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import mobile from "is-mobile";

import { SizingContext } from "./services/contexts";
import Nav from "./components/Nav";
import Home from "./scenes/Home";
import NoMatch from "./scenes/NoMatch";

import "./App.css";

const App = () => {
  const [sizingState, setSizingState] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
    isMobile: mobile(),
  });

  useEffect(() => {
    window.addEventListener("resize", () => {
      setSizingState({
        isMobile: mobile(),
        width: window.innerWidth,
        height: window.innerHeight,
      });
    });
  }, []);

  return (
    <SizingContext.Provider value={sizingState}>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Nav />
                <Outlet />
              </>
            }
          >
            <Route index element={<Home />} />
            <Route element={<NoMatch />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SizingContext.Provider>
  );
};

export default App;
