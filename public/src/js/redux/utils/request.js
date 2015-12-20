import req from 'superagent';
import Promise from '../utils/promise';
import config from '../config/app.config';

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