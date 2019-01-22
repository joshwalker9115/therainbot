import React, { Component } from 'react';
import {Jumbotron} from 'reactstrap';
import Table1 from './Table1';
import { getStations } from '../actions/itemActions';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import '../App.css';


class State extends Component {
    constructor(props) {
        super(props);
        this.state = {
            PPs: [],
            stateName: ''
        }
    }

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
    // componentWillMount() {
    //     console.log("triggering getStations")
    //     this.props.getStations(/* {'name': this.state.stateName} */);
    // }

    componentWillReceiveProps(props) {
        // const propP = props.projects.projects
        //var result = arr.map(person => ({ value: person.id, text: person.name }));
        // console.log(props.stateName)
        // props.stateName && this.setState({...this.state, stateName: props.state});


        // componentWillReceiveProps is deprecated... consider moving this as a callback
        // to the componentDidUpdate under if (this.props.projects.projects !== []) {...}
        console.log(props)
        let temp = props.projects.projects.map( obj => 
            ([
                {
                    jobName: `${obj.jobName} - 1°`,
                    stationID: obj.primary,
                    _id: `${obj._id}_P`,
                    trigger: obj.trigger
                },
                {
                    jobName: `${obj.jobName} - 2°`,
                    stationID: obj.secondary,
                    _id: `${obj._id}_S`,
                    trigger: obj.trigger
                },
                {
                    jobName: `${obj.jobName} - 3°`,
                    stationID: obj.tertiary,
                    _id: `${obj._id}_T`,
                    trigger: obj.trigger
                }
            ])
        );
        temp = temp.flat();
        this.setState({...this.state, PPs: [/* ...this.state.PPs,  */...temp], stateName: this.determineState(props.stateName) }, //Object.assign(...this.state.PPs, ...temp)}, //
            () => console.log(this.state));        
    }

    componentDidUpdate(prevProps) {
        // Typical usage (don't forget to compare props):
        console.log(this.props.stateName)
        if (this.props.stateName !== prevProps.stateName) {
            this.setState({PPs: []}, () => {
                this.props.getStations(this.props.stateName)
            })
            // this.props.getStations(this.props.stateName, () => {
            //     if (this.props.projects.projects === []) {
            //         console.log("emptying PPs")
            //         this.setState({PPs: []});
            //     }
            // });
        }
    }
    
    render() {
        const {PPs, stateName} = this.state;
        console.log(PPs)
        return (
            <div>
                {stateName && <h3 className="text-center">{stateName}</h3>}
                <Table1 PPs={PPs} stateName={stateName} />
            </div>
        );
    }
}

State.propTypes = {
    getStations: PropTypes.func.isRequired,
    projects: PropTypes.object.isRequired
}

const mapStateToProps = (state) => ({
    projects: state.projects
});

export default connect(mapStateToProps, { getStations })(State);