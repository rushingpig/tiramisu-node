import { combineReducers } from 'redux';
import { map, core } from 'utils/index';
import { area } from 'reducers/area_select';
import * as STATION_ACTIONS from 'actions/station_manage';
import { UPDATE_PATH } from 'redux-simple-router';

var initail_state = {
  station_list: []
}

export default function stations(state = initail_state, action){
  switch (action.type) {
    case UPDATE_PATH:
      return initail_state;
    case STATION_ACTIONS.GET_STATION_LIST_BY_SCOPE:
      return {...state, station_list: map(action.data.list || [], ({station_id, name}) => ({id: station_id, text: name}))};
    case STATION_ACTIONS.GET_STATION_LIST_BY_SCOPE_SIGNAL:
      return {...state, station_list: map(action.data.list || [], ({station_id, name}) => ({id: station_id, text: name}))};
    case STATION_ACTIONS.RESET_STATION_LSIT_WHEN_SCOPE_CHANGE:
      return {...state, station_list: []};
    default :
      return state;
  }
}