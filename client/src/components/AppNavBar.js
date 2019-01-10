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

    componentWillReceiveProps = (nextProps) => {
      this.setState({ isOpen: nextProps.isOpen})
    }
    
    render() { 
        return(
            <div>
                <Navbar color="dark" dark expand="sa" className="mb-5">
                    <Container>
                        <NavbarBrand tag={Link} to="/">RainBot</NavbarBrand>
                        <NavbarToggler onClick= {this.toggle} />
                        <Collapse isOpen={this.state.isOpen} navbar>
                            <Nav className="ml-auto" navbar>
                            <NavItem>
                                <NavLink tag={Link} to="/WV" onClick={ this.handleClick('/WV') }>
                                West Virginia
                                </NavLink>
                                <NavLink tag={Link} to="/NC" onClick={ this.handleClick('/NC') }>
                                North Carolina
                                </NavLink>
                                <NavLink tag={Link} to="/MVP" onClick={ this.handleClick('/MVP') }>
                                MVP
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