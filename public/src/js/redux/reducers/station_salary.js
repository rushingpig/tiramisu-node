import { combineReducers } from 'redux';
import * as FormActions from 'actions/station_salary';

import { area } from './area_select';

import clone from 'clone';

const stationSalaryReducers = combineReducers({
	area:area(),
})
export default stationSalaryReducers;