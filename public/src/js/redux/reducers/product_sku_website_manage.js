import { combineReducers } from 'redux';
import * as STATION_ACTIONS from 'actions/station_manage';
import { UPDATE_PATH } from 'redux-simple-router';
import { area } from 'reducers/area_select';

var initial_state = {
  all: true
}

function applicationRange(state = initial_state, action){
  switch (action.type) {
    case UPDATE_PATH:
      return initial_state;
    default :
      return state;
  }
}

export default combineReducers({
  applicationRange,
  area: area()
})