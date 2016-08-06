import { GOT_ORDER_SRCS } from 'actions/order_support';
import * as Actions from 'actions/central_image_manage';
import { core, map, del, Noty } from 'utils/index';
import { REQUEST } from 'config/app.config';
import { combineReducers } from 'redux';
import clone from 'clone';

var initial_state = {
  dir_id: undefined, //当前所在目录id
  domain: 'http://qn.blissmall.net/',
  list: [],
  checked_list: [],
  loading: true,
  search_ing: false,
  view_img: null,
}

function main(state = initial_state, action){
  switch (action.type) {

    case Actions.CREATE_NEW_IMG_DIR:
      return {...state, list: [...state.list, {
        name: '',
        isDir: true,
        update_time: '-',
        editable: true,
        isNewDir: true
      }]}
    case Actions.START_SEARCH_IMG_BY_NAME:
      return {...state, search_ing: true}

    //会导致页面跳动
    // case Actions.GET_IMAGE_FILE_LIST_ING:
    //   return {...state, loading: true};
    case Actions.GET_IMAGE_FILE_LIST:
      var mb = Math.pow(1024, 2);
      action.data.forEach( n => {
        if(!n.size){
          n.size = '-'; //文件夹
        }else if(n.size >= mb){
          n.size = (n.size / mb).toFixed(0) + 'MB';
        }else if(n.size >= 1024){
          n.size = (n.size / 1024).toFixed(0) + 'KB';
        }else if(n.size > 0){
          n.size = (n.size / 1024).toFixed(3) + 'KB';
        }
        n.isDir = n.type == 'd';
      })
      return {...state, dir_id: action.dir_id, list: action.data, checked_list: [], loading: false, search_ing: false};
    case Actions.CHECK_ALL_IMG_ROW:
      state.list.forEach(n => {
        n.checked = action.checked;
      })
      return {...state, checked_list: action.checked ? state.list.map(n => n.id) : []}
    case Actions.DELETE_IMG:
      return {...state, list: [...state.list.filter( n => action.data.some(m => m != n.id) )]};

    //Row
    case Actions.CHECK_IMG_ROW:
      state.list.forEach(n => {
        if(n.id == action.id){
          n.checked = action.checked;
        }
      });
      if(action.checked){
        state.checked_list.push(action.id);
      }else{
        del(state.checked_list, n => n.id == action.id);
      }
      return {...state, checked_list: [...state.checked_list]}
    case Actions.VIEW_IMG:
      return {...state, view_img: action.data}
    case Actions.SUBMIT_NEW_IMG_DIR:
      !state.list.pop().isNewDir && Noty('error', '新建文件夹出错！');
      action.data && state.list.push({...action.data, isDir: true});
      return {...state, list: [...state.list]}
    case Actions.RENAME_FILE:
      state.list.forEach( n => {
        if(n.id == action.id){
          n.name = action.name;
        }
      })
      return {...state, list: [...state.list]}
    default:
      return state;
  }
}

var modal_state = {
  loading: true,
  move_ids: [],  //将要移动的目录id，需从tree_data中过滤掉
  tree_data: [],
  editable: false, //为true时，表示正在添加新文件夹，此时应该禁用 提交按钮
  submitting: false,
  root_id: 0,
  selected_dir_id: 0, //默认根路径
}

//有序的，无序的
function match(order, no_order){
  order.forEach( n => {
    for(var i=0; i<no_order.length; i++){
      if(no_order[i].parent_id == n.id){
        n.children = (n.children || []).concat( no_order.splice(i--, 1) );
      }
    }
    n.children && match(n.children, no_order);
  })
}
function move_modal(state = modal_state, action){
  switch(action.type){
    case Actions.SAVE_IDS_TO_BE_MOVED:
      return {...state, move_ids: action.data}
    // case Actions.GOT_ALL_IMG_DIR_ING:
    //   return {...state, loading: true}
    case Actions.GOT_ALL_IMG_DIR:

      var tree = [], no_order = [];
      action.data
        .filter( n => !state.move_ids.some( m => m == n.id ) )
        .forEach( n => {
          if(n.parent_id == state.root_id){
            tree.push(n);
          }else{
            no_order.push(n)
          }
        })
      match(tree, no_order);
      return {...state, tree_data: [{id: state.root_id, name: '全部文件', active: true, open: true, children: tree}], loading: false}
    case Actions.SELECT_DIR:
      var f = d => {
        d.active = d.id == action.id;
        if(d.id == action.id){
          d.open = !d.open;
        }
        if(d.children){
          d.children.forEach(f)
        }
      }
      state.tree_data.forEach(f);
      return {...state, selected_dir_id: action.id, tree_data: [...state.tree_data]}
    case Actions.CREATE_NEW_IMG_DIR_IN_MODAL:
      var f2 = d => {
        if(d.id == state.selected_dir_id){
          d.children = [...(d.children || []), {
            id: +new Date(),
            name: '',
            isNewDir: true
          }]
        }else if(d.children){
          d.children.forEach(f2)
        }
      }
      state.tree_data.forEach(f2);
      return {...state, tree_data: [...state.tree_data], editable: true}
    case Actions.SUBMIT_NEW_DIR_IN_MODAL:
      var f3 = (d, i, ary) => {
        //action.data 为空，则删除新建文件夹；若不为空，则覆盖
        if(!action.data){
          if(d.isNewDir){
            ary.splice(i, 1);
          }
        }else{
          if(d.isNewDir){
            d.id = action.data.id;
            d.name = action.data.name;
            delete d.isNewDir;
            return;
          }
        }
        d.children && d.children.forEach(f3);
      }
      state.tree_data.forEach(f3);
      return {...state, tree_data: [...state.tree_data], editable: false}
    case Actions.MOVE_IMG:
      if(action.key == REQUEST.ING){
        return {...state, submitting: true}
      }else if(action.key == REQUEST.SUCCESS || action.key == REQUEST.FAIL){
        return {...state, submitting: false}
      }else{
        return state;
      }
    default:
      return state;
  }
}

export default combineReducers({
  main,
  move_modal
})