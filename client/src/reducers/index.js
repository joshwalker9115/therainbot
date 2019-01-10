import { combineReducers } from 'redux';
import stationReducer from './stationReducer';
// import dateReducer from './dateReducer';

export default combineReducers({
    projects: stationReducer,
    // date: dateReducer
});