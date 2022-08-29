import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { SizingContext } from "../../services/contexts";

import "./styles.css";

const Nav = () => {
  const { isMobile } = useContext(SizingContext);

  return (
    <header className="nav-main">
      <div className="nav-content-left">
        <div>
          {!isMobile ? <span className="nav-hide-cafe"></span> : null}
          <Link to="/">
            <img
              className="nav-icon-cafe"
              src={"/images/cafe.svg"}
              alt="hot coffee"
            />
          </Link>
          <Link to="/">
            <div className="nav-name">Mark Harper</div>
          </Link>
        </div>
      </div>

      <div key="right" className="nav-content-right">
        <a
          className="btn-resume"
          href={"/images/resume.pdf"}
          target="_blank"
          rel="noopener noreferrer"
        >
          {`R${String.fromCharCode(233)}SUME`}
        </a>
      </div>
    </header>
  );
};

export default Nav;
