import { combineReducers } from 'redux';
import { map } from 'utils/index';
import { area } from 'reducers/area_select';
import { station } from 'reducers/station_scope_manage';


export default combineReducers({
	area: area(),
	station
})