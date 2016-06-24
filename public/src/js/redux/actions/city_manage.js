import {post, get, put, del,GET, POST, PUT, TEST } from 'utils/request'; //Promise
import Url from 'config/url';
import { Noty, formCompile, Utils, clone } from 'utils/index';
import { getValues } from 'redux-form';

export const GET_ACCESSIBLE_CITIES_LIST = 'GET_ACCESSIBLE_CITIES_LIST'
export function getAccessibleCityList(data){
	return (dispatch, getState) => {
    	var filter_data = getValues(getState().form.accessible_cities_filter);
    	filter_data = formCompile(filter_data);

    	return get(Url.open_city_list.toString(), {...filter_data,...data}, GET_ACCESSIBLE_CITIES_LIST)
    			.done( (_data) => {
    				dispatch({
    					page_no: data.page_no,
    					data: _data,
    					type: 'GET_ACCESSIBLE_CITIES_LIST'
    				})
    			} )
/*    	return TEST({list:[{
    		city_id:1,
    		city_name:'深圳',
    		delivery_time_range: '9:00 ~ 12:00',
    		is_county: 1,
    		is_diversion: 1,
    		online_time: '2016.10.06 10:30',
    		open_regionalisms:[{
    			order_time: '30',
    			regionalism_id: 23,
    			regionalism_name: 'xxx',
    		}],
    		order_time: 90,
    		province_name: '广东',
    	},{
    		city_id:2,
    		city_name:'深圳',
    		delivery_time_range: '9:00 ~ 12:00',
    		is_county: 1,
    		is_diversion: 1,
    		online_time: '2016.10.06 10:30',
    		open_regionalisms:[],
    		order_time: 90,
    		province_name: '广东',
    	}],total_count:2}, GET_ACCESSIBLE_CITIES_LIST)(dispatch);*/
	}
}

export const GOT_PROVINCES_SIGNAL = 'GOT_PROVINCES_SIGNAL';
export function getProvincesSignal(signal){
  return GET(Url.provinces.toString(),{signal:signal}, GOT_PROVINCES_SIGNAL);
}

export const GOT_REGIONALISM_LETTER = 'GOT_REGIONALISM_LETTER';
export function gotRegionalismLetter(form_data){
/*	var data = {};
	switch(form_data.type){
		case 'province':
			data = {
							list:[
								{regionalism_id: 110000, regionalism_name: '北京', first_letter: 'B', level:1},
								{regionalism_id: 130000, regionalism_name: '河北省', first_letter: 'H', level:1},
								{regionalism_id: 150000, regionalism_name: '内蒙古自治区', first_letter: 'N', level:1},
								{regionalism_id: 310000, regionalism_name: '上海', first_letter: 'S', level:1},
							],
							total_count: 4,
							dataType: form_data.type,
						}
			;break;
		case 'city':
			data = {
							list:[
								{regionalism_id: 440300, regionalism_name: '深圳', first_letter: 'B', level:1, is_open:1},
								{regionalism_id: 440100, regionalism_name: '广州', first_letter: 'H', level:1, is_open: 0},
								{regionalism_id: 440200, regionalism_name: '韶关', first_letter: 'N', level:1, is_open: 0},
								{regionalism_id: 441900, regionalism_name: '东莞', first_letter: 'S', level:1, is_open: 0},
							],
							total_count: 4,
							dataType: form_data.type,
						}
			;break;
		case 'district':
			data = {
							list:[
								{regionalism_id: 440300, regionalism_name: '端州', first_letter: 'B', level:1, is_open:1},
								{regionalism_id: 440100, regionalism_name: '德庆', first_letter: 'H', level:1, is_open: 0},
								{regionalism_id: 440200, regionalism_name: '广宁', first_letter: 'N', level:1, is_open: 0},
								{regionalism_id: 441900, regionalism_name: '开封', first_letter: 'S', level:1, is_open: 0},
							],
							total_count: 4,
							dataType: form_data.type,						
			}
		default:;

	}*/
	return (dispatch) => {
		return get(Url.regionalism_list.toString(),form_data )
				.done((data) => {
					dispatch({
						dataType: form_data.type,
						data: data,
						type: GOT_REGIONALISM_LETTER,
					})
				})
	}
	/*return TEST( data, GOT_REGIONALISM_LETTER);*/
}

