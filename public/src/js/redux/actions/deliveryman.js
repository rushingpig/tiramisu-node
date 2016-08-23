import { GET, TEST } from 'utils/request'; //Promise
import Url from 'config/url';
import { DeliverymanActionTypes1 } from 'actions/action_types';

export default function Deliveryman(ActionTypes = DeliverymanActionTypes1){
  return {
    getAllDeliveryman: () => {
      return GET(Url.deliveryman.toString(), null, ActionTypes.GET_ALL_DELIVERYMAN);
    },

    getCityDeliveryman: (cityid) => {
      return GET(Url.deliveryman_city.toString(cityid), null, ActionTypes.GET_CITY_DELIVERYMAN);
    },

    getDeliverymanByOrder: (orderId) => {
      return GET(Url.order_deliverymans.toString(orderId), null, ActionTypes.GET_DELIVERYMAN_BY_ORDER);
    },

    resetDeliveryman: () => {
      return {
        type: ActionTypes.RESET_DELIVERYMAN,
      }
    }   
  }
}