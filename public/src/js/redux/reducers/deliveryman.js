import * as Actions from 'actions/deliveryman';
import { core } from 'utils/index';

var initial_state = {
  list: [],
  load_success: false,
}

export function deliveryman(state = initial_state, action){
  switch (action.type) {

    case Actions.GET_ALL_DELIVERYMAN:
      return {...state, list: core.isArray(action.data) ? action.data : [], load_success: true }

    default:
      return state;
  }
}
