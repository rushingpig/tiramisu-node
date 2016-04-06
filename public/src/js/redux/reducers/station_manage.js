import { combineReducers } from 'redux';
import { map } from 'utils/index';
import { area } from 'reducers/area_select';
import * as STATIONACTION from 'actions/station_manage';
import * as FormActions from 'actions/order_manage_form';

function _t(data) {
  return map(data, (text,id) => ({id, text}))
}

var get_state = {
  total: 0,
  name_list: [],
  list: [],
  checked_station_ids: [],
  checked_stations: [],
  editable: false,
}

export function stations(state = get_state, action){
  switch (action.type) {
    case STATIONACTION.GET_ALL_STATIONS_NAME:
      return {...state, name_list: _t(action.data)};
    case STATIONACTION.GET_STATION_LIST:
      return {...state, total:action.data.count_result[0].total, list: action.data.pagination_result}
    case STATIONACTION.GET_STATION_LIST_BY_ID:
      return {...state, list: [...action.data],total: 1};
    case STATIONACTION.GET_STATIONS_BY_NAME:
      return {...state, list: action.data, total: 1};
    case STATIONACTION.ADD_STATION:
      return {...state, list: action.data};
    case STATIONACTION.DELETE_STATION:
      return {...state, list: state.list.filter(function(n,index){
        return action.data !== n.station_id;
      })};
    case STATIONACTION.DELETE_MULTI_STATION:
      return {...state, list: state.list.filter(function(n,index) {
        return state.checked_stations.indexOf(n) === -1;
      })};
    case STATIONACTION.CHECK_STATION:
      return (function(){
        var checked_station_ids = [];
        var checked_stations = [];
        state.list.forEach(n => {
          if(n.station_id == action.station_id){
            n.checked = action.checked;
          }
          if(n.checked){
            checked_station_ids.push(n.station_id);
            checked_stations.push(n);
          }
        })
        return {...state, checked_station_ids, checked_stations};
      })();
    case STATIONACTION.CHECK_ALL_STATIONS:
      return (function(){
        var checked_station_ids = [];
        var checked_stations = [];
        state.list.forEach(n => {
          n.checked = action.checked;
          if(action.checked){
            checked_station_ids.push(n.station_id);
            checked_stations.push(n);
          }
        })
        return {...state, checked_station_ids, checked_stations};
      })();
    case STATIONACTION.OPEN_EDIT:
      return {...state, editable: true};
    case STATIONACTION.CLOSE_EDIT:
      return {...state, editable: false}; 
    default :
      return state;
  }
}
export default combineReducers({
	area: area(),
	stations,
})