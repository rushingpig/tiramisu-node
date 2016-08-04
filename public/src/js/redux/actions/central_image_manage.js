import R from 'utils/request'; //Promise
import Url from 'config/url';

export const GET_IMAGE_FILE_LIST_ING = 'GET_IMAGE_FILE_LIST_ING';
export const GET_IMAGE_FILE_LIST = 'GET_IMAGE_FILE_LIST';
export function getImageFileList(){
  return R.TEST([
    {id: 1, name: '幸福西饼1', isDir: true, update_time: '2016-06-21 18:34'},
    {id: 2, name: '幸福西饼2', isDir: true, update_time: '2016-06-20 18:34'},
    {id: 3, name: '商品1.png', size: '200KB', update_time: '2016-06-18 20:34'},
    {id: 4, name: '商品2.jpg', size: '1.2M', update_time: '2016-06-18 10:34'},
    {id: 5, name: '商品2.xls', size: '1.2M', update_time: '2016-06-18 10:34'},
  ], [ GET_IMAGE_FILE_LIST_ING, GET_IMAGE_FILE_LIST ], 1000)
}