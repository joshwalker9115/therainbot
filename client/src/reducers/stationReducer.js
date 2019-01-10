import uuid from 'uuid';
import { GET_STATIONS, ADD_STATION, DELETE_STATION, EDIT_STATION, DATA_LOADING } from '../actions/types';

const initialState = {
    projects: [],
    loading: false
}

export default function(state = initialState, action) {
    switch(action.type) {
        case GET_STATIONS:
        return {
            ...state,
            projects: action.payload
            //loading: false
        };
        case DELETE_STATION:
        return {
            ...state,
            projects: state.projects.filter(project => project._id !== action.payload)
        };
        case ADD_STATION:
        return {
            ...state,
            projects: [action.payload, ...state.projects]
        };
        case EDIT_STATION:
        console.log("edit reducer triggered", state.projects.filter(project => project._id !== action.payload._id), action.payload);
        return {
            ...state,
            projects: [...state.projects.filter(project => project._id !== action.payload._id), action.payload]
        };
        case DATA_LOADING:
        return {
            ...state,
            loading: true
        };

    default:
    return state;
    }
}