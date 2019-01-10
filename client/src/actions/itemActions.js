import axios from 'axios';
import { GET_DATA, EDIT_STATION, DATA_LOADING, GET_STATIONS, ADD_STATION, DELETE_STATION, GET_DATE, SET_DATE } from './types';

export const getDate = () => dispatch => {
    //dispatch(setDataLoading());
    dispatch({
        type: GET_DATE
    });
}

export const setDate = (data) => dispatch => {
    dispatch({
        type: SET_DATE,
        payload: data
    })
}

export const getStations = (data) => dispatch => {
    //dispatch(setDataLoading());
    console.log(data)
    axios
    .get(`/api/StationList${data}`, data)
        .then(res =>
            dispatch({
                type: GET_STATIONS,
                payload: res.data
            })
        )
}

export const addStation = (data) => dispatch => {
    axios
        .post(`/api/StationList/`, data)
        .then(res => 
            dispatch({
            type: ADD_STATION,
            payload: res.data
            })
        )
        .catch(err => console.log(err))
}

export const editStation = (data) => dispatch => {
    axios
        .put(`/api/StationList/${data._id}`, data)
        .then(res =>
            dispatch({
            type: EDIT_STATION,
            payload: res.data,
            })
        )
        .catch(err => console.log(err))
}

export const deleteStation = (id) => dispatch  => {
    axios.delete(`/${id}`).then( res =>
        dispatch({
            type: DELETE_STATION,
            payload: id
        })
    )
}

export const setDataLoading = () => {
    return {
        type: DATA_LOADING
    }
}