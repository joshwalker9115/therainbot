import React, { Component } from 'react';
import { Link, Router } from "react-router-dom";
import {
    Collapse,
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Nav,
    NavItem,
    NavLink,
    Container
} from 'reactstrap';
import '../App.css';

class AppNavBar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false
        }
        this.handleClick = props.handleClick //add a toggle where this is called to collapse menu after click?
    }

    toggle = () => {
        this.setState({
            isOpen: !this.state.isOpen
        });
    };

    determineState = (stateName) => {
        switch(stateName) {
            case "/WV":
                return "West Virginia"
        }
        switch(stateName) {
            case "/NC":
                return "North Carolina"
        }
        switch(stateName) {
            case "/MVP":
                return "MVP"
        }
        switch(stateName) {
            case "/MD":
                return "Maryland"
        }
    }

    componentWillReceiveProps = (nextProps) => {
      this.setState({ isOpen: nextProps.isOpen})
    }
    
    render() { 
        let stateName = this.determineState(this.props.stateName);
        return(
            <div>
                <Navbar color="dark" dark expand="sa" className="mb-4">
                    <Container>
                        <NavbarBrand tag={Link} to="/">RainBot</NavbarBrand>
                        {stateName && <h4 className="nav-center">{stateName}</h4>}
                        <NavbarToggler onClick= {this.toggle} />
                        <Collapse isOpen={this.state.isOpen} navbar>
                            <Nav className="ml-auto" navbar>
                            <NavItem>
                                <NavLink tag={Link} to="/MD" onClick={ this.handleClick('/MD') }>
                                Maryland
                                </NavLink>
                                <NavLink tag={Link} to="/MVP" onClick={ this.handleClick('/MVP') }>
                                MVP
                                </NavLink>
                                <NavLink tag={Link} to="/NC" onClick={ this.handleClick('/NC') }>
                                North Carolina
                                </NavLink>
                                <NavLink tag={Link} to="/WV" onClick={ this.handleClick('/WV') }>
                                West Virginia
                                </NavLink>
                            </NavItem>
                            </Nav>
                        </Collapse>
                    </Container>
                </Navbar>
            </div>
        );
    }
}


export default AppNavBar;