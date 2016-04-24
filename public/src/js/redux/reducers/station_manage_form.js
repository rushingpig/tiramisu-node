import { combineReducers } from 'redux';
import { area } from './area_select';
import AreaActions from 'actions/area';
import * as FormActions from 'actions/station_manage_form';
import {getGlobalStore} from 'stores/getter';
import clone from 'clone';
import { UPDATE_PATH } from 'redux-simple-router';

var initial_state = {
  data: {},
  save_ing: false,
  save_success: true,
  submit_ing: false,
}; 

function stationEditForm(state = initial_state, action) {
  var store = getGlobalStore();
    switch(action.type){
      case UPDATE_PATH:
        return {...initial_state};
      case FormActions.GET_STATION_BY_ID:
        return function(){
          var data = action.data[0];
          var {getCities, getDistricts} = AreaActions();
          store.dispatch(getCities(data.province_id));
          store.dispatch(getDistricts(data.city_id));
          return {...state, data: data}
        }()
          case FormActions.SAVE_STATION_INFO_ING:
          return {...state, save_ing: true }
      case FormActions.SAVE_STATION_INFO_SUCCESS:
        return {...state, save_success: true, save_ing: false }
      case FormActions.SAVE_STATION_INFO_FAIL:
        return {...state, save_success: false, save_ing: false }
      case FormActions.SUBMIT_STATION_ING:
        return {...state, submit_ing: true}
      case FormActions.SUBMIT_STATION_COMPLETE:
        return {...state, submit_ing: true}
      default:
        return state;
    }
}

const stationEditReducer = combineReducers({
    area: area(),
    stationEditForm,
})

export default stationEditReducer;
