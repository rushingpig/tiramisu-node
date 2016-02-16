import { createStore, applyMiddleware, compose } from 'redux';
import createLogger from 'redux-logger';
import thunk from 'redux-thunk';
import rootReducer from 'reducers/index';
import history from 'history_instance';
import { syncReduxAndRouter } from 'redux-simple-router';

if(process.env.NODE_ENV == 'production'){
  //生产环境不需要logger
  var createStoreWithMiddleware = applyMiddleware(
    thunk
  )(createStore);
}else{
  var createStoreWithMiddleware = compose(
    applyMiddleware(
      thunk,
      createLogger()
    ),
    window.devToolsExtension ? window.devToolsExtension() : f => f
  )(createStore);
}

const store = createStoreWithMiddleware(rootReducer);
syncReduxAndRouter(history, store);

export default store;