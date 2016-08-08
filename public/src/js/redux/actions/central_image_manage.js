import R from 'utils/request'; //Promise
import Url from 'config/url';
import { dateFormat } from 'utils/index';

export const GET_IMAGE_FILE_LIST_ING = 'GET_IMAGE_FILE_LIST_ING';
export const GET_IMAGE_FILE_LIST = 'GET_IMAGE_FILE_LIST';
export function getImageFileList(params){
  return dispatch => {
    dispatch({type: GET_IMAGE_FILE_LIST_ING});
    return R.get(Url.images.toString(), params)
      .done(function(data) {
        dispatch({
          type: GET_IMAGE_FILE_LIST,
          data,
          dir_id: params && params.parent_id
        })
      })
  }
  // return R.TEST([
  //   {id: 1, name: '幸福西饼1', isDir: true, update_time: '2016-06-21 18:34'},
  //   {id: 2, name: '幸福西饼2', isDir: true, update_time: '2016-06-20 18:34'},
  //   {id: 3, name: '商品1.png', url: '400x250', size: 171965, update_time: '2016-06-18 20:34'},
  //   {id: 4, name: '商品2.jpg', url: '400x250', size: 171965, update_time: '2016-06-18 10:34'},
  //   {id: 5, name: '商品2.xls', url: '400x250', size: 171965, update_time: '2016-06-18 10:34'},
  // ], [ GET_IMAGE_FILE_LIST_ING, GET_IMAGE_FILE_LIST ], 500)
}

export const START_SEARCH_IMG_BY_NAME = 'START_SEARCH_IMG_BY_NAME';
export function startSearchImgByNameIng() {
  return {
    type: START_SEARCH_IMG_BY_NAME
  }
}

export const SUBMIT_IMG_INFO = 'SUBMIT_IMG_INFO';
export function submitImgInfo(data){
  return dispatch =>
    R.post(Url.images.toString(), data)
      .done( data => {
        dispatch({
          type: SUBMIT_IMG_INFO,
          data
        })
      })
}

export const CHECK_ALL_IMG_ROW = 'CHECK_ALL_IMG_ROW';
export function checkAll(checked){
  return {
    type: CHECK_ALL_IMG_ROW,
    checked
  }
}

export const CREATE_NEW_IMG_DIR = 'CREATE_NEW_IMG_DIR';
export function createNewDir(){
  return {
    type: CREATE_NEW_IMG_DIR,
  }
}

export const SUBMIT_NEW_IMG_DIR = 'SUBMIT_NEW_IMG_DIR';
export function submitNewDir({name, parent_id}){
  return dispatch => {
    if(name){
      return R.post(Url.create_img_dir.toString(), {parent_id, name})
        .done( data => {
          dispatch({
            type: SUBMIT_NEW_IMG_DIR,
            data: {...data, name, parent_id}
          })
        })
    }else{
      dispatch({
        type: SUBMIT_NEW_IMG_DIR,
        data: null,
      })
    }
  }
  // return R.TEST(name ? {
  //   id: +new Date(),
  //   name,
  //   isDir: true,
  //   update_time: dateFormat(new Date(), 'yyyy-MM-dd hh:mm')
  // } : null, SUBMIT_NEW_IMG_DIR)
}
export const GET_NEW_IMG_DIR = 'GET_NEW_IMG_DIR';
export function getNewDir({name, parent_id}){
  return dispatch => {
    return R.post(Url.create_img_dir.toString(), {parent_id, name})
  }
}

export const RENAME_FILE = 'RENAME_FILE';
export function rename({id, name}){
  return dispatch =>
    R.put(Url.rename_img.toString(), {id, name})
      .done( data => {
        dispatch({
          type: RENAME_FILE,
          id,
          name
        })
      })
}

export const DELETE_IMG = 'DELETE_IMG';
export function deleteImg(ids){
  return dispatch =>
    R.put(Url.delete_img.toString(), {ids})
      .done( data => {
        dispatch({
          type: DELETE_IMG,
          data: ids,
        })
      })
  // return R.TEST(ids, DELETE_IMG)
}

export const MOVE_IMG = 'MOVE_IMG';
export function moveImg(id, ids){
  return R.PUT(Url.move_img.toString(), {id, ids}, MOVE_IMG)
  // console.log(id, ids);
  // return R.TEST(null, [
  //   {type: MOVE_IMG, key: 0},
  //   {type: MOVE_IMG, key: 1},
  // ], 1500);
}

export const CHECK_IMG_ROW = 'CHECK_IMG_ROW';
export function checkImgRow(id, checked){
  return {
    type: CHECK_IMG_ROW,
    id,
    checked
  }
}
export const VIEW_IMG = 'VIEW_IMG';
export function viewImg(img){
  return {
    type: VIEW_IMG,
    data: img
  }
}

export const SAVE_IDS_TO_BE_MOVED = 'SAVE_IDS_TO_BE_MOVED';
export function saveIdsToBeMoved(ids){
  return {
    type: SAVE_IDS_TO_BE_MOVED,
    data: ids
  }
}

export const GOT_ALL_IMG_DIR = 'GOT_ALL_IMG_DIR';
export function getAllImgDir(){
  return R.GET(Url.all_img_dir.toString(), null, GOT_ALL_IMG_DIR);
  // return R.TEST([
  //   {id: 1, name: '幸福西饼1', parent_id: 2},
  //   {id: 11, name: '幸福西饼1-1', parent_id: 1},
  //   {id: 111, name: '幸福西饼1-1-1', parent_id: 11},
  //   {id: 3, name: '幸福西饼3', parent_id: 2},
  //   {id: 33, name: '幸福西饼3-1', parent_id: 3},
  //   {id: 4, name: '幸福西饼4', parent_id: 2},
  // ], GOT_ALL_IMG_DIR, 1000)
}

//modal
export const CREATE_NEW_IMG_DIR_IN_MODAL = 'CREATE_NEW_IMG_DIR_IN_MODAL';
export function createNewDirInModal(){
  return {
    type: CREATE_NEW_IMG_DIR_IN_MODAL
  }
}

export const SELECT_DIR = 'SELECT_DIR';
export function selectDir(id){
  return {
    type: SELECT_DIR,
    id
  }
}
export const SUBMIT_NEW_DIR_IN_MODAL = 'SUBMIT_NEW_DIR_IN_MODAL';
export function submitNewDirInModal(parent_id, e){
  var name = e.target.value;
  return dispatch => {
    if(name){
      return R.post(Url.create_img_dir.toString(), {parent_id, name})
        .done( data => {
          dispatch({
            type: SUBMIT_NEW_DIR_IN_MODAL,
            data: {...data, name}
          })
        })
    }else{
      dispatch({
        type: SUBMIT_NEW_DIR_IN_MODAL,
        data: null,
      })
    }
  }
  // return R.TEST(e.target.value ? {
  //   id: dir_info.id,
  //   name: e.target.value,
  // } : null, SUBMIT_NEW_DIR_IN_MODAL)
}