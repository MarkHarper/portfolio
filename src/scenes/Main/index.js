import React, { useContext } from "react";
import { Route, Switch } from "react-router-dom";

import { SizingContext } from "../../services/contexts";
import Nav from "./components/Nav";
import NoMatch from "./scenes/NoMatch";
import Home from "./scenes/Home";

const Main = ({ location }) => {
  const { mobile } = useContext(SizingContext);

  return (
    <>
      <Nav route={location.pathname} mobile={mobile} />
      <Switch>
        <Route path="/" component={Home} exact />
        <Route component={NoMatch} />
      </Switch>
    </>
  );
};

export default Main;
