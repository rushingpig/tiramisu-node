import { GOT_ORDER_SRCS } from 'actions/order_support';
import * as Actions from 'actions/central_image_manage';
import { core, map } from 'utils/index';
import { REQUEST } from 'config/app.config';
import clone from 'clone';

var initial_state = {
  list: [],
  loading: true,
  search_ing: false,
}

export default function main(state = initial_state, action){
  switch (action.type) {

    case Actions.GET_IMAGE_FILE_LIST_ING:
      return {...state, loading: true};
    case Actions.GET_IMAGE_FILE_LIST:
      return {...state, list: action.data, loading: false};

    default:
      return state;
  }
}