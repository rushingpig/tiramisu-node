import { combineReducers } from 'redux';
import { map } from 'utils/index';
import { area } from 'reducers/area_select';
import { GOT_STATIONS , GOT_STATIONS_BY_CITY } from 'actions/stations';

var initial_state = {
  stations: [],
  stationsOfCity: [],
}

function _t(data) {
  return map(data, (text,id) => ({id, text}))
}

export function station(state = initial_state, action){
  switch (action.type) {
    case GOT_STATIONS:
      return {...state, stations: _t(action.data) };
    case GOT_STATIONS_BY_CITY:
      return { ...state, stationsOfCity: action.data};
    default :
      return state;
  }
}

export default combineReducers({
  station: station, 
  area: area(),
})
