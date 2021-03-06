import req from 'superagent';
import Promise from './promise';
import { SUCCESS_CODE, NO_MORE_CODE, REQUEST, EXPIRE_CODE } from 'config/app.config';
import { core } from 'utils/index';

function _end_callback(resolve, reject) {
  return function(err, res) {
    if (err) {
      console.error(err);
      reject('请求失败！');
      return;
    }
    if (res.ok) {
      var { code, msg, data } = res.body;
      if (code === SUCCESS_CODE) {
        resolve(data, msg);
      } else if (code === NO_MORE_CODE) {
        resolve(data);
      } else if (code === EXPIRE_CODE) {
        location.href = location.href;
      } else {
        console.error(msg || 'request error');
        reject(msg, code);
      }
    } else {
      reject(res.text || 'error');
    }
  };
}

//基本封装
export function get(url, data) {
  var r;
  var p = new Promise(function(resolve, reject) {
    r = req.get(url)
      .query(data)
      .set('X-Requested-With', 'XMLHttpRequest')
      .end(_end_callback(resolve, reject));
  });
  p.abort = r.abort.bind(r);
  return p;
}

export function post(url, data) {
  return new Promise(function(resolve, reject) {
    req.post(url)
      .send(data)
      .set('X-Requested-With', 'XMLHttpRequest')
      .end(_end_callback(resolve, reject));
  });
}

export function put(url, data) {
  return new Promise(function(resolve, reject) {
    req.put(url)
      .send(data)
      .set('X-Requested-With', 'XMLHttpRequest')
      .end(_end_callback(resolve, reject));
  });
}

export function del(url, data) {
  return new Promise(function(resolve, reject) {
    req.del(url)
      .send(data)
      .set('X-Requested-With', 'XMLHttpRequest')
      .end(_end_callback(resolve, reject));
  });
}

//最简封装
export function GET(url, query_data, action_type) {
  return (dispatch) => {
    return get(url, query_data)
      .done(function(data) {
        dispatch({
          type: action_type,
          data
        })
      })
  }
}

function submit( req ){
  return (url, send_data, action_type) => {
    return (dispatch, getState) => {
      //key: 0->正在处理，1->成功，2->失败 (减少信号量)
      dispatch({
        type: action_type,
        key: REQUEST.ING,
      });
      return req(url, send_data)
        .done(function(data){
          dispatch({
            type: action_type,
            key: REQUEST.SUCCESS,
            data
          })
        })
        .fail(function(msg, code){
          dispatch({
            type: action_type,
            key: REQUEST.FAIL,
            msg,
            code
          })
        })
    }
  }
}

export function POST(url, send_data, action_type){
  return submit(post)(url, send_data, action_type)
}
export function PUT(url, send_data, action_type){
  return submit(put)(url, send_data, action_type)
}
export function DEL(url, send_data, action_type){
  return submit(del)(url, send_data, action_type)
}

/**
 * 模拟普通ajax的过程
 * @param  {Boolean} ajax_status true代表成功，false代表失败
 * @param  {[type]} ajax_time   ajax 持续时间
 */
export function test(ajax_status = true, ajax_time = 2000, data) {
  return dispatch => {
    return new Promise(function(resolve, reject) {
      setTimeout(function() {
        dispatch({
          type: '__JUST_A_TEST_ACTION'
        });
        ajax_status ? resolve(data) : reject(data);
      }, ajax_time);
    })
  }
}
/**
 * @param {Object} data
 * @param {Array<String/Object>, String/Object} 
 *    signal : 当为Array时，会直接先派发第一个信号，然后延时后派发第二个信号，用于模拟提交的过程
 *    为String时：代表纯粹的信号名，
 *    当为Object时：表示已封装的信号对象 eg: {type: XXXXX, key: x}，直接可dispatch，这里为了
 *      减少信号量，采用了type名相同，key值区分的办法，来达到减少信号量的目的
 * @param {Number} time
 * @package {Boolean} _resolve : 模拟成功还是失败
 */
export function TEST(data, signal = '没指定信号吧..', time = 200, _resolve = true) {
  return (dispatch) => {
    //智能派发
    var _dispatch = function(s) {
      if (core.isObject(s)) {
        return dispatch(s);
      } else if (core.isString(s)) {
        return dispatch({
          type: s,
          data
        });
      }
    }

    if (core.isArray(signal)) {
      if (signal.length == 2) {
        _dispatch(signal[0]);
        signal = signal[1];
      } else {
        throw Error('error params "signal" in request method : "TEST"');
      }
    }
    return new Promise(function(resolve, reject) {
      setTimeout(function() {
        _resolve ? resolve(_dispatch(signal)) : reject(_dispatch(signal));
      }, time);
    })
  }
}

export function DEL(url, send_data, action_type){
  return (dispatch, getState) => {
    //key: 0->正在处理，1->成功，2->失败 (减少信号量)
    dispatch({
      type: action_type,
      key: REQUEST.ING,
    });
    return del(url, send_data)
      .done(function(data){
        dispatch({
          type: action_type,
          key: REQUEST.SUCCESS,
          data
        })
      })
      .fail(function(msg, code){
        dispatch({
          type: action_type,
          key: REQUEST.FAIL,
          msg,
          code
        })
      })
  }
}

export default {
  get,
  post,
  put,
  del,
  GET,
  POST,
  PUT,
  DEL,
  test,
  TEST
}