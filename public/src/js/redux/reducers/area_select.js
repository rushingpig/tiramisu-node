import { combineReducers } from 'redux';
import * as Actions from 'actions/area';
import { UPDATE_PATH } from 'redux-simple-router';
import { map } from 'utils/index';

var initial_state = {
  provinces: [],
  cities: [],
  districts: [],
  delivery_shops: [],
}

function _t(data){
  return map(data, (text, id) => ({id, text}))
}

export function area(if_reset){
  return function area(state = initial_state, action){
    switch (action.type) {
      case Actions.UPDATE_PATH:
        return if_reset ? initial_state : state;
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
        return {...state, delivery_shops: _t(action.data) };
      case Actions.DISTRICT_RESET:
        return {...state, delivery_shops: []}
      default:
        return state
    }
  };
}