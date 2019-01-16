import React, { Component } from 'react';
import {Jumbotron} from 'reactstrap';
import Table from './Table';
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
        // const { projects } = this.props.projects;
        // console.log("hello, jere;")
        // console.log(projects);
        // let PPs = [];
        // PPs = projects.map(obj => [{
        //     jobName: `${obj.stateList.list.job.name} - 1°`,
        //     stationID1: obj.stateList.list.job.primary,
        //     stationID2: obj.stateList.list.job.secondary,
        //     stationID3: obj.stateList.list.job.tertiary,
        //     }]);
        // const temp = projects.map( obj => 
        //     [{
        //         jobName: `${obj.job.name} - 1°`,
        //         stationID: obj.job.primary
        //     },
        //     {
        //         jobName: `${obj.job.name} - 2°`,
        //         stationID: obj.job.secondary
        //     },
        //     {
        //         jobName: `${obj.job.name} - 3°`,
        //         stationID: obj.job.tertiary
        //     }]);
          //this.setState({PPs: [...this.state.PPs, temp[0]]});

          
        //this should pull from the "StationList" database (not yet created), pulling the West Virginia list of
        //  jobNames and stationIDs.  This pulling should be done in the table component, mapped to {data}

        // [{
        //     jobName: "Berkeley Ridge - 1°",
        //     stationID: "KWVFALLI8"
        // },
        // {
        //     jobName: "Charles Town - 1°",
        //     stationID: "KWVCHARL32"
        // },
        // {
        //     jobName: "Charles Town - 2°",
        //     stationID: "KWVRANSO3"
        // },
        // {
        //     jobName: "Charles Town - 3°",
        //     stationID: "KWVCHARL41"
        // },
        // {
        //     jobName: "Yorkshire Glen - 1°",
        //     stationID: "KWVMARTI24"
        // },
        // {
        //     jobName: "Yorkshire Glen - 2°",
        //     stationID: "KWVKEARN9"
        // },
        // {
        //     jobName: "Yorkshire Glen - 3°",
        //     stationID: "KWVMARTI21"
        // }];
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