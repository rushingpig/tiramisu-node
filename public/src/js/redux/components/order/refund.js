import React, {Component, PropTypes} from 'react';
import { render, findDOMNode } from 'react-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { reduxForm } from 'redux-form';

import SearchInput from 'common/search_input';
import DatePicker from 'common/datepicker';
import Select from 'common/select';



import V from 'utils/acl';
import {REFUND_STATUS} from 'config/app.config'

class TopHeader extends Component{
	render(){
		return(
			<div className='clearfix top-header'>
			 {
			  V( 'OrderManageExportExcel' ) && 
			    <button onClick={this.props.exportExcel} className="btn btn-theme btn-xs pull-right" style={{marginLeft: 20}}>
			      <i className="fa fa-download"></i> 导出
			    </button>
			 }				
			</div>
			)
	}
}

class FilterHeader extends Component{
	render(){
		var refundWayOptions = [{id:1,text:'第三方平台原返'},
		                      {id:2,text: '财务部退款'},
		                      {id:3, text: '客服部退款'},
		                     ]
		var YesorNoOptions = [{id:1, text: '是'},
							 {id:2, text: '否'},]
		var refundStatusOptions = [{id:1, text: '未审核'},
							{id:2, text: '已审核'},
							{id:3, text: '退款完成'},
							{id:4, text: '退款取消'}]
		return(
			<div className='panel search'>
				<div className='panel-body form-inline'>
          			<SearchInput className="form-inline v-mg" placeholder="订单号" />
          			{' 开始时间'}
          			<DatePicker editable className="short-input" />
          			{' 结束时间'}
          			<DatePicker editable className="short-input space-right" />
          			<Select options = {refundWayOptions} default-text='退款方式' className='space-right' />
          			<Select options = {YesorNoOptions} default-text = '是否加急处理' className='space-right' />
          			<Select options ={refundStatusOptions} default-text = '退款状态' className = 'space-right' />
          			<button className="btn btn-theme btn-xs">
          			  <i className="fa fa-search"></i>{' 查询'}
          			</button>
				</div>
			</div>
			)
	}
}

var RefundRow = React.createClass({
	render(){
		return(
			<tr>
				<td>
					<a href='javascript:;'>[审核]</a>
					<a href='javascript:;'>[编辑]</a>
					<a href='javascript:;'>[取消]</a>
					<a href='javascript:;'>[退款完成]</a>
					<a href='javascript:;'>[添加备注]</a>
				</td>
				<td></td>
				<td></td>
				<td></td>
				<td></td>
				<td></td>
				<td></td>
				<td></td>
				<td></td>
				<td></td>
				<td></td>
				<td></td>
				<td></td>
				<td></td>
			</tr>
			)
	}
})

class ManagePannel extends Component{
	render(){
		return (
			<div>
				<TopHeader />
				<FilterHeader />
				<div className='panel'>
					<header className='panel-heading'>退款列表</header>
					<div className='panel-body'>
            			<div ref="table-container" className="table-responsive main-list">
              				<table className="table table-hover text-center">
              					<thead>
              						<tr>
              							<td>管理操作</td>
              							<td>退款金额</td>
              							<td>退款方式</td>
              							<td>订单来源</td>
              							<td>退款状态</td>
              							<td>账号信息</td>
              							<td>退款原因</td>
              							<td>是否加急处理</td>
              							<td>商户订单号</td>
              							<td>订单号</td>
              							<td>联系人信息</td>
              							<td>申请人</td>
              							<td>操作人</td>
              							<td>操作时间</td>
              						</tr>
              					</thead>
              					<tbody>
              						<RefundRow />
              					</tbody>
              				</table>
            			</div>
					</div>
				</div>
			</div>			
			)
	}
}

export default ManagePannel;