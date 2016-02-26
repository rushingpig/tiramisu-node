import { combineReducers } from 'redux';
import { area } from 'reducers/area_select';


export default combineReducers({
  area: area()
})
