import req from 'superagent';
import Promise from '../utils/promise';

function _end_callback(err, res){
  if(res.ok){
    if(res.body.code === '0000'){
      resolve(res.body.data);
    }else{
      reject(res.body.msg, res.body.code);
    }
  }else{
    reject(res.text || 'error');
  }
}

export function get(url, data){
  return new Promise(function(resolve, reject){
    req.get(url)
      .query(data)
      .end(_end_callback);
  });
}

export function post(url, data){
  return new Promise(function(resolve, reject){
    req.post(url)
      .send(data)
      .end(_end_callback);
  });
}