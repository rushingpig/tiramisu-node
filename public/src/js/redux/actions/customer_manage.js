import R from 'utils/request'; //Promise
import Url from 'config/url';

export const GET_CUSTOMER_LIST = 'GET_CUSTOMER_LIST';
export function getCustomerList(data){
  return R.GET(Url.customer_list.toString(), data, GET_CUSTOMER_LIST);
  // return R.TEST({
  //   "list": [
  //     {
  //       "address": 'xx省xx市xx区xxxx',
  //       "auth_id": 13300002222,
  //       "birthday": '1990-2-3',
  //       "is_in_blackList": 1,
  //       "nick_name": '张三',
  //       "passworded": 123456,
  //       "sex": '男',
  //       "uuid": 12340239420492034
  //     }
  //   ],
  //   "page_no": 0,
  //   "total": 1,
  // }, GET_CUSTOMER_LIST);
}

export const SELECT_CUSTOMER = 'SELECT_CUSTOMER';
export const GET_CUSTOMER_INFO = 'GET_CUSTOMER_INFO';
export function getCustomerInfo(uuid){
  return dispatch => {
    dispatch({
      type: SELECT_CUSTOMER,
      uuid
    });
    return R.GET(Url.customer.toString(uuid), null, GET_CUSTOMER_INFO)(dispatch);
    // return R.TEST({
    //   "address": 'xx省xx市xx区xxxx',
    //   "auth_id": 13300002222,
    //   "birthday": '1990-2-3',
    //   "is_in_blackList": 1,
    //   "avatar": 'http://placehold.it/80x80',
    //   "nick_name": '张三',
    //   "passworded": 123456,
    //   "sex": '男',
    // }, GET_CUSTOMER_INFO, 5000)(dispatch);
  }
}

export const GET_CUSTOMER_LOGS = 'GET_CUSTOMER_LOGS';
export function getCustomerLogs(data){
  return R.GET(Url.customer_logs.toString(data.uuid), data, GET_CUSTOMER_LOGS)
  // return R.TEST({
  //   last_id: 0,
  //   list: [{
  //     "datetime": '2016-10-20',
  //     "id": 123,
  //     "ip": '192.234.23.234',
  //     "visit_src": '网页'
  //   }]
  // }, GET_CUSTOMER_LOGS, 2000)
}

export const ADD_TO_BLACK_LIST = 'ADD_TO_BLACK_LIST';
export function addToBlackList(uuid){
  return dispatch =>
    R.post(Url.customer.toString(uuid))
      .done( () => {
        dispatch({
          type: ADD_TO_BLACK_LIST,
          uuid
        })
      })
  // return dispatch =>
  //   R.test(true, 2000)(dispatch)
  //     .done( () => dispatch({
  //       type: ADD_TO_BLACK_LIST,
  //       uuid
  //     }))
}

export const HIDE_DETAIL_MODAL = 'HIDE_DETAIL_MODAL';
export function hideDetailModal(){
  return {
    type: HIDE_DETAIL_MODAL
  }
}