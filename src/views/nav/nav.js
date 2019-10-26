import React, { Component } from 'react';
import './nav.css';
import { Link } from 'react-router-dom';

export class Nav extends Component {
  state = {
    width: window.innerWidth,
    openDrawer: false,
    items: [
      {
        label: "Home",
        url: "/"
      },
      {
        label: "Experience",
        url: "/experience"
      },
      {
        label: "Writing",
        url: "/writing"
      }
    ]
  }

  componentDidCatch(error, info) {
    console.log(error, info);
  }

  componentDidMount() {
    window.addEventListener('resize', () => {
      this.setState((prev, props) => {
        return {
          width: window.innerWidth
        };
      });
    });
  }

  knobClick(e: any) {
    this.setState((prev, props) => {
      return {
        openDrawer: !prev.openDrawer
      };
    });
  }

  getMatchingRoute() {
    let matched;
    
    this.state.items.forEach((item) => {
      if (matched) return;

      const checkRoute = this.props.route.split('/').slice(0, 2).join('');
      const url = item.url.split('/').slice(0, 2).join('');
      if (url === checkRoute) matched = item;
    });

    return matched;
  }

  getDrawerContent() {
    const route = this.getMatchingRoute();
    return this.state.items.filter(i => i.url !== route.url)
      .map((item, i) => (
        <Link className="drawer-link" key={i} to={item.url} onClick={(e) => {this.knobClick(e)}}>
          <span>{item.label.toUpperCase()}</span>
        </Link>
      ));
  }

  render() {
    return (
        <header className="nav-main">
          
          <div className="nav-content-left">
            <div>
              {!this.props.mobile ? <span className="nav-hide-cafe"></span> : null}
              <Link to="/"><img className="nav-icon-cafe" src={"/images/cafe.svg"}/></Link>
              <Link to="/"><div className="nav-name">Mark Harper</div></Link>
            </div>
          </div>

          {
            this.state.width < 750 ? 
            [
              <div key="knob" className="nav-content-right" onClick={(e) => {this.knobClick(e)}}>
                <span>
                  {
                    this.getMatchingRoute().label.toUpperCase()
                  }
                </span>
                <span className="caret"></span>
              </div>,
              <div key="drawer" className={"drawer " + (this.state.openDrawer ? "open" : "hide")}>
                {
                  this.getDrawerContent()
                }
              </div>
            ]
            :
            [
              <div key="mid" className="nav-content-middle">
                {
                  this.state.items.map((item, i) => {
                    const checkRoute = this.props.route.split('/').slice(0, 2).join('');
                    const url = item.url.split('/').slice(0, 2).join('');
                    return (
                      <Link key={i} className={checkRoute === url ? "nav-link-active" : "nav-link"} to={item.url}>
                        <span>{item.label.toUpperCase()}</span>
                      </Link>
                    );
                  })
                }
              </div>, 
              <div key="right" className="nav-content-right">
                <a className="btn-resume" href={"/images/resume.pdf"} target="_blank">{'R' + String.fromCharCode(233) + 'SUME'}</a>
              </div>
            ]
          }
        </header>
    );
  }
}