export const GET_ACCESSIBLE_CITY_DETAIL = 'GET_ACCESSIBLE_CITY_DETAIL'
export function getAccessibleCityDetail(cityId){
/*	return TEST({
		SEO: 'xxxxxxxxxxx',
		area: '广东省 肇庆市 广宁县',
		city_id: 1,
		city_name: '深圳',
		delivery_time_range: '9:00 ~ 12:30',
		is_county: 0,
		is_diversion: 1,
		manager_mobile: '10000000',
		manager_name: 'xxxx',
		online_time: '2016-10-06 10:30',
		regionalisms: [{order_time: 90, regionalism_id: 44, is_open: 1, regionalism_name: '开封'},
							{order_time: 90, regionalism_id: 45, is_open: 0, regionalism_name: '南山'},
							{order_time: 90, regionalism_id: 46, is_open: 0, regionalism_name: '南山1'},
							{order_time: 90, regionalism_id: 47, is_open: 1, regionalism_name: '南山2'},
					  ],
		second_order_regionalisms: [
			{order_time:180, regionalism_id:46},
			{order_time:180,regionalism_id: 47},
		],
		order_time: 120,
		second_order_time: 180,
		regionalism_name: 'xxxx',
		remarks: 'xxx',
	}, GET_ACCESSIBLE_CITY_DETAIL)*/
	return GET(Url.open_city_detail.toString(cityId), null , GET_ACCESSIBLE_CITY_DETAIL);
}

export const SUBMIT_ING = 'SUBMIT_ING';
export const SUBMIT_COMPLETE = 'SUBMIT_COMPLETE';

export const SUBMIT_ACCESSIBLE_CITY = 'UPDATE_ACCESSIBLE_CITY';
export function updateAccessibleCity(form_data){
  return (dispatch, getState) => {
  	var data = _getFormData(form_data,getState);
  	dispatch({
  		type: SUBMIT_ING,
  	});
  	return post(Url.open_city_update.toString(data.city_id), data)
  			.done(function(){
  				dispatch({
  					type: SUBMIT_COMPLETE,
  				})
  			})
  }
}

export const SAVE_USER_INFO_ING = 'SAVE_USER_INFO_ING';
export const SAVE_USER_INFO_SUCCESS = 'SAVE_USER_INFO_SUCCESS';
export const SAVE_USER_INFO_FAIL = 'SAVE_USER_INFO_FAIL';

export const CREATE_ACCESSIBLE_CITY = 'CREATE_ACCESSIBLE_CITY';
export function CreateAccessibleCity(form_data){
	return (dispatch, getState) => {
		var data = _getFormData(form_data,getState);
		dispatch({
			type: SAVE_USER_INFO_ING,
		});
		return put(Url.open_city_add.toString(), data)
				.done(function(){
					dispatch({
						type: SAVE_USER_INFO_SUCCESS,
					})
				})
				.fail(function(){
					dispatch({
						type: SAVE_USER_INFO_FAIL,
					})
				})
	}
}

function _getFormData(form_data, getState){
	var accessibleCity = getValues(getState().form.add_city);
	if(accessibleCity){
	accessibleCity.online_time = accessibleCity.online_time_date + ' ' + accessibleCity.online_time_hour + ':' + accessibleCity.online_time_min;
	delete accessibleCity.online_time_date;
	delete accessibleCity.online_time_hour;
	delete accessibleCity.online_time_min;

	var {first_open_regions, sec_open_regions, sec_order, is_county} = accessibleCity;
	var regionalismList = [];
	if(is_county == 0 && first_open_regions && first_open_regions.length > 0)
		first_open_regions.map( m => regionalismList.push({regionalism_id:m.id}));
	if(is_county == 0 && sec_order && sec_open_regions && sec_open_regions.length > 0) {
		sec_open_regions.forEach( m => {
			regionalismList= regionalismList.map( n => {
				if(n.regionalism_id == m.id){
					n.order_time = accessibleCity.sec_order_time * 60;
				}
				return n;
			})
		})
	}
	accessibleCity.open_regionalisms = regionalismList;
	delete accessibleCity.sec_order;
	delete accessibleCity.first_open_regions;
	delete accessibleCity.sec_open_regions;
	var accessibleCity_data = {...accessibleCity,...form_data}
	accessibleCity_data.order_time = accessibleCity_data.order_time * 60;
	return accessibleCity_data;
	}else{
		return form_data;
	}
}

export const DELETE_ACCESSIBLE_CITY = 'DELETE_ACCESSIBLE_CITY';
export function DeleteAccessibleCity(city_id){
	return (dispatch) => {
	  return del(Url.open_city_delete.toString(city_id), null)
	    .done(() => {
	      dispatch({
	        id: city_id,
	        type: DELETE_ACCESSIBLE_CITY
	      })
	      Noty('success', '删除成功');
	    })
	    .fail(function(msg, code){
	      Noty('error', msg || '删除异常');
	    });
	}

	/*return TEST({
		type: DELETE_ACCESSIBLE_CITY
	});*/

}

export const RESET_DISTRICTS_LETTER = 'RESET_DISTRICTS_LETTER';
export function ResetDistrictsLetter(){
	return {
		type: RESET_DISTRICTS_LETTER,
	}
}