import { createStore } from 'redux';
import testApp from '../reducers/login';

export default function(){
  return createStore(testApp);
}