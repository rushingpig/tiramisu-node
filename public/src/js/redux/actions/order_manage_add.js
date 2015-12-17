import {get, post} from '../utils/request'; //Promise
import Url from '../config/url';

export const DISTRIBUTE_TYPE_CHANGE = 'DISTRIBUTE_TYPE_CHANGE';

export function distributeTypeChange(method) {
  return {
    type: DISTRIBUTE_TYPE_CHANGE,
    method
  }
}

export function handleSaveInfo(data){
  console.log(data);
}