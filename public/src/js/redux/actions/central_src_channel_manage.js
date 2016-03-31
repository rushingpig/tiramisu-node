import {post, del, test, GET, PUT, POST, DEL, TEST } from 'utils/request'; //Promise
import Url from 'config/url';

export const FILTER_SRC_CHANNEL = 'FILTER_SRC_CHANNEL';
export function filterSrcChannel(data){
  return {
    type: FILTER_SRC_CHANNEL,
    data
  }
}

export const HIDE_CHANNEL_PANEL = 'HIDE_CHANNEL_PANEL';
export function hideChannelPanel(){
  return {
    type: HIDE_CHANNEL_PANEL,
  }
}

export const SHOW_EDIT_SRC_CHANNEL = 'SHOW_EDIT_SRC_CHANNEL';
export function showEditSrcChannel(data){
  return {
    type: SHOW_EDIT_SRC_CHANNEL,
    data
  }
}

export const SHOW_ADD_SRC_CHANNEL = 'SHOW_ADD_SRC_CHANNEL';
export function showAddSrcChannel( level ){
  return {
    type: SHOW_ADD_SRC_CHANNEL,
    level
  }
}

export const ADD_SRC_CHANNEL = 'ADD_SRC_CHANNEL';
export function addSrcChannel( data ){
  return POST(Url.add_order_src.toString(), data, ADD_SRC_CHANNEL);
  // return TEST(null, [
  //   {type: ADD_SRC_CHANNEL, key: 0},  //立即派发
  //   {type: ADD_SRC_CHANNEL, key: 1}   //2000毫秒后派发
  // ], 2000);
}

export const UPDATE_SRC_CHANNEL = 'UPDATE_SRC_CHANNEL';
export function updateSrcChannel( id, data ){
  return PUT(Url.update_order_src.toString(id), data, UPDATE_SRC_CHANNEL);
  // return TEST(null, [
  //   {type: UPDATE_SRC_CHANNEL, key: 0},  //立即派发
  //   {type: UPDATE_SRC_CHANNEL, key: 1}   //2000毫秒后派发
  // ], 2000);
}

export const DELETE_SRC_CHANNEL = 'DELETE_SRC_CHANNEL';
export function deleteSrcChannel( id ){
  return DEL(Url.delete_order_src.toString(id), null, DELETE_SRC_CHANNEL);
  // return TEST(null, [
  //   {type: DELETE_SRC_CHANNEL, key: 0},  //立即派发
  //   {type: DELETE_SRC_CHANNEL, key: 1}   //2000毫秒后派发
  // ], 200);
}