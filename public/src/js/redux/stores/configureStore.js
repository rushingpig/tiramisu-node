import { createStore, applyMiddleware, compose } from 'redux';
import createLogger from 'redux-logger';
import thunk from 'redux-thunk';
import rootReducer from 'reducers/index';

if (process.env.NODE_ENV === 'production') {
  //生产环境不需要logger
  var createStoreWithMiddleware = applyMiddleware(thunk)(createStore);
} else {

  // 为了让redux-dev-tools能够显示Map和Set格式的数据
  Map.prototype.toJSON = function() {
    var obj = {};
    this.forEach((value, key) => obj[key] = value);
    return obj;
  }
  Set.prototype.toJSON = function() {
    return Array.from(this);
  }

  const logger = createLogger({
    actionTransformer: action => {
      let loggerAction = {};
      Object.keys(action).forEach(key => {
        loggerAction[key] = action[key] && action[key].toJS ? action[key].toJS() : action[key]
      });
      return {
        ...loggerAction,
        type: String(action.type)
      };
    },
    stateTransformer: state => {
        let loggerState = {};
        Object.keys(state).forEach(key => {
            loggerState[key] = state[key] && state[key].toJS ? state[key].toJS() : state[key]
        });
        return loggerState;
    }
  });
  var createStoreWithMiddleware = compose(
    applyMiddleware(thunk, logger),
    // 为了让redux-dev-tools能够显示Symbol格式的Action数据
    window.devToolsExtension ? window.devToolsExtension({
      serializeAction: (key, value) => {
        if (typeof(value) === 'symbol') return String(value);
        return value;
      }
    }) : f => f
  )(createStore);
}

const store = createStoreWithMiddleware(rootReducer);

//考虑到有些reducer中将使用到store
window.STORE = store;

export default store;