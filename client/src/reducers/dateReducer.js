import { GET_DATE, SET_DATE } from '../actions/types';
import moment from 'moment';

const initialState = {
    date: moment().format('L'),
}

export default function(state = initialState, action) {
    switch(action.type) {
        case GET_DATE:
        return {
            ...state,
            date: state.date,
            //loading: false
        };

        case SET_DATE:
        return {
            ...state,
            date: action.payload.date
        };
        // case DATA_LOADING:
        // return {
        //     ...state,
        //     loading: true
        // };

    default:
    return state;
    }
}