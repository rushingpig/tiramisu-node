import { combineReducers } from 'redux';
import {area as AREA} from 'actions/action_types';
import { UPDATE_PATH } from 'redux-simple-router';
import { map } from 'utils/index';
import { AreaActionTypes1 } from 'actions/action_types';
import { SELECT_DEFAULT_VALUE } from 'config/app.config';

var initial_state = {
  province_id: SELECT_DEFAULT_VALUE,
  provinces: [],
  city_id: SELECT_DEFAULT_VALUE,
  cities: [],
  district_id: SELECT_DEFAULT_VALUE,
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
      case Actions.GOT_PROVINCES_SIGNAL:
        return {...state, provinces: _t(action.data) };
      case Actions.SET_PROVINCE:
        return {...state, province_id: action.province_id, cities: [], districts: [], delivery_shops: []}
      case Actions.RESET_CITIES:
        return {...state, cities: [], districts: [], delivery_shops: [] };
      case Actions.GOT_ALL_CITIES:
        return {...state,cities:_t(action.data)};
      case Actions.GOT_CITIES:
        return {...state, cities: _t(action.data) };
      case Actions.GOT_CITIES_SIGNAL:
        return {...state, cities: _t(action.data) };
      case Actions.SET_CITY:
        return {...state, city_id: action.city_id, districts: [], delivery_shops: []};
      case Actions.RESET_DISTRICTS:
        return {...state, districts: [], delivery_shops: []}
      case Actions.GOT_DISTRICTS:
      case Actions.GOT_DISTRICTS_AND_CITY:
        return {...state, districts: _t(action.data) };
      case Actions.GOT_CITY_AND_DISTRICTS:
        return {...state, cities: _t(action.data)};
      case Actions.SET_DISTRICT:
        return {...state, district_id: action.district_id, delivery_shops: []}
      case Actions.GOT_DELIVERY_SHOPS:
        return {...state, delivery_shops: map(action.data, text => ({id: text, text})) };
      case Actions.RESET_SHOPS:
        return {...state, delivery_shops: []}
      default:
        return state
    }
  };
}