import { GOT_ORDER_SRCS } from 'actions/order_support';
import * as Actions from 'actions/central_src_channel_manage';
import { core, map } from 'utils/index';
import { REQUEST } from 'config/app.config';
import clone from 'clone';

var initial_state = {
  search_ing: true,
  channels_one: [],
  all_order_srcs: [], //所有(按一级渠道)
  all_filtered_order_srcs: [], //所有按条件过滤出来的
  order_srcs_show: [], //当前页展示的
  page_no: 0,
  page_size: 10,
  total: 0,

  show_edit_panel: false,
  edit_channel_data: null,
  level: undefined,
  submitting: false,
}

export default function main(state = initial_state, action){
  switch (action.type) {

    case GOT_ORDER_SRCS:
      var l1 = [], l2 = [];
      var order_srcs = core.isArray(action.data) ? action.data : [];
      order_srcs.forEach(n => {
        n.level == 1 ? l1.push(n) : l2.push(n);
      })
      l2.forEach(n => {
        for( var i = 0,len = l1.length; i < len; i++){
          if( l1[i].id == n.parent_id ){
            l1[i].srcs = [...(l1[i].srcs || []), n];
            break;
          }
        }
      })
      return {
        ...state,
        search_ing: false,
        total: l1.length,
        channels_one: map(l1, ({name, id}) => ({id, text: name})),
        all_order_srcs: l1,
        all_filtered_order_srcs: l1,
        order_srcs_show: l1.slice(state.page_no * state.page_size, (state.page_no + 1) * state.page_size),
      }

    case Actions.FILTER_SRC_CHANNEL:
      var filter_results;
      //分两种过滤情况
      if( action.data.page_no >= 0 ){
        return {
          ...state,
          page_no: action.data.page_no,
          order_srcs_show: state.all_filtered_order_srcs.slice(
            action.data.page_no * state.page_size, (action.data.page_no + 1) * state.page_size
          )
        }
      }else if(action.data.src_name || action.data.channel_id){
        filter_results = state.all_order_srcs.filter( n => {
          if( action.data.src_name ){
            let { src_name } = action.data;
            return n.name.indexOf(src_name) != -1 || (n.srcs || []).some( m => m.name.indexOf(src_name) != -1 );
          }else{
            //按渠道搜索有这样一个规则：
            return n.id == action.data.channel_id
          }
        })
      }else{
        //展示所有
        filter_results = state.all_order_srcs;
      }
      return {
        ...state,
        page_no: 0, //应该置0
        total: filter_results.length,
        all_filtered_order_srcs: filter_results,
        order_srcs_show: filter_results.slice(0, state.page_size),
        show_edit_panel: false,
        edit_channel_data: null,
        level: undefined,
      }

    case Actions.HIDE_CHANNEL_PANEL:
      return {...state, show_edit_panel: false}
    case Actions.SHOW_EDIT_SRC_CHANNEL:
      return (function(){
        var active_id = action.data.id;
        var tmp = clone(state.order_srcs_show);
        tmp.forEach( n => {
          n.active = n.id == active_id;
          n.srcs && n.srcs.forEach( m => {
            m.active = m.id == active_id;
          })
        })
        return {...state, order_srcs_show: tmp, show_edit_panel: true, edit_channel_data: action.data, level: action.data.level}
      })();
    case Actions.SHOW_ADD_SRC_CHANNEL:
      return (function(){
        var tmp = clone(state.order_srcs_show);
        tmp.forEach( n => {
          n.active = false;
          n.srcs && n.srcs.forEach( m => {
            m.active = false;
          })
        })
        return {...state, order_srcs_show: tmp, show_edit_panel: true, edit_channel_data: null, level: action.level}
      })();

    case Actions.ADD_SRC_CHANNEL:
    case Actions.UPDATE_SRC_CHANNEL:
      return (function(){
        if(action.key == REQUEST.ING){
          return {...state, submitting: true}
        }else if(action.key == REQUEST.SUCCESS){
          return {...state, submitting: false, show_edit_panel: false}
        }else if(action.key == REQUEST.FAIL){
          return {...state, submitting: false}
        }else{
          return state;
        }
      })();

    case Actions.DELETE_SRC_CHANNEL:
      return (function(){
        if(action.key == REQUEST.SUCCESS || action.key == REQUEST.FAIL){
          return {
            ...state,
            show_edit_panel: false,
            edit_channel_data: null,
            level: undefined,
          }
        }else{
          return state;
        }
      })();

    default:
      return state;
  }
}