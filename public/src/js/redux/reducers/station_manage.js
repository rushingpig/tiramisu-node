import { combineReducers } from 'redux';
import { map, core } from 'utils/index';
import { area } from 'reducers/area_select';
import * as STATIONACTION from 'actions/station_manage';
import * as FormActions from 'actions/order_manage_form';
import { UPDATE_PATH } from 'redux-simple-router';

var get_state = {
  loading: true,
  total: 0,
  name_list: [],
  list: [],
  checked_station_ids: [],
  checked_stations: [],
  // editable: false,
  active_station_id: '',
}

export function stations(state = get_state, action){
  switch (action.type) {
    case UPDATE_PATH:
      return get_state;
    case STATIONACTION.GET_ALL_STATIONS_NAME:
      return {...state, name_list: map(action.data, n => n)};
    case STATIONACTION.GET_STATION_LIST:
    case STATIONACTION.GET_STATION_LIST_BY_SCOPE_SIGNAL:
      return {...state, 
        total: typeof action.data.total == 'undefined'
            ? (action.data.list ? action.data.list.length : 0)
            : action.data.total,
        loading: false,
        list: action.data.list || []
      }
    case STATIONACTION.GET_STATION_LIST_BY_ID:
      return {...state, total:action.data.length, loading: false, list: action.data}
    case STATIONACTION.GET_STATIONS_BY_NAME:
      return {...state, list: core.isArray(action.data) ? action.data : [] , total: action.data.length || 0};
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
    case STATIONACTION.ACTIVE_STATION:
      return {...state, active_station_id: action.station_id};
    case STATIONACTION.UNACTIVE_STATION:
      return {...state, active_station_id: ''}; 
    default :
      return state;
  }
}
export default combineReducers({
	area: area(),
	stations,
})