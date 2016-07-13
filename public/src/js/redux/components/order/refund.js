import React, {Component, PropTypes} from 'react';
import { render, findDOMNode } from 'react-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { reduxForm } from 'redux-form';

import SearchInput from 'common/search_input';
import DatePicker from 'common/datepicker';
import { tableLoader, get_table_empty } from 'common/loading';
import Pagination from 'common/pagination';
import Select from 'common/select';
import OrderProductsDetail from 'common/order_products_detail';
import StdModal from 'common/std_modal';
import OperationRecordModal from 'common/operation_record_modal.js';

import RefundModal from './refund_modal.js';

import * as RefundManageActions from 'actions/refund';
import AreaActions from 'actions/area';
import { AreaActionTypes2 } from 'actions/action_types';


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
			<tr onClick={this.ClickHandler}>
				<td>
					{
						this.ACL(
						[<a key='RefundManageAudit' href='javascript:;'>[审核]</a>, <br key='1' />],
						[<a key='RefundManageEdit' href='javascript:;' onClick={this.viewRefundModal}>[编辑]</a>, <br key='2' />],
						[<a key='RefundManageCancel' href='javascript:;'>[取消]</a>, <br key='3' />],
						[<a key='RefundManageRefunded'  href='javascript:;'>[退款完成]</a>, <br key='4' />],
						[<a key='RefundManageComment' href='javascript:;'>[添加备注]</a>,<br key='5' />]
						)
					}
				</td>
				<td></td>
				<td></td>
				<td></td>
				<td></td>
				<td></td>
				<td></td>
				<td></td>
				<td></td>
				<td>{this.props.order_id}</td>
				<td></td>
				<td></td>
				<td></td>
        		<td><a onClick={this.viewOrderOperationRecord} className="inline-block time" href="javascript:;">{this.props.updated_time}</a></td>
			</tr>
			)
	},
	ACL: function(){
		var {status} = this.props;
		var roles = null;
		switch (status){
			case 'UNAUDIT':
				roles = ['RefundManageAudit', 'RefundManageEdit', 'RefundManageCancel'];break;
			case 'AUDITED':
				roles = ['RefundManageEdit', 'RefundManageRefunded', 'RefundManageCancel'];break;
			case 'REFUNDED':
				roles = ['RefundManageComment'];break;
			case 'REFUNDCANCEL':
				roles = ['RefundManageComment'];break;
			default:
				roles = [];break;
		}
		var results = []
		for(var i=0,len=arguments.length; i<len; i++){
		  var ele = arguments[i][0];
		  if( V( ele.key ) && roles.some( n => n == ele.key)){
		    results.push(arguments[i]);
		  }
		}
		return results;
	},
	ClickHandler:function(){
		if(this.props.RefundManage.active_order_id != this.props.order_id)
			this.props.activeOrder(this.props.order_id);
	},
	viewOrderOperationRecord: function(){
		this.props.viewOperationRecordModal();
	},
	viewRefundModal: function(){
		this.props.viewRefundModal();
	}
})

class ManagePannel extends Component{
	constructor(props){
		super(props);
		this.state = {
			page_size: 10,
		}
		this.viewOperationRecordModal = this.viewOperationRecordModal.bind(this);
		this.viewRefundModal = this.viewRefundModal.bind(this);
	}
	render(){
		var { RefundManage, getOrderOptRecord, resetOrderOptRecord, } = this.props;
		var { list, total, loading, refresh, page_no, check_order_info, active_order_id, operationRecord} = RefundManage;
		var { viewOperationRecordModal, viewRefundModal } = this;
		var content = list.map((n) => {
			return <RefundRow  key={n.order_id} {...{...n, ...this.props, viewOperationRecordModal, viewRefundModal }} />
		})
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
              						{tableLoader( loading || refresh, content )}
              					</tbody>
              				</table>
            			</div>
            			<Pagination
            				page_no = {page_no}
            				total_count = {total}
            				onPageChange = {this.onPageChange.bind(this)}
            				page_size = {this.state.page_size}
            			/>
					</div>
				</div>

				{  check_order_info
				  ? <div className="panel">
				      <div className="panel-body" style={{position: 'relative'}}>
				        <div>订单管理 >> 产品详情</div>
				        <OrderProductsDetail products={check_order_info.products} />
				      </div>
				    </div>
				  : null }

				<OperationRecordModal ref='viewOperationRecord' {...{getOrderOptRecord, resetOrderOptRecord, list:operationRecord.list || [], page_no:0}}/>
        		<RefundModal ref='RefundModal' editable={true} />
			</div>			
			)
	}
	componentDidMount(){
		this.search();
	}
	search(page){
    	page = typeof page == 'undefined' ? this.props.RefundManage.page_no : page;
    	this.props.getRefundList({page_no: page, page_size: this.state.page_size})
	}
	onPageChange(page){
		this.search(page);
	}
	viewOperationRecordModal(){
		this.refs.viewOperationRecord.show();
	}
	viewRefundModal(){
		this.refs.RefundModal.show();
	}
}

function mapStateToProps(state){
	return state.refundManage;
}

function mapDispatchToProps(dispatch){
	var actions = bindActionCreators({
		...AreaActions(AreaActionTypes2),
		...RefundManageActions,
	},dispatch);
	actions.dispatch = dispatch;
	return actions;
}

export default connect(mapStateToProps, mapDispatchToProps)(ManagePannel);