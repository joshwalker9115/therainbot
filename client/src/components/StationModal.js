import React, { Component } from 'react';
import {
    Button,
    Modal,
    ModalHeader,
    ModalBody,
    Form,
    FormGroup,
    Label,
    Input
} from 'reactstrap';
import { connect } from 'react-redux';
import { addStation } from '../actions/itemActions';

class ProjectModal extends Component {
    state = {
        modal: false,
        name: '',
        state: '',
        primary: '',
        secondary: '',
        tertiary: ''
    }

    toggle = () => {
        this.setState({
            modal: !this.state.modal
        });
    }

    onChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
            // [e.target.primary]: e.target.value,
            // [e.target.secondary]: e.target.value,
            // [e.target.tertiary]: e.target.value,
            // [e.target.name]: e.target.value
        });
    }

    onSubmit = (e) => {
        e.preventDefault();

        const newProject = {
            jobName: this.state.jobName,
            primary: this.state.primary,
            secondary: this.state.secondary,
            tertiary: this.state.tertiary,
            stateName: this.state.stateName,
            trigger: this.state.trigger
        }

        console.log(newProject);

        // Add Project via addStation action
        this.props.addStation(newProject);

        // Close modal
        this.toggle();
    }

    render() {
        return(
            <div>
                <Button
                  color="dark"
                  style={{marginBottom: '2rem'}}
                  onClick={this.toggle}
                  >Add Project</Button>

                <Modal
                  isOpen={this.state.modal}
                  toggle={this.toggle}
                  >
                    <ModalHeader toggle={this.toggle}>Add To Project List</ModalHeader>
                    <ModalBody>
                        <Form onSubmit={this.onSubmit}>
                            <FormGroup>
                                <Label for="Project">Project Name</Label>
                                <Input
                                type="text"
                                name="name"
                                id="Project"
                                placeholder="Project Name"
                                onChange={this.onChange}
                                />
                                <Label for="State">State</Label>
                                <Input
                                type="text"
                                name="state"
                                id="State"
                                placeholder="State"
                                onChange={this.onChange}
                                />
                                <Label for="Primary">Primary Station</Label>
                                <Input
                                type="text"
                                name="primary"
                                id="Primary"
                                placeholder="Primary Station"
                                onChange={this.onChange}
                                />
                                <Label for="Secondary">Secondary Station</Label>
                                <Input
                                type="text"
                                name="secondary"
                                id="Secondary"
                                placeholder="Secondary Station"
                                onChange={this.onChange}
                                />
                                <Label for="Tertiary">Tertiary Station</Label>
                                <Input
                                type="text"
                                name="tertiary"
                                id="Tertiary"
                                placeholder="Tertiary Station"
                                onChange={this.onChange}
                                />
                                <Button
                                  color="dark"
                                  style={{marginTop: '2rem'}}
                                  block
                                  >Add Project
                                </Button>
                            </FormGroup>
                        </Form>
                    </ModalBody>
                </Modal>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    projects: state.projects
});

export default connect(mapStateToProps, {addStation})(ProjectModal);