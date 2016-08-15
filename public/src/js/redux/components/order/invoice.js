import React, {Component, PropTypes} from 'react';
import { render, findDOMNode } from 'react-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import LinkedStateMixin from 'react-addons-linked-state-mixin';
import { reduxForm } from 'redux-form';

import { Noty } from 'utils/index';
import V from 'utils/acl';
import * as FormActions from 'actions/form';
import LazyLoad from 'utils/lazy_load';

import history from 'history_instance';

import DatePicker from 'common/datepicker';
import Linkers from 'common/linkers';
import SearchInput from 'common/search_input';
import Select from 'common/select';
import { tableLoader, get_table_empty } from 'common/loading';
import StdModal from 'common/std_modal';
import Pagination from 'common/pagination';
import RadioGroup from 'common/radio_group';
import OrderProductsDetail from 'common/order_products_detail';
import OrderSrcsSelects from 'common/order_srcs_selects';

import { getOrderSrcs, getDeliveryStations, autoGetDeliveryStations } from 'actions/order_manage_form';
import { getStationListByScopeSignal, resetStationListWhenScopeChange } from 'actions/station_manage';
import * as OrderSupportActions from 'actions/order_support';
import AreaActions from 'actions/area';
import * as InvoiceManageActions from 'actions/order/invoice';

class TopHeader extends Component{
	render(){
		return(
			<div className = 'clearfix top-header'>
				{
				  V( 'InvoiceManageAddInvoice' )
				    ? <button className="btn btn-xs btn-theme pull-left" onClick = {this.viewInvoiceApplyModal.bind(this)}>添加发票申请</button>
				    : null
				}
				{
				  V( 'InvoiceManageExportExcel' )
				    ?
				    <button className="btn btn-theme btn-xs pull-right" style={{marginLeft: 20}}>
				      <i className="fa fa-download"></i> 导出
				    </button>
				    :null            
				}				
			</div>
			)
	}
	viewInvoiceApplyModal(){
		this.props.viewInvoiceApplyModal();
	}
}

class FilterHeader extends Component{
	constructor(props){
		super(props);
		this.state = {
			search_ing: false,
			search_by_keywords_ing: false,
		}
	}
	render(){
		var {search_ing, search_by_keywords_ing} = this.state;
		var {all_order_srcs, all_invoice_status } = this.props;
		var {
			fields:{
				keywords,
				province_id,
				city_id,
				begin_time,
				end_time,
				src_id,
				station_id,
				invoice_status,
			},
			provinces,
			cities,
			stations: {station_list},
		} = this.props;
		return(
			<div className='panel search'>
				<div className='panel-body form-inline'>
					<SearchInput searchHandler = {this.search.bind(this, 'search_by_keywords_ing')} ref='city_name' className='form-inline v-img space-right' placeholder='订单号查询' />
					{' 开始时间'}
					<DatePicker editable className="short-input" />
					{' 结束时间'}
					<DatePicker editable className="short-input space-right" />
					<Select ref = 'province' options = {provinces} {...province_id}  default-text = '请选择省份' className='space-right' onChange = {this.onProvinceChange.bind(this, province_id.onChange)}/>
					<Select ref = 'city' options = {cities} {...city_id}  default-text = '请选择市' className='space-right' onChange = {this.onCityChange.bind(this, city_id.onChange)}/>
					<Select options = {station_list} {...station_id} default-text = '请选择配送站' className='space-right'/>
					<Select options = {all_invoice_status} {...invoice_status} default-text = '开票状态'  className='space-right'/>
					{
					  V( 'InvoiceManageChannelFilter' )
					    ?<OrderSrcsSelects {...{all_order_srcs, src_id}} actions={this.props.actions} reduxFormName="invoice_manage_filter" />
					    :null
					}
					<button onClick = {this.search.bind(this)} disabled={search_ing} data-submitting={search_ing} className="btn btn-theme btn-xs">
					  <i className="fa fa-search"></i>{' 查询'}
					</button>
				</div>
			</div>
			)
	}
	componentDidMount(){
		setTimeout(() =>{
			var {getOrderSrcs, getProvincesSignal } = this.props.actions;
			getProvincesSignal();
			getOrderSrcs();
			LazyLoad('noty');
		})
		
	}
	onProvinceChange(callback, e){
		var { value } = e.target;
		this.props.actions.resetCities();
		if(value != this.refs.province.props['default-value']){
		  var $city = $(findDOMNode(this.refs.city));
		  this.props.getStationListByScopeSignal({ province_id: value ,signal:'authority'});
		  this.props.actions.getCitiesSignal({ province_id: value, is_standard_area: 1, signal: 'authority'}).done(() => {
		    $city.trigger('focus'); //聚焦已使city_id的值更新
		  });}else{
		    this.props.resetStationListWhenScopeChange();
		  }
		callback(e);
	}
	onCityChange(callback, e){
	  var {value} = e.target;
	  if(value != this.refs.city.props['default-value'])
	    this.props.getStationListByScopeSignal({ city_id: value, signal: 'authority' });
	  else{
	    this.props.resetStationListWhenScopeChange();     
	  }
	  callback(e);
	}
	search(search_in_state){
	  this.setState({[search_in_state]: true});
	  this.props.actions.getInvoiceList({page_no: 0, page_size: this.props.page_size})
	    .always(()=>{
	      this.setState({[search_in_state]: false});
	    });
	}
}

