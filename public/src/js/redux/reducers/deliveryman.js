import * as Actions from 'actions/deliveryman';

var initial_state = {
  list: [],
  load_success: false,
}

export function deliveryman(state = initial_state, action){
  switch (action.type) {

    case Actions.GET_ALL_DELIVERYMAN:
      return {...state, list: action.data, load_success: true }

    default:
      return state;
  }
}
