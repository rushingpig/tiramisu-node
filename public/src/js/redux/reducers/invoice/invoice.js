import { dateFormat, map } from 'utils/index';
import { combineReducers } from 'redux';
import { REQUEST, order_status, ACCESSORY_CATE_ID } from 'config/app.config';
import { area } from 'reducers/area_select';
import * as OrderSupportReducers from 'reducers/order_support';


var main_state = {

}

/*function main(state = main_state, action){
	switch(action.type){

		default:
			return state;
	}
}*/

export default combineReducers({
	area: area(), 
	...OrderSupportReducers,
})