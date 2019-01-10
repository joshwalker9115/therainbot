import 'react-dates/initialize';
import { SingleDatePicker } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';
import { getDate, setDate } from '../actions/itemActions';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import React, { Component } from 'react';

class DatePicker extends Component {
    state = {
        date: null,
        focused: false
    }

    componentWillReceiveProps(props) {
        const dateFromProps = props.date.date;
        console.log("here is the datepicker from props", dateFromProps);
        this.setState({date: dateFromProps})
    }

    render() {
        return (
            <div>
                <SingleDatePicker
                    date={this.state.date} // momentPropTypes.momentObj or null
                    onDateChange={date => this.props.setDate({ date })} // PropTypes.func.isRequired
                    focused={this.state.focused} // PropTypes.bool
                    onFocusChange={({ focused }) => this.setState({ focused })} // PropTypes.func.isRequired
                    id="DatePicker" // PropTypes.string.isRequired,
                />  
            </div>
        );
    }
}

DatePicker.propTypes = {
    setDate: PropTypes.func.isRequired,
    date: PropTypes.object.isRequired
}

const mapStateToProps = (state) => ({
    date: state.date
});

export default connect(mapStateToProps, { setDate })(DatePicker);