import { createStore, applyMiddleware, compose } from 'redux';
import createLogger from 'redux-logger';
import thunk from 'redux-thunk';
import rootReducer from 'reducers/index';


if (process.env.NODE_ENV === 'production') {
  //生产环境不需要logger
  var createStoreWithMiddleware = applyMiddleware(thunk)(createStore);
} else {
  const logger = createLogger({
    actionTransformer: action => ({
      ...action,
      type: String(action.type)
    })
  });
  var createStoreWithMiddleware = compose(
    applyMiddleware(thunk, logger),
    window.devToolsExtension ? window.devToolsExtension() : f => f
  )(createStore);
}

const store = createStoreWithMiddleware(rootReducer);

//考虑到有些reducer中将使用到store
window.STORE = store;

export default store;