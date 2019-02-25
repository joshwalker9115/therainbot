import React, { Component } from 'react';
import {
    Button,
    Col,
    Input,
    Modal,
    ModalHeader,
    ModalBody,
    Form,
    FormGroup,
    Label,
    Row
} from 'reactstrap';
import { connect } from 'react-redux';
import { addStation, editStation } from '../actions/itemActions';

class ProjectModal extends Component {
    constructor(props) {
        super(props);
        this.handleClick = this.props.handleClick;
        this.toggle = this.props.toggle;
    }
    state = {
        modal: this.props.modal,
        type: this.props.type,
        data: this.props.data,
        emailList: '',
        jobName: '',
        stateName: '',
        primary: '',
        secondary: '',
        tertiary: '',
        trigger: ''
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

        switch(this.state.type) {
            case "Email":
            const emailProps = {
                data: this.state.data,
                emailList: this.state.emailList

            }
            // create a new function to submit the emailProps above through nodeMailer
            
            case "Add":
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
            break;

            case "Edit":
            const updatedProject = {
                _id: this.props._id,
                jobName: this.state.jobName,
                primary: this.state.primary,
                secondary: this.state.secondary,
                tertiary: this.state.tertiary,
                stateName: this.state.stateName,
                trigger: this.state.trigger
            }
    
            console.log(updatedProject);
    
            // Add Project via addStation action
            this.props.editStation(updatedProject);  
            break;
        }

        // Close modal
        this.toggle();
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props !== prevProps) {
            console.log("component did update triggered");
            this.setState({
                modal: this.props.modal,
                type: this.props.type,
                jobName: this.props.jobName,
                stateName: this.props.stateName,
                primary: this.props.primary,
                secondary: this.props.secondary,
                tertiary: this.props.tertiary,
                trigger: this.props.trigger
            });
        }
    }
    

    render() {
        return(
            <div>
                <Row>
                    <Col xs="6" sm="4">
                        <Button
                        block
                        color="success"
                        style={{marginBottom: '2rem'}}
                        onClick={this.handleClick("Add")}
                        >Add Project</Button>
                    </Col>
                    <Col xs="6" sm="4">
                        <Button
                        block
                        color="danger"
                        style={{marginBottom: '2rem'}}
                        onClick={this.handleClick("Edit")}
                        >Edit Project</Button>
                    </Col>
                    <Col xs="6" sm="4">
                        <Button
                        block
                        color="primary"
                        style={{marginBottom: '2rem'}}
                        onClick={this.handleClick("Email")}
                        >Email</Button>
                    </Col>
                    <Col xs="6" sm="4"></Col>
                </Row>
                <Modal
                  isOpen={this.state.modal}
                  toggle={this.toggle}
                  >
                  {this.state.type === "Email" ? (
                      <div>
                        <ModalHeader toggle={this.toggle}>{this.state.type} Project</ModalHeader>
                        <ModalBody>
                            <Form onSubmit={this.onSubmit}>
                                <FormGroup>
                                    <Label for="Project">Project Name</Label>
                                    <Input
                                    type="text"
                                    name="jobName"
                                    id="Project"
                                    value={this.state.jobName}
                                    onChange={this.onChange}
                                    />
                                    <Button
                                    color="dark"
                                    style={{marginTop: '2rem'}}
                                    block
                                    > Submit
                                    </Button>
                                </FormGroup>
                            </Form>
                        </ModalBody>
                      </div> )
                        : ( 
                      <div>
                        <ModalHeader toggle={this.toggle}>{this.state.type} Project</ModalHeader>
                        <ModalBody>
                            <Form onSubmit={this.onSubmit}>
                                <FormGroup>
                                    <Label for="Project">Project Name</Label>
                                    <Input
                                    type="text"
                                    name="jobName"
                                    id="Project"
                                    value={this.state.jobName}
                                    onChange={this.onChange}
                                    />
                                    <Label for="State">State</Label>
                                    <Input
                                    type="text"
                                    name="stateName"
                                    id="State"
                                    value={this.state.stateName}
                                    onChange={this.onChange}
                                    />
                                    <Label for="Primary">Primary Station</Label>
                                    <Input
                                    type="text"
                                    name="primary"
                                    id="Primary"
                                    value={this.state.primary}
                                    onChange={this.onChange}
                                    />
                                    <Label for="Secondary">Secondary Station</Label>
                                    <Input
                                    type="text"
                                    name="secondary"
                                    id="Secondary"
                                    value={this.state.secondary}
                                    onChange={this.onChange}
                                    />
                                    <Label for="Tertiary">Tertiary Station</Label>
                                    <Input
                                    type="text"
                                    name="tertiary"
                                    id="Tertiary"
                                    value={this.state.tertiary}
                                    onChange={this.onChange}
                                    />
                                    <Label for="Trigger">Trigger Amount (in.)</Label>
                                    <Input
                                    type="text"
                                    name="trigger"
                                    id="Trigger"
                                    value={this.state.trigger}
                                    onChange={this.onChange}
                                    />
                                    <Button
                                    color="dark"
                                    style={{marginTop: '2rem'}}
                                    block
                                    > Submit
                                    </Button>
                                </FormGroup>
                            </Form>
                        </ModalBody>
                      </div>
                    )}
                </Modal>
            </div>
        )
    }
}

const mapStateToProps = state => ({
    projects: state.projects
});

export default connect(mapStateToProps, {addStation, editStation})(ProjectModal);