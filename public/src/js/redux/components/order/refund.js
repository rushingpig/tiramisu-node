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
import MessageBox, { MessageBoxIcon } from 'common/message_box';

import RefundModal from './refund_detail_modal.js';

import * as RefundManageActions from 'actions/refund';
import AreaActions from 'actions/area';
import { AreaActionTypes1 } from 'actions/action_types';
import * as RefundActions from 'actions/refund_modal';

import LazyLoad from 'utils/lazy_load';
import V from 'utils/acl';
import {REFUND_STATUS, REFUND_WAY, ACCOUNT_TYPE} from 'config/app.config'
import { Noty, dateFormat } from 'utils/index';

import BindOrderRecordModal from 'common/bind_order_record_modal.js';

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

function _t(data){
  return map(data, (text, id) => ({id, text}))
}

class FilterHeader extends Component{
	constructor(props){
		super(props);
		this.state = {
			search_ing : false,
			search_by_keywords_ing: false,
		}
	}
	render(){
		var YesorNoOptions = [{id:1, text: '是'},
							 {id:2, text: '否'},];
		var {
			fields: {
				keywords,
				begin_time,
				end_time,
				province_id,
				city_id,
				is_urgent,
				way,
				status,
			},
			all_refund_status,
			all_refund_way,
			area: { provinces, cities },
		} = this.props;
		var { search_ing, search_by_keywords_ing, } = this.state;
		return(
			<div className='panel search'>
				<div className='panel-body form-inline'>
          			<SearchInput {...keywords} className="form-inline v-mg" placeholder="订单号" searchHandler = {this.search.bind(this, 'search_by_keywords_ing')} searching= {search_by_keywords_ing} />
          			{' 开始时间'}
          			<DatePicker redux-form = {begin_time} editable className="short-input" />
          			{' 结束时间'}
          			<DatePicker redux-form = {end_time} editable className="short-input space-right" />
          			<Select {...province_id} onChange={this.onProvinceChange.bind(this, province_id.onChange)} options={provinces} ref="province" default-text="选择省份" key="province" className="space-right"/>
          			<Select {...city_id} options={cities} default-text="选择城市" ref="city" key="city" className="space-right"/>
          			<Select {...way} options = {all_refund_way} default-text='退款方式' className='space-right' />
          			<Select {...is_urgent} options = {YesorNoOptions} default-text = '是否加急处理' className='space-right' />
          			<Select {...status} options ={all_refund_status} default-text = '退款状态' className = 'space-right' />
          			<button disabled = {search_ing} className="btn btn-theme btn-xs" onClick = {this.search.bind(this)}>
          			  <i className="fa fa-search"></i>{' 查询'}
          			</button>
				</div>
			</div>
			)
	}

	componentDidMount(){
		this.props.getProvincesSignal();
	}
	onProvinceChange(callback, e){
		var {value } = e.target;
		this.props.getCitiesSignal(value, 'authority');
		callback(e);
	}
	search(search_in_state){
		this.setState({[search_in_state] : true});
		this.props.getRefundList({page_no: 0, page_size: this.props.page_size})
			.always(() => {
				this.setState({[search_in_state] : false});
			})
	}
}

FilterHeader = reduxForm({
	form: 'refund_list_filter',
	fields: [
		'keywords',
		'begin_time',
		'end_time',
		'province_id',
		'city_id',
		'is_urgent',
		'way',
		'status',
	],
   destroyOnUnmount: false,
}, state => {
  var now = dateFormat(new Date());
  return {
    //赋初始值
    initialValues: {
      begin_time: now,
      end_time: now,
    }
  }
})(FilterHeader);

