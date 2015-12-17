import { createStore, applyMiddleware } from 'redux';
import createLogger from 'redux-logger';
import thunk from 'redux-thunk';
import rootReducer from '../reducers/index';

if(process.env.NODE_ENV == 'production'){
  //生产环境不需要logger
  var createStoreWithMiddleware = applyMiddleware(
    thunk
  )(createStore);
}else{
  var createStoreWithMiddleware = applyMiddleware(
    thunk,
    createLogger()
  )(createStore);
}

export default function(){
  return createStoreWithMiddleware(rootReducer);
}