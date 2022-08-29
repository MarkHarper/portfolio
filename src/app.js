import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import mobile from "is-mobile";

import { SizingContext } from "./services/contexts";
import Main from "./scenes/Main";

const App = () => {
  const [sizingState, setSizingState] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
    mobile: mobile(),
  });

  useEffect(() => {
    window.addEventListener("resize", () => {
      setSizingState({
        mobile: mobile(),
        width: window.innerWidth,
        height: window.innerHeight,
      });
    });
  }, []);

  return (
    <SizingContext.Provider value={sizingState}>
      <Router>
        <Route path="/" component={Main} />
      </Router>
    </SizingContext.Provider>
  );
};

export default App;