FilterHeader = reduxForm({
	form: 'invoice_manage_filter',
	fields: [
		'keywords',
		'begin_time',
		'end_time',
		'province_id',
		'city_id',
		'station_id',
		'invoice_status',
		'src_id',
	],
	destroyOnUnmount: false,
})(FilterHeader);

var  InvoiceRow = React.createClass({
	render(){
		var {props} = this;
		return(
			<tr onClick = {this.ClickHandler}>
				<td>
					{
						this.ACL(
							[<a key='InvoiceManageTreat' href='javascript:;' >[开具发票]</a>,<br key='treat_br' />],
							[<a key='InvoiceManageEdit' href='javascript:;' >[编辑]</a>,<br key='edit_br' />],
							[<a key='InvoiceManageCancel' href='javascript:;' >[取消]</a>,<br key='cancel_br' />],
							[<a key='InvoiceManageLogistics' href='javascript:;' >[物流填写]</a>,<br key = 'logistics_br' />],
							[<a key='InvoiceManageAddRemarks' href='javascript:;' >[添加备注]</a>,<br key= 'remark' />]
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
	},
	ClickHandler:function(){
		if(this.props.main.active_order_id != this.props.order_id)
			this.props.activeOrder(this.props.order_id);
	},
	ACL:function(){
		var {invoice_status} = this.props;
		var roles = null;
		switch(invoice_status){
			case 'UNINVOICE':
				roles = ['InvoiceManageTreat', 'InvoiceManageEdit', 'InvoiceManageCancel'];break;
			case 'INVOICED':
				roles = ['InvoiceManageLogistics', 'InvoiceManageCancel'];break;
			case 'CANCEL':
			case 'DELIVERY':
				roles = ['InvoiceManageAddRemarks'];break;
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
	}
})

class ManagePannel extends Component{
	constructor(props){
		super(props);
		this.state = {
			page_size: 10,
		}
	}
	render(){
		var {area, filter, stations, dispatch, getStationListByScopeSignal, resetStationListWhenScopeChange,
			getInvoiceList, getOrderInvoiceInfo,
			main: {list, page_no, total, loading, refresh, active_order_id, check_order_info, order_invoice_info},
		} = this.props;
		var content = list.map((n, i) => {
		  return <InvoiceRow {...{...n, ...this.props}} key={n.invoice_id} 
		  		/>
		})
		return (
			<div className='order-manage'>
				<TopHeader 
					viewInvoiceApplyModal= {this.viewInvoiceApplyModal.bind(this)} />
				<FilterHeader {...{...area, ...filter, stations}}
					getStationListByScopeSignal = {getStationListByScopeSignal}
					resetStationListWhenScopeChange = {resetStationListWhenScopeChange}
					actions = {{...bindActionCreators({...AreaActions(), getOrderSrcs, ...FormActions,
								 }, dispatch), getInvoiceList}}/>
				<div className = 'panel'>
					<header className='panel-heading'>发票列表</header>
					<div className='panel-body'>
						<div ref="table-container" className="table-responsive main-list">
						  <table className="table table-hover text-center">
						  	<thead>
						  		<tr>
						  			<th>管理操作</th>
						  			<th>发票类型</th>
						  			<th>发票抬头</th>
						  			<th>发票金额</th>
						  			<th>发票状态</th>
						  			<th>订单状态</th>
						  			<th>收票人信息</th>
						  			<th>城市</th>
						  			<th>配送站</th>
						  			<th>订单来源</th>
						  			<th>订单号查询</th>
						  			<th>物流追踪</th>
						  			<th>申请人</th>
						  			<th>操作人</th>
						  			<th>操作时间</th>
						  		</tr>
						  	</thead>
						  	<tbody>
                				{ tableLoader( loading || refresh, content ) }
						  	</tbody>
						  </table>
						</div>
						<Pagination 
						  page_no={page_no} 
						  total_count={total} 
						  page_size={this.state.page_size} 
						  onPageChange={this.onPageChange.bind(this)}
						/>
					</div>
				</div>
				{ check_order_info
				  ? <div className="panel">
				      <div className="panel-body" style={{position: 'relative'}}>
				        <div style={{paddingBottom: 5}}>订单管理 >> 产品详情</div>
				        <OrderProductsDetail products={check_order_info.products} />
				      </div>
				    </div>
				  : null }
				<InvoiceApplyModal ref='InvoiceApplyModal' getOrderInvoiceInfo = {getOrderInvoiceInfo}
					data = {order_invoice_info}
					/>
			</div>
			)
	}
	viewInvoiceApplyModal(){
		this.refs.InvoiceApplyModal.show();
	}
	componentDidMount(){
		this.search();
	}
	search(page){
	  //搜索数据，无需loading图
	  page = typeof page == 'undefined' ? this.props.page_no : page;
	  return this.props.getInvoiceList({page_no: page, page_size: this.state.page_size});
	}
	onPageChange(page){
		var unlock = dom.lock(this.refs['table-container']);
		this.search(page).done(unlock);
	}
}

class InvoiceApplyModal extends Component{
	render(){
		return(
			<StdModal ref='modal' title='发票申请页面' >
				<InvoiceApplyPannel {...this.props} />
			</StdModal>
			)
	}
	show(){
		this.refs.modal.show();
	}
}

class InvoiceApplyPannel extends Component{
	constructor(props){
		super(props);
		this.state = {
			search_by_keywords_ing: false,
		}
	}
	render(){
		var {
			fields: {
				amount,
				company_id,
				order_id,
				recipient_mobile,
				recipient_name,
				remarks,
				title,
				type,
				enable_recipient_address,
				recipient,
				province_id,
				city_id,
				district_id,
				address,
			}
		} = this.props;
		return(
				<div>
					<div className='form-group form-inline'>
						<label>{'　订单号：'}</label>
						<SearchInput {...order_id} searchHandler = {this.search.bind(this, 'search_by_keywords_ing')} className='form-inline v-img space-right' placeholder='搜索要开具发票的订单号' />				
					</div>
					<div className='form-group form-inline'>
						<label>{'发票类型：'}</label>
						<label>
						  <input {...type} checked = {type.value == 0} type="radio" value = '0' /> 增值税普通发票</label>
						{'　'}
						<label>
						  <input {...type} checked = {type.value == 0} type="radio"  value = '1' /> 增值税专用发票</label> 
					</div>
					
					
					<div className='form-group form-inline'>
						<label>{'发票抬头：'}</label>
						{
							type.value == 0 ?
							<Select {...company_id} default-text='请选择已审核公司' />
							:
							<input {...title} className='form-control input-xs' type='text' placeholder='个人/公司全称' />
						}
					</div>
					<div className='form-group form-inline'>
						<fieldset className='box-wrapper' style={{'border':'1px solid #ddd'}}>
          					<legend style={{'padding':'5px 10px','fontSize':'13','width':'auto','border':'0', marginBottom: 5}}>收票人信息</legend>
          					<div>
          					{'　　'}<div className='form-group form-inline' style = {{marginBottom: 8}}>
          						<label>{'发票金额/'}{'流水金额：'}</label>
          						￥<input {...amount} className='form-control input-xs' style = {{width: 80}} type='text' readOnly />
          					</div><br />
          					<div className='form-group form-inline' style = {{marginBottom: 8}}>
		 						{'　　'}<RadioGroup
		 							{...recipient}
		                   			vertical={false}
		                   			className = 'inline-block'
		 							radios={[
		 								{value: 1, text: '手动输入'},
		 								{value: 2, text: '下单人'},
		 								{value: 3, text: '收货人'},
		 								]}
		 								 />         						
          					</div>
          					<div className='form-group form-inline' style = {{marginBottom: 8}}>
          						<label className='control-label'>{'　　姓名：'}</label>
          						<input {...recipient_name} type='text' className='form-control input-xs'/>
          						<label>{'　　电话：'}</label>
          						<input {...recipient_mobile} type='text'  className='form-control input-xs'/>
          					</div>
          					<div className='form-group form-inline' style = {{marginBottom: 8, display: 'block'}}>
          						<label>{'　　地址：'}</label>
          						<input checked = {enable_recipient_address.value == 1} type = 'checkbox' /><label>{'启用收货人地址'}</label>        						
          					</div>
          					
          					<div className='form-group form-inline' style = {{marginBottom: 8}}>
        						{'　　　　　'}<Select {...province_id} ref="province" default-text="--选择省份--" className="form-select" />{' '}
        						<Select {...city_id} ref="city"  default-text="--城市--" />{' '}
        						<Select {...district_id} ref="district"  default-text="--区/县--" />{' '}
          					</div>
          					<div className='form-group form-inline' style = {{marginBottom: 8}}>
        						{'　　　　　'}<input {...address} ref="recipient_address" className='form-control input-xs'  style={{width: 280}} type="text" placeholder='详细地址：小区、楼栋、门牌号'/>
          					</div>	
          					</div>

						</fieldset>
					</div>
				</div>
			)
	}
	search(){
		var {fields: {order_id}, getOrderInvoiceInfo} = this.props;
		this.setState({search_by_keywords_ing: true});
		getOrderInvoiceInfo(order_id.value);
		this.setState({search_by_keywords_ing: false});
	}

}

InvoiceApplyPannel = reduxForm({
	form: 'invoice_apply_pannel',
	fields: [
		'amount',
		'company_id',
		'order_id',
		'recipient',
		'recipient_mobile',
		'recipient_name',
		'remarks',
		'title',
		'type',
		'enable_recipient_address',
		'province_id',
		'city_id',
		'district_id',
		'address',
	],
	destroyOnUnmount: false
})(InvoiceApplyPannel);

function mapStateToProps(state){
	return state.invoiceManage;
}

function mapDispatchToProps(dispatch){
	var actions =  bindActionCreators({
		...AreaActions(),
		...InvoiceManageActions,
		getStationListByScopeSignal,
		resetStationListWhenScopeChange,
	}, dispatch);
	actions.dispatch = dispatch;
	return actions;
}

export default connect(mapStateToProps, mapDispatchToProps)(ManagePannel);