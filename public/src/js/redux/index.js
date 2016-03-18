import '../../sass/style.sass';
import React from 'react';
import {render} from 'react-dom';
import App from './containers/app';
import { Provider } from 'react-redux';
import store from './stores/configureStore';
import history from 'history_instance';
import { syncReduxAndRouter } from 'redux-simple-router';

syncReduxAndRouter(history, store);

render((
  <Provider store={store}>
    <App />
  </Provider>
), document.getElementById('app'));