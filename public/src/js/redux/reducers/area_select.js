import { combineReducers } from 'redux';
import {area as AREA} from 'actions/action_types';
import { UPDATE_PATH } from 'redux-simple-router';
import { map } from 'utils/index';
import { AreaActionTypes1 } from 'actions/action_types';

var initial_state = {
  provinces: [],
  cities: [],
  districts: [],
  delivery_shops: [],
}

function _t(data){
  return map(data, (text, id) => ({id, text}))
}

export function area(Actions = AreaActionTypes1){
  return function area(state = initial_state, action){
    switch (action.type) {
      case UPDATE_PATH:
        return initial_state;

      case Actions.GOT_PROVINCES:
        return {...state, provinces: _t(action.data) };
      case Actions.PROVINCE_RESET:
        return {...state, cities: [], districts: [], delivery_shops: [] };
      case Actions.GOT_CITIES:
        return {...state, cities: _t(action.data) };
      case Actions.CITY_RESET:
        return {...state, districts: [], delivery_shops: []}
      case Actions.GOT_DISTRICTS:
        return {...state, districts: _t(action.data) };
      case Actions.GOT_DELIVERY_SHOPS:
        return {...state, delivery_shops: map(action.data, text => ({id: text, text})) };
      case Actions.DISTRICT_RESET:
        return {...state, delivery_shops: []}
      default:
        return state
    }
  };
}