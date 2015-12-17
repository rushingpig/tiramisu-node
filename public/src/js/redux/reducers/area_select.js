import { combineReducers } from 'redux';
import { GOT_PROVINCES, GOT_CITIES, GOT_DISTRICTS, 
  PROVINCE_RESET, CITY_RESET } from '../actions/area';
import { map } from '../utils/index';

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

export function area(state = initial_state, action){
  switch (action.type) {
    case GOT_PROVINCES:
      return {...state, ...{provinces: _t(action.data), cities: [], districts: []} };
    case PROVINCE_RESET:
      return {...state, ...{cities: [], districts: []} };
    case GOT_CITIES:
      return {...state, ...{cities: _t(action.data), districts: []} };
    case CITY_RESET:
      return {...state, ...{districts: []}}
    case GOT_DISTRICTS:
      return {...state, ...{districts: _t(action.data)} };
    default:
      return state
  }
}