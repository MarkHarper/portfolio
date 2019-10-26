import React, { Component } from 'react';
import {
  Home,
  Experience,
  Writing,
  Post,
  NoMatch,
  Nav
} from '../index.js';
import {  
  Route,
  Switch
} from 'react-router-dom';

export class Main extends Component {
  state = {
    width: window.innerWidth,
    height: window.innerHeight,
  }

  componentDidCatch(error, info) {
    console.log(error, info);
  }

  render() {
    return (
      <React.Fragment>
        <Nav route={this.props.location.pathname} mobile={this.state.mobile}/>
        <Switch>
          <Route path="/" component={Home} exact />
          <Route path="/experience" component={Experience} exact />
          {/* <Route path="/writing/" component={Writing} exact />
          <Route path="/writing/:id" component={Post} exact /> */}
          <Route component={NoMatch}/>
        </Switch>
      </React.Fragment>
    );
  }
}