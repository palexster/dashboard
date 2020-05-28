import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import './DashBoardGeneral.css';

class DashboardGeneral extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        {/** Maybe put something for the front page? */}
        <div className="home-container">
          <div className="container">
            <div className="graf-bg-container">
              <div className="graf-layout">
                <div className="graf-circle"/>
                <div className="graf-circle"/>
                <div className="graf-circle"/>
                <div className="graf-circle"/>
                <div className="graf-circle"/>
                <div className="graf-circle"/>
                <div className="graf-circle"/>
                <div className="graf-circle"/>
                <div className="graf-circle"/>
                <div className="graf-circle"/>
                <div className="graf-circle"/>
              </div>
            </div>
            {
              this.props.user ? (
                <h1 className="home-title">{'Welcome to Liqo, ' + this.props.user.given_name}</h1>
              ) : (
                <h1 className="home-title">{'Welcome to Liqo'}</h1>
              )
            }

          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(DashboardGeneral);
