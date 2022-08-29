import React, { useContext, useEffect } from "react";
import { SizingContext } from "../../../../services/contexts";
import visualize from "../../../../services/visualization";
import "./styles.css";

const Home = () => {
  const { width, height } = useContext(SizingContext);

  useEffect(() => {
    const canvas = document.getElementById("viz-home");
    visualize(width, height, canvas);
  }, [width, height]);

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
            href="https://www.linkedin.com/in/mark-harper-06763174/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img className="icon" src={"/images/linkedin.png"} alt="linkedin" />
          </a>
        </div>
      </div>
      <canvas id="viz-home" height={height} width={width}></canvas>
    </div>
  );
};

export default Home;
