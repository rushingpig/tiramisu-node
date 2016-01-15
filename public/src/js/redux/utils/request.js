import req from 'superagent';
import Promise from './promise';
import { SUCCESS_CODE, REQUEST } from 'config/app.config';
import { core } from 'utils/index';

function _end_callback(resolve, reject){
  return function(err, res){
    if(res.ok){
      if(res.body.code === SUCCESS_CODE){
        resolve(res.body.data);
      }else{
        console.error(res.body.msg || 'request error');
        reject(res.body.msg, res.body.code);
      }
    }else{
      reject(res.text || 'error');
    }
  };
}

//基本封装
export function get(url, data){
  return new Promise(function(resolve, reject){
    req.get(url)
      .query(data)
      .set('X-Requested-With', 'XMLHttpRequest')
      .end(_end_callback(resolve, reject));
  });
}

export function post(url, data){
  return new Promise(function(resolve, reject){
    req.post(url)
      .send(data)
      .set('X-Requested-With', 'XMLHttpRequest')
      .end(_end_callback(resolve, reject));
  });
}

export function put(url, data){
  return new Promise(function(resolve, reject){
    req.put(url)
      .send(data)
      .set('X-Requested-With', 'XMLHttpRequest')
      .end(_end_callback(resolve, reject));
  });
}

//最简封装
export function GET(url, query_data, action_type){
  return (dispatch) => {
    return get(url, query_data)
      .done(function(data){
        dispatch({
          type: action_type,
          data
        })
      })
  }
}

export function POST(url, query_data, action_type){
  return (dispatch) => {
    return post(url, query_data)
      .done(function(data){
        dispatch({
          type: action_type,
          data
        })
      })
  }
}

export function PUT(url, send_data, action_type){
  return (dispatch, getState) => {
    //key: 0->正在处理，1->成功，2->失败 (减少信号量)
    dispatch({
      type: action_type,
      key: REQUEST.ING,
    });
    return put(url, send_data)
      .done(function(){
        dispatch({
          type: action_type,
          key: REQUEST.SUCCESS
        })
      })
      .fail(function(){
        dispatch({
          type: action_type,
          key: REQUEST.FAIL
        })
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
export function TEST(data, signal, time, _resolve = true){
  return (dispatch) => {
    //智能派发
    var _dispatch = function(s){
      if(core.isObject(s)){
        return dispatch(s);
      }else if(core.isString(s)){
        return dispatch({
          type: s,
          data
        });
      }
    }

    if(core.isArray(signal)){
      if(signal.length == 2){
        _dispatch(signal[0]);
        signal = signal[1];
      }else{
        throw Error('error params "signal" in request method : "TEST"');
      }
    }
    return new Promise(function(resolve, reject){
      setTimeout(function(){
        _resolve ? resolve(_dispatch(signal)) : reject(_dispatch(signal));
      }, time || 200);
    })
  }
}