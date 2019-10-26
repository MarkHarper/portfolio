import React, { Component } from 'react';
import './experience.css';


export class Experience extends Component {
  componentDidCatch(error, info) {
    console.log(error, info);
  }

  render() {
      /*
        Experience
        - Work & Education
          - TIY: Build It Green
          - Factivate: Front End Developer
          - Exaptive: 
            - Developer Support Engineer
            - Software Developer
        - Projects
          - A-router
          - Incremental DOM Lib
          - C/Rust Text Visualization Lib
          - Elixir CMS
      */


    return [      
      <div key="factivate" className="exp-container">
        <section>
          <h2>Factivate</h2>
          <p>
            An intelligent spreadsheet platform with integrations for online platforms
            such as Google Analytics and Facebook. With Factivate, your spreadsheet
            does not require manual updates and can respond to changes in your data
            as they occur.
          </p>
          <h3>Involvement</h3>
          <ul>
            <li>Front End Development, working with an experienced development
            team focused on the fast-paced development of an MVP</li>
            <li>Architected and implemented the charting functionality for the
            spreadsheet, utilizing C3.js and Websockets</li>
            <li>Refactored Front-End components to reduce bugs and improve test
              coverage using the Intern.js testing framework</li>
          </ul>
          <h3>Technologies Used:</h3>
          <p>
            Require.js, D3.js, C3.js, Bootstrap, jQuery, Django Framework
          </p>
        </section>
        <section>
          <a href="https://www.factivate.com/">
            <img src={"/images/factivate.png"}/>
          </a>
        </section>
      </div>, 
      <div key="buildItGreen" className="exp-container">
        <section>
          <h2>Build It Green</h2>
          <p>
            Build it Green is a data analysis project analyzing trends in LEED scoring
            and usage by builders and developers. In total, the project includes analysis
            of over 7000 LEED Construction projects and displayed the findings in
            more than 80 visualizations.
          </p>
          <h3>Involvement</h3>
            <ul>
              <li>Front End Development, working with two Python Developers to craft
              a clean Front End for the various, colorful visualizations in the project</li>
              <li>Built over 40 D3.js visualizations, including datamaps, bar and line
              charts</li>
              <li>Collaborated with Backend team members to structure the Django API
              for retrieving the LEED scoring data</li>
            </ul>
            <h3>Technologies Used:</h3>
            <p>
              Backbone.js, Gulp.js, Underscore.js, D3.js, MDL, jQuery, Django Framework
            </p>
        </section>
        <section>
          <a href="https://github.com/Data-Science-TIY/builditgreen">
            <img src={"./images/big.png"}/>
          </a>
        </section>
      </div>
    ];
  }
}