import React, { Component } from "react";
import { background } from "../../utilities/homeViz.js";
import "./home.css";

export class Home extends Component {
  state = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  componentDidCatch(error, info) {
    console.log(error, info);
  }

  componentDidMount() {
    const canvas = document.getElementById("viz-home");
    background(this.state.width, this.state.height, canvas);

    window.addEventListener("resize", () => {
      this.setState((prev, props) => {
        return {
          width: window.innerWidth,
          height: window.innerHeight,
        };
      });
    });
  }

  componentDidUpdate() {
    const canvas = document.getElementById("viz-home");
    background(this.state.width, this.state.height, canvas);
  }

  render() {
    return (
      <div className="viz-home-container">
        <div className="viz-home-text">
          <div>Software Developer</div>
          <div>I have a passion for code, coffee and challenging projects</div>
          <div>
            <a
              href="https://github.com/markharper"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img className="icon" src={"/images/github.png"} alt="github" />
            </a>
            <a
              href="https://twitter.com/IAmMarkHarper"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img className="icon" src={"/images/twitter.svg"} alt="twitter" />
            </a>
            <a
              href="https://www.linkedin.com/in/mark-harper-06763174/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                className="icon"
                src={"/images/linkedin.png"}
                alt="linkedin"
              />
            </a>
          </div>
        </div>
        <canvas
          id="viz-home"
          height={this.state.height}
          width={this.state.width}
        ></canvas>
      </div>
    );
  }
}
