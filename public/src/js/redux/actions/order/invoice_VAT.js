import {post, get, put, del,GET, POST, PUT, TEST } from 'utils/request'; //Promise
import Url from 'config/url';
import { Noty, formCompile, Utils, clone } from 'utils/index';
import { getValues } from 'redux-form';

export const GET_COMPANY_LIST  =  'GET_COMPANY_LIST';
export function getCompanyList(filterdata){
	return TEST({
		list: [
			{
				id: 1,
				name: '腾讯',
				tel: '075519887',
				code: '678956789000',
				add: '',
				status: 'REVIEWED',
				img1: 'o_1aq9fsnp4sof1qf51a7g1lqjimc.jpg',
			},
			{
				id: 2,
				name: '阿里',
				tel: '075519887',
				code: '678956789000',
				add: '',
				status: 'UNREVIEWED',
				img2: 'o_1aq9i6roi5081drb1pri1o7715huc.png',
			},
		],
		total: 4,
	}, GET_COMPANY_LIST)
}

export const CREATE_COMPANY_ING = 'CREATE_COMPANY_ING';
export const CREATE_COMPANY_SUCCESS = 'CREATE_COMPANY_SUCCESS';
export const CREATE_COMPANY_FAIL = 'CREATE_COMPANY_FAIL';

export function createCompany(){
	return (dispatch, getState) => {
		var data = _getFormdata(getState);
		dispatch({
			type: CREATE_COMPANY_ING,
		})

		return TEST({
			type: CREATE_COMPANY_SUCCESS
		})
	}
}

export const EDIT_COMPANY_ING = 'EDIT_COMPANY_ING';
export const EDIT_COMPANY_SUCCESS = 'EDIT_COMPANY_SUCCESS';

export function editCompany(companyId){
	return (dispatch, getState) => {
		var data = _getFormdata(getState);
		dispatch({
			type: EDIT_COMPANY_ING,
		})

		return TEST({
			type: EDIT_COMPANY_SUCCESS
		})
	}	
}

export const VIEW_IMG = 'VIEW_IMG';
export function viewImg(img){
	return {
		type: VIEW_IMG,
		data: img
	}
}