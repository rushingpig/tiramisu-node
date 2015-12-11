import React from 'react';
import {render} from 'react-dom';
import App from './containers/app';
import { Provider } from 'react-redux';
import configureStore from './stores/configureStore';

const store = configureStore();

render((
  <Provider store={store}>
    <App />
  </Provider>
), document.getElementById('app'));