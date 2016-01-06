import { combineReducers } from 'redux';
import { GOT_PROVINCES, GOT_CITIES, GOT_DISTRICTS, 
  PROVINCE_RESET, CITY_RESET } from 'actions/area';
import { UPDATE_PATH } from 'redux-simple-router';
import { map } from 'utils/index';

var initial_state = {
  provinces: [],
  cities: [],
  districts: [],
}

function _t(data){
  return map(data, function(n, i){
    return {
      id: i,
      text: n
    }
  })
}

export function area(if_reset){
  return function area(state = initial_state, action){
    switch (action.type) {
      case UPDATE_PATH:
        return if_reset ? initial_state : state;
      case GOT_PROVINCES:
        return {...state, provinces: _t(action.data) };
      case PROVINCE_RESET:
        return {...state, cities: [], districts: [] };
      case GOT_CITIES:
        return {...state, cities: _t(action.data) };
      case CITY_RESET:
        return {...state, districts: []}
      case GOT_DISTRICTS:
        return {...state, districts: _t(action.data) };
      default:
        return state
    }
  };
}