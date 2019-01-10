import React, { Component } from 'react';
import { Container } from 'reactstrap';
import { Provider } from 'react-redux';
import store from './store';
import { BrowserRouter as Router } from "react-router-dom";

import AppNavBar from './components/AppNavBar';
import State from './components/State';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

//use react-router here to direct to proper stationlist/ state? or in NavBar

class App extends Component {
  constructor() {
    super();
    this.state = {
      stateName: '',
    };
    //this.handleClick = this.handleClick.bind(this, 'Parameter');
  }

  handleClick = (param) => (event) => {
    console.log(param);
    this.setState({ stateName: param });
    event.preventDefault();
  };

  render() {


    return (
      <Provider store={store}>
        <Router>
          <div className="App">
            <AppNavBar handleClick={this.handleClick.bind(this)} isOpen={false}/>
            <Container fluid>
              <State stateName={this.state.stateName} />
            </Container>
          </div>
        </Router>
      </Provider>
    );
  }
}

export default App;
