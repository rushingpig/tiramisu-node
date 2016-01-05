import req from 'superagent';
import Promise from './promise';
import config from 'config/app.config';

function _end_callback(resolve, reject){
  return function(err, res){
    if(res.ok){
      if(res.body.code === config.success_code){
        resolve(res.body.data);
      }else{
        console.error(res.content || 'request error');
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

export function PUT(url, query_data, action_type){
  return (dispatch) => {
    return put(url, query_data)
      .done(function(data){
        dispatch({
          type: action_type,
          data
        })
      })
  }
}

export function TEST(data, signal, time){
  return (dispatch) => {
    return new Promise(function(resolve, reject){
      setTimeout(function(){
        resolve(dispatch({
          type: signal,
          data
        }));
      }, time || 200);
    })
  }
}