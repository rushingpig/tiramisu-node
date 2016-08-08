import { combineReducers } from 'redux';
import * as STATION_ACTIONS from 'actions/station_manage';
import { UPDATE_PATH } from 'redux-simple-router';

var initail_state = {
  station_list: []
}

export default function stations(state = initail_state, action){
  switch (action.type) {
    case UPDATE_PATH:
      return initail_state;
    default :
      return state;
  }
}