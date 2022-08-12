import React, { Component } from "react";
import mobile from "is-mobile";
import { Main } from "./views";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { SizingContext } from "./contexts.js";

export class App extends Component {
  state = {
    route: "",
    sizing: {
      width: window.innerWidth,
      height: window.innerHeight,
      mobile: mobile(),
    },
  };

  componentDidCatch(error: any, info: any) {
    console.log(error, info);
  }

  render() {
    return (
      <SizingContext.Provider value={this.state.sizing}>
        <Router>
          <Route path="/" component={Main} />
        </Router>
      </SizingContext.Provider>
    );
  }
}
