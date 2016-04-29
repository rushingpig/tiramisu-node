
import {get, post, GET,TEST} from 'utils/request'; //Promise
import Url from 'config/url';
import { DeptRoleActionTypes } from 'actions/action_types';



export default function dept_role(ActionTypes=DeptRoleActionTypes){
/*	function _resolve(url, signal) {
	  return (dispatch) => {
	    return get(url)
	      .done(function(json){
	        dispatch({
	          type: signal,
	          data: json
	        })
	      })
	      .fail(function(msg){
	        dispatch({
	          type: ActionTypes.GOT_DEPT_ROLE_FAIL,
	          msg
	        })
	      })
	  }
	};*/
  return{
    getDepts:function(){
    	return GET(Url.dept_list_info.toString(),null,ActionTypes.GOT_DEPTS);
/*      return {
        type:ActionTypes.GOT_DEPTS,
        data:{1:'客服部',2:'物流部',3:'物控部',4:'加盟商'}
      }*/
/*      return TEST({
        total:4,
        list:[{
          'id':1,
          'name':'客服部',
          'children':[],
        },{
          'id':2,
          'name':'物流部',
          'children':[],
        },{
          'id':3,
          'name':'物控部',
          'children':[],
        },{
          'id':4,
          'name':'加盟商',
          'children':[],
        }]
      },ActionTypes.GOT_DEPTS);*/ 
    },
    getDeptsSignal:function(signal){
      return GET(Url.dept_list_info.toString(),{ signal: signal },ActionTypes.GOT_DEPTS_SIGNAL);
    },
    resetRoles:function() {
      return {
        type:ActionTypes.RESET_ROLES  
      }
      
    },
    getRoles:function(org_id){
      return GET(Url.role_list_info.toString(),{org_id:org_id},ActionTypes.GOT_ROLES);
/*      return TEST({
        total:5,
        list:[{
          'id':1,
          'name':'话务专员',
        },{
          'id':2,
          'name':'订单专员',
        },{
          'id':3,
          'name':'售后客服',
        },{
          'id':4,
          'name':'客服部主管',
        },{
          'id':5,
          'name':'客服部经理',
        }]
      },ActionTypes.GOT_ROLES);*/
/*      return {
        type:ActionTypes.GOT_ROLES,
        data:{1:'话务专员',2:'订单专员',3:'售后客服',4:'客服部主管',5:'客服部经理'}
      }*/
    },
    getRolesSignal:function(org_id, signal){
    	return GET(Url.role_list_info.toString(),{org_id:org_id, signal: signal},ActionTypes.GOT_ROLES_SIGNAL);
/*    	return TEST({
    		total:5,
    		list:[{
    			'id':1,
    			'name':'话务专员',
    		},{
    			'id':2,
    			'name':'订单专员',
    		},{
    			'id':3,
    			'name':'售后客服',
    		},{
    			'id':4,
    			'name':'客服部主管',
    		},{
    			'id':5,
    			'name':'客服部经理',
    		}]
    	},ActionTypes.GOT_ROLES);*/
/*    	return {
    	  type:ActionTypes.GOT_ROLES,
    	  data:{1:'话务专员',2:'订单专员',3:'售后客服',4:'客服部主管',5:'客服部经理'}
    	}*/
    },
    getAllRoles:function(){
      return GET(Url.role_list_info.toString(), null, ActionTypes.GOT_ALL_ROLES);
/*      return {
        type:ActionTypes.GOT_ALL_ROLES,
        data:{1:'话务专员',2:'订单专员',3:'售后客服',4:'客服部主管',5:'客服部经理',6:'xxxx',7:'xxxx'}
      }*/
    },   
    getAllRolesSignal:function(signal){
      return GET(Url.role_list_info.toString(),{signal:signal},ActionTypes.GOT_ALL_ROLES_SIGNAL);
/*      return {
        type:ActionTypes.GOT_ALL_ROLES,
        data:{1:'话务专员',2:'订单专员',3:'售后客服',4:'客服部主管',5:'客服部经理',6:'xxxx',7:'xxxx'}
      }*/
    },
    getDataAccess:function(){
      return GET(Url.role_data_access.toString(),null,ActionTypes.GOT_DATA_ACCESS);
/*      return {
        type:ActionTypes.GOT_DATA_ACCESS,
        data:{1:'所属配送站全部订单',2:'所属城市全部订单',3:'单个配送员的全部订单',4:'所属配送站全部用户',5:'所属部门全部用户'}
      }*/
    },
    resetStations:function(){
      return {
        type:ActionTypes.RESET_ROLES
      }
    },
    getStationsByCityIds:function(city_ids){
      return GET(Url.station_merge_list.toString(),{city_ids:city_ids},ActionTypes.GOT_STATIONS_BY_CITYIDS);
/*     return {
        type:ActionTypes.GOT_STATIONS_BY_CITYIDS,
        data:{1:'xxx',2:'xxx'}
      }*/
    },
    getStationsByCityIdsSignal:function(city_ids,signal){
      return GET(Url.station_merge_list.toString(),{city_ids:city_ids,signal:signal},ActionTypes.GOT_STATIONS_BY_CITYIDS_SIGNAL);
    },

  }
}


