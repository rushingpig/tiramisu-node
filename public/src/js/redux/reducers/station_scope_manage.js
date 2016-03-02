import { combineReducers } from 'redux';  
import { map } from 'utils/index';
import { area } from 'reducers/area_select';
import { GOT_STATIONS , GOT_STATIONS_BY_CITY, GOT_STATIONS_BY_NAME, GOT_STATIONS_SCOPE, MODIFY_STATIONS_SCOPE } from 'actions/station_scope_manage';

var initial_state = {
  stations: [],
  station_list_info: [],
  station_info: [],
  station_coords: [],
  new_station_coords: [],
}

function _t(data) {
  return map(data, (text,id) => ({id, text}))
}

export function station(state = initial_state, action){
  switch (action.type) {
    case GOT_STATIONS:
      return {...state, stations: _t(action.data)};
    case GOT_STATIONS_BY_CITY:
      return { ...state, station_list_info: action.data.pagination_result};
     case GOT_STATIONS_BY_NAME:
      return {...state, station_info: action.data};
     case GOT_STATIONS_SCOPE:
      return {...state, station_coords:action.data};
     case MODIFY_STATIONS_SCOPE:
     	return {...state, new_station_coords: action.data}
    default :
      return state;
  }
}

export default combineReducers({
  station: station, 
  area: area(),
})