var RefundRow = React.createClass({
	render(){
		var { props } = this;
    	var src_name = props.src_name ? props.src_name.split(',') : ['', ''];
    	var _refund_status = REFUND_STATUS[props.status] || {};
		return(
			<tr onClick={this.ClickHandler}>
				<td>
					{
						this.ACL(
						[<a key='RefundManageTreat' href='javascript:;' onClick={this.onTreat}>[确认]</a>, <br key='0' />],
						[<a key='RefundManageReview' href='javascript:;' onClick = { this.onReview }>[审核]</a>, <br key='1' />],
						[<a key='RefundManageEdit' href='javascript:;' onClick={this.viewRefundModal}>[编辑]</a>, <br key='2' />],
						[<a key='RefundManageCancel' href='javascript:;' onClick = { this.onCancel }>[取消]</a>, <br key='3' />],
						[<a key='RefundManageRefunded'  href='javascript:;' onClick={this.viewRefundCredential}>[退款完成]</a>, <br key='4' />],
						[<a key='RefundManageComment' href='javascript:;' onClick={this.viewRemarkModal}>[添加备注]</a>,<br key='5' />]
						)
					}
				</td>
				<td>{'￥' + props.amount / 100}</td>
				<td className='nowrap'>{ REFUND_WAY[props.way] }
					{ REFUND_WAY[props.way] != REFUND_WAY['THIRD_PARTY'] ?
						[ <br key='br' />, 
						  <span key='account_type' className='bordered bg-warning'>{ACCOUNT_TYPE[props.account_type]}</span>
						]:null
					}
				</td>
				<td className='nowrap'>
					{src_name[0]}
					{src_name[1] ? [<br key="br" />, <span key="src_2" className="bordered bg-warning">{src_name[1]}</span>] : null}
				</td>
				<td>
					<span 
						className='bordered bold order-status'
						style={{color: _refund_status.color || 'inherit', background: _refund_status.bg }}>
						{_refund_status.value}
					</span>
				</td>
					{ 
						REFUND_WAY[props.way] == REFUND_WAY['CS']
						?
						<td className='text-left'>
							<span>{'账户名：' + props.account_name}</span>
							<br key='acount_info_br'/>
							<span key='account_info_account_span'>
							{
								ACCOUNT_TYPE[props.account_type] == 'ALIPAY'
								? 
								<span>{'账户：' + props.account }</span>
								:
								<span>{'卡号：' + props.account }</span>
						    }
						    </span>
						</td>
						: <td>{'无'}</td>
					}
				<td>{props.reason}</td>
				<td>
					<span className='bordered bold bg-warning' style={{color: props.is_urgent == 1 ? '#E44949':''}}>
						{props.is_urgent == 1 ? '是' : '否'}
					</span>
				</td>
				<td>
					{props.merchant_id}
				</td>
				<td>{this.props.order_id}</td>
				<td>
				{
				  props.bind_order_id ?
				    <a className='inline-block time' onClick = {this.viewBindOrderRecord}>{props.bind_order_id}</a>
				    :
				    <div className='bordered bold' style={{backgroundColor: '#dac7a7', color: props.bind_order_id ? '#E44949' : '#2FB352'}}>{'无'}</div>
				}					
				</td>
				<td className='text-left'>
					{'姓名：' + props.linkman_name}
					<br />
					{'电话：' + props.linkman_mobile}
				</td>
				<td>{props.created_by}</td>
				<td>{props.updated_by}</td>
        		<td><a onClick={this.viewOrderOperationRecord} className="inline-block time" href="javascript:;">{this.props.updated_time}</a></td>
			</tr>
			)
	},
	ACL: function(){
		var {status} = this.props;
		var roles = null;
		switch (status){
			case 'UNTREATED':
				roles = ['RefundManageTreat', 'RefundManageEdit', 'RefundManageCancel'];break;
			case 'TREATED':
				roles = ['RefundManageReview', 'RefundManageEdit', 'RefundManageCancel'];break;
			case 'REVIEWED':
				roles = ['RefundManageEdit', 'RefundManageRefunded', 'RefundManageCancel'];break;
			case 'COMPLETED':
				roles = ['RefundManageComment'];break;
			case 'CANCEL':
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
		var data = {refund_id: this.props.id, owner_name: this.props.owner_name, owner_mobile: this.props.owner_mobile, order_id: this.props.order_id}
		this.props.viewOperationRecordModal(data);
	},
	viewRefundModal: function(e){
		this.props.getRefundApplyDetail(this.props.id);
		this.props.viewRefundModal();
	},
	viewRefundCredential: function(){
		this.props.viewRefundCredential(this.props.id, this.props.pay_id, this.props.merchant_id);
	},
	viewRemarkModal: function(){
		this.props.viewRemarkModal(this.props.id, this.props.remarks);
	},
	viewBindOrderRecord(e){
	  this.props.viewBindOrderRecord(this.props);
	  e.stopPropagation();
	},
	onTreat: function(e){
		this.props.handleRefund(this.props.id, 'TREATED')
			.done(function(){
				Noty('success', '确认成功');
			}.bind(this))
			.fail(function(msg, code){
				Noty('error', msg || '确认失败');
			})
		e.stopPropagation();
	},
	onReview: function(e){
		this.props.handleRefund(this.props.id, 'REVIEWED')
			.done(function(){
				Noty('success', '审核成功');
			}.bind(this))
			.fail(function(msg, code){
				Noty('error', msg || '审核失败');
			})
		e.stopPropagation();
	},
	onCancel: function(e){
		this.props.handleRefund(this.props.id, 'CANCEL')
		.done(function(){
			Noty('success', '取消成功');
		}.bind(this))
		.fail(function(msg, code){
			Noty('error', msg || '取消失败');
		})
		e.stopPropagation;
	},

})

class ManagePannel extends Component{
	constructor(props){
		super(props);
		this.state = {
			page_size: 10,
		}
		this.viewOperationRecordModal = this.viewOperationRecordModal.bind(this);
		this.viewRefundModal = this.viewRefundModal.bind(this);
		this.viewRefundCredential = this.viewRefundCredential.bind(this);
    	this.viewBindOrderRecord = this.viewBindOrderRecord.bind(this);
		this.viewRemarkModal = this.viewRemarkModal.bind(this);
	}
	render(){
		var { RefundManage, getOrderOptRecord, resetOrderOptRecord, refund_data , bindOrderRecord, area,
			 getProvincesSignal, getCitiesSignal, getRefundList, getRefundReasons, getRefundApplyDetail,
			 editRefundChangeStatus, refundEdit, getBindOrders, resetBindOrders, addRemark, refundComplete_CS  } = this.props;
		var { list, total, loading, refresh, page_no, check_order_info, active_order_id, operationRecord, all_refund_status, all_refund_way, all_refund_reasons } = RefundManage;
		var { viewOperationRecordModal, viewRefundModal, viewRefundCredential, viewRemarkModal, viewBindOrderRecord } = this;
		var content = list.map((n) => {
			return <RefundRow  key={n.id} {...{...n, ...this.props, viewOperationRecordModal, viewRefundModal,
					viewRefundCredential, viewRemarkModal, getRefundApplyDetail, viewBindOrderRecord }} />
		})
		return (
			<div className='order-manage'>
				<TopHeader />
				<FilterHeader 
				  all_refund_way = {all_refund_way}
				  all_refund_status = {all_refund_status}
				  area = {area}
				  getProvincesSignal = {getProvincesSignal}
				  getCitiesSignal = {getCitiesSignal}
				  getRefundList = {getRefundList}
				  page_size = { this.state.page_size }
				  />
				<div className='panel'>
					<header className='panel-heading'>退款列表</header>
					<div className='panel-body'>
            			<div ref="table-container" className="table-responsive main-list">
              				<table className="table table-hover text-center">
              					<thead>
              						<tr>
              							<th>管理操作</th>
              							<th>退款金额</th>
              							<th>退款方式</th>
              							<th>订单来源</th>
              							<th>退款状态</th>
              							<th>账号信息</th>
              							<th>退款原因</th>
              							<th>是否加急处理</th>
              							<th>商户订单号</th>
              							<th>订单号</th>
              							<th>关联订单</th>
              							<th>联系人信息</th>
              							<th>申请人</th>
              							<th>操作人</th>
              							<th>操作时间</th>
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
        		<RefundModal ref='RefundModal' editable={true} 
        			 refund_data = { refund_data } 
        			 all_refund_reasons = {all_refund_reasons} 
        			 getRefundReasons = {getRefundReasons}
        			 editRefundChangeStatus = {editRefundChangeStatus}
        			 refundEdit = {refundEdit}
        			 />
        		<RefundCredentials ref='viewRefundCredential' editable = {true} editRefundChangeStatus = {editRefundChangeStatus} refundComplete_CS = {refundComplete_CS}/>
        		<RemarkModal ref='viewRemarkModal' addRemark = {addRemark} />
        		<BindOrderRecordModal ref='BindOrderRecordModal' {...{getBindOrders, resetBindOrders, ...bindOrderRecord}}/>				
			</div>			
			)
	}
	componentDidMount(){
      	LazyLoad('noty');
		this.search();
	}
	search(page){
    	page = typeof page == 'undefined' ? this.props.RefundManage.page_no : page;
    	this.props.getRefundList({page_no: page, page_size: this.state.page_size})
	}
	onPageChange(page){
		this.search(page);
	}
	viewOperationRecordModal(order){
		this.refs.viewOperationRecord.show(order);
	}
	viewRefundModal(){
		this.refs.RefundModal.show();
	}
	viewRefundCredential(id, pay_id, merchant_id){
		this.refs.viewRefundCredential.show(id, pay_id, merchant_id);
	}
	viewRemarkModal(id, remarks){
		this.refs.viewRemarkModal.show(id, remarks);
	}
	viewBindOrderRecord(order){
	  this.refs.BindOrderRecordModal.show(order);
	}
/*	componentDidUpdate() {
	    const { RefundManage: {handle_refund_status}, resetRefundStatus } = this.props;
	    if (handle_refund_status === 'fail') {
	        return MessageBox({
	            icon: MessageBoxIcon.Error,
	            text: '操作失败'
	        }).then(
	        	resetRefundStatus()
	        );
	    }

	    if (handle_refund_status === 'success') {
	        return MessageBox({
	            icon: MessageBoxIcon.Success,
	            text: '操作成功'
	        }).then(
	            resetRefundStatus()
	        );
	    }
	}*/
}

function mapStateToProps(state){
	return state.refundManage;
}

function mapDispatchToProps(dispatch){
	var actions = bindActionCreators({
		...AreaActions(AreaActionTypes1),
		...RefundManageActions,
		...RefundActions,
	},dispatch);
	actions.dispatch = dispatch;
	return actions;
}

class RefundCredentials extends Component{
	constructor(props){
		super(props);
		this.state = {
			pay_id: '',
			merchant_id: '',
			id: '',			
		}
	}
	render(){
		var { pay_id, merchant_id } = this.state;
		return(
			<StdModal ref='modal' title='客服退款凭证' onConfirm = {this.submitHandler.bind(this)}>
				<div>
					<div className='form-group form-inline'>
						<label>{'支付宝转账交易订单号：'}</label>
						<input onChange = {this.onTradeIdChange.bind(this)} value = {pay_id} className='form-control input-xs' type='text' style={{width: 300}}/>
					</div>
					<div className = 'form-group form-inline'>
						<label>{'　　　　　商户订单号：'}</label>
						<input onChange = {this.onMerchantIdChange.bind(this)} value = {merchant_id} className='form-control input-xs' type='text' style={{width: 300}}/>
					</div>
				</div>
			</StdModal>
			)
	}
	show(id, pay_id, merchant_id){
		this.setState({pay_id: pay_id || '', merchant_id: merchant_id || '', id: id})
		this.refs.modal.show();
	}
	onTradeIdChange(e){
		var {value } = e.target;
		this.setState({pay_id: value});
	}
	onMerchantIdChange(e){
		var {value} = e.target;
		this.setState({ merchant_id: value});
	}
	submitHandler(){
		var { pay_id ,merchant_id, id } = this.state;
		this.props.refundComplete_CS(id, pay_id, merchant_id)
			.done( function(){
				this.setState({pay_id: '', merchant_id: ''});
				Noty('success', '添加成功');
				this.refs.modal.hide();
			}.bind(this))
			.fail(function(msg, code){
				Noty('error', msg || '添加失败')
			})
	}
}

class RemarkModal extends Component{
	constructor(props){
		super(props);
		this.state = ({
			remark: '',
			id: '',
		})
	}
	render(){
		return (
			<StdModal ref='modal' title='添加退款备注' onConfirm = {this.submitHandler.bind(this)}>
				<div>
					<label>{'备注：'}</label>
					<textarea onChange={this.onRemarkChange.bind(this)} value = {this.state.remark} className='form-control' style={{width: '100%',height:120}} />
				</div>
			</StdModal>
			)
	}
	show(id, remarks){
		this.setState({remark: remarks, id: id});
		this.refs.modal.show();
	}
	onRemarkChange(e){
		this.setState({remark: e.target.value});
	}
	submitHandler(){
		this.props.addRemark(this.state.id,this.state.remark)
			.done(function(){
				this.setState({remark: ''});
				Noty('success', '添加成功');
				this.refs.modal.hide();
			}.bind(this))
			.fail(function(msg, code){
				Noty('error', msg || '添加失败');
			})
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(ManagePannel);