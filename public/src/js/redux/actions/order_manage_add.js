import {get, post} from '../utils/request'; //Promise
import Url from '../config/url';


export function handleSaveInfo(data){
  debugger;
  console.log(data);
}

export const GOT_ORDER_SRCS = 'GOT_ORDER_SRCS';
export function getOrderSrcs(){
  return (dispatch) => {
    return get(Url.order_srcs)
      .done(function(data){
        // dispatch({
        //   type: GOT_ORDER_SRCS,
        //   data
        // })
        dispatch({
          type: GOT_ORDER_SRCS,
          data: [
            {id: 1, name: 'A1', level: 1},
            {id: 2, name: 'A2', level: 1},
            {id: 3, name: 'A3', level: 1},
            {id: 4, name: 'B1', level: 2, parent_id: 1},
            {id: 5, name: 'B2', level: 2, parent_id: 2}
          ]
        })
      })
  }
}

export const GOT_DELIVERY_STATIONS = 'GOT_DELIVERY_CENTER';
export function getDeliveryStations() {
  return (dispatch) => {
    return get(Url.delivery_stations)
      .done(function(data){
        dispatch({
          type: GOT_DELIVERY_STATIONS,
          data
        })
      })
  }
}