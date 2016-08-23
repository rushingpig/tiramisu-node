import * as Actions from 'actions/deliveryman';
import { core } from 'utils/index';
import { DeliverymanActionTypes1 } from 'actions/action_types';

var initial_state = {
  list: [],
  load_success: false,
  current_id: undefined,
}

export function deliveryman(Actions = DeliverymanActionTypes1){
  return function deliveryman(state = initial_state, action){
    switch (action.type) {
      case Actions.GET_ALL_DELIVERYMAN:
      case Actions.GET_CITY_DELIVERYMAN:
        return {...state, list: core.isArray(action.data) ? action.data : [], load_success: true }
      case Actions.GET_DELIVERYMAN_BY_ORDER:
        return {...state, list: core.isArray(action.data.list) ? action.data.list : [], current_id: action.data.current_id, load_success: true }
      case Actions.RESET_DELIVERYMAN:
        return {...state, list: [], load_success: false, current_id: undefined}
      default:
        return state;
    }
  }
}

