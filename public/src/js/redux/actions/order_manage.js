import {get, post} from '../utils/request'; //Promise
import Url from '../config/url';


export const START_DATE_CHANGE = 'START_DATE_CHANGE';
export const DISTRIBUTE_DATE_CHANGE = 'DISTRIBUTE_DATE_CHANGE';

export function startDateChange(date){
  return {
    type: START_DATE_CHANGE,
    date
  }
}

export function deliveryDateChange(date){
  return {
    type: DISTRIBUTE_DATE_CHANGE,
    date
  }
}