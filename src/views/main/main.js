import React, { Component } from "react";
import { Home, NoMatch, Nav } from "../index.js";
import { Route, Switch } from "react-router-dom";

export class Main extends Component {
  state = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  componentDidCatch(error, info) {
    console.log(error, info);
  }

  render() {
    return (
      <React.Fragment>
        <Nav route={this.props.location.pathname} mobile={this.state.mobile} />
        <Switch>
          <Route path="/" component={Home} exact />
          <Route component={NoMatch} />
        </Switch>
      </React.Fragment>
    );
  }
}
