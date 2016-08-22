import React, {Component, PropTypes} from 'react';
import { render, findDOMNode } from 'react-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { reduxForm } from 'redux-form';

import DatePicker from 'common/datepicker';
import Select from 'common/select';
import OrderProductsDetail from 'common/order_products_detail';
import { tableLoader, get_table_empty } from 'common/loading';
import StdModal from 'common/std_modal';
import OperationRecordModal from 'common/operation_record_modal.js';
import RecipientInfo from 'common/recipient_info';
import SearchInput from 'common/search_input';
import Pagination from 'common/pagination';


import AreaActions from 'actions/area';
import { AreaActionTypes1 } from 'actions/action_types';
import * as stationSalaryActions from 'actions/station_salary';
import * as FormActions from 'actions/form';
import * as DeliverymanActions from 'actions/deliveryman';
import { getStationListByScopeSignal, resetStationListWhenScopeChange } from 'actions/station_manage';

import LazyLoad from 'utils/lazy_load';
import { Noty, dateFormat, parseTime,getDate } from 'utils/index';
import {post ,GET,POST,PUT,TEST,del,get} from 'utils/request';
import V from 'utils/acl';

import { DELIVERY_MAP ,pay_status, MODES, SELECT_DEFAULT_VALUE, SIGN_STATUS_EXCEPTION, MAX} from 'config/app.config';


class TopHeader extends Component{
	render() {
		return (
			<div className='clearfix top-header'>
				<button  onClick={this.props.exportExcel} className="btn btn-theme btn-xs pull-right" style={{marginLeft: 20}}>
				  <i className="fa fa-download"></i> 导出
				</button>
			</div>
		)
	}


}

class FilterHeader extends Component{
	constructor(props){
		super(props);
		this.state ={
			all_deliveryman: [], 
			filter_deliveryman_results:[],
			selected_deliveryman_id: -1,
			_hasInitial:false,
			begin_time:getDate(-1),
			end_time:getDate(),
			province_id:-1,
			city_id:-1,
			station_id:-1,
			deliveryman_id:-1,
			COD:1,
			search_txt:'',
			search_ing:false,
			search_by_keywords_ing: false,			
		}
	}
	componentWillReceiveProps(nextProps){
		var { deliveryman } = nextProps;
		//只需要初始化一次
		if(deliveryman.load_success && !this.state._hasInitial){
		  this.setState({ _hasInitial:true});
		  var all = {} ;
		  all.deliveryman_id = 0;
		  all.deliveryman_name = '全部配送员';
		  all.deliveryman_mobile = '';
		  var { list } = deliveryman;
		  list.unshift(all);
/*		  this.setState({
		  	all_deliveryman: list, filter_deliveryman_results: list, selected_deliveryman_id: list.length && list[0].deliveryman_id
		  })*/
		  var build = function(){
		    var new_data = list.map(function(n){
		      n.py = window.makePy(n.deliveryman_name);
		      return n;
		    })
		    this.setState({
		      all_deliveryman: list, filter_deliveryman_results: new_data, selected_deliveryman_id: list.length && list[0].deliveryman_id
		    })
		  }.bind(this);

		  if(window.makePy){
		    build();
		  }else{
		    //异步加载的chinese_py库可能还未加载完成，所以需要定时检测
		    this._build_timer = setInterval(() => {
		      if(window.makePy){
		        build();
		        clearInterval(this._build_timer);
		        delete this._build_timer;
		      }
		    }, 100);
		  }
		}
	}
	render(){
		var {
			area,stations
		} = this.props;
		var {provinces , cities} = area ;
		var { filter_deliveryman_results, search_ing, search_by_keywords_ing } = this.state;
		var content = filter_deliveryman_results.map( (n, i) => {
      		return <option key={n.deliveryman_id + ' ' + i} value={n.deliveryman_id}>{n.deliveryman_name + ' ' + n.deliveryman_mobile}</option>
		})
		return(
			<div>
			<div className='clearfix top-header'>
				{
					V('DeliveryManSalaryManageExport')
					?<button  onClick={this.onExportExcel.bind(this)} className="btn btn-theme btn-xs pull-right" style={{marginLeft: 20}}>
					  <i className="fa fa-download"></i> 导出
					</button>
					:null
				}
				
			</div>
			<div className='panel search' >

				<div className='panel-body form-inline'>
          			{/*<SearchInput ref='searchKeywords' searchHandler={this.FilterDeliveyRecord.bind(this, 'search_by_keywords_ing')} searching={search_by_keywords_ing} className="form-inline v-mg space-right" placeholder="关键字" />*/}
					{'开始时间'}
					<DatePicker editable 
						upperLimit = {this.state.end_time}
						value = {this.state.begin_time}
						onChange = {this.onBegintimeChange.bind(this)}
						className="short-input" />
					{' 结束时间'}
					<DatePicker editable 
						lowerLimit = {this.state.begin_time}
						upperLimit = {getDate()}
						value = {this.state.end_time}
						onChange = {this.onEndtimeChange.bind(this)}
					  className="short-input space-right" />
					 {
					 	V('DeliveryManSalaryManageCityFilter')
					 	?[
					 		<Select key='province_filter' ref='province' name='province' options = {provinces} 
					 			onChange = {this.onProvinceChange.bind(this)}
					 			default-text = '请选择省份'/>,
					 		<Select key='city_filter' className='space-right' ref='city' name='city' options = { cities} 
					 			onChange= {this.onCityChange.bind(this)}
					 			default-text = '请选择城市'/>,
					 		<Select key='station_filter' className='space-right' ref='station' name = 'station' options = { stations }
					 			default-text = '请选择配送站' />
					 	]:null
					 }
					
					<div className="input-group input-group-sm" style={{height:'27px'}}>
						<span  style={{height:'27px',lineHeight:1}} className="input-group-addon"><i className="fa fa-search"></i></span>
						<input type="text"  style={{height:'27px', width:'120px'}} 
						  className="form-control" placeholder="配送员拼音首字母或手机号" 
						  onChange = {this.filterHandler.bind(this)} />
					</div>
					<select name= 'deliveryman' ref='deliveryman' className="form-control input-sm space-right"  style={{height:'27px',minWidth:100}}>
						{
							content.length
							? content
							: <option>无</option>
						}
					</select>
					<select ref='COD' default-text = '是否货到付款' className='form-control input-xs space-right'>
						<option value='-1'>是否货到付款</option>
						<option value='1'>是</option>
						<option value='2'>否</option>
					</select>
					<button disabled={search_ing} data-submitting = {search_ing} className="btn btn-theme btn-xs" onClick={this.FilterDeliveyRecord.bind(this, 'search_ing')}>
					  <i className="fa fa-search"></i>{' 搜索'}
					</button>
				</div>
			</div></div>
		)

	}
	filterHandler(e){
	  var { value } = e.target;
	  var { all_deliveryman } = this.state;
	  var results = [];
	  value = value.toUpperCase();
	  if(value === ''){
	    results = all_deliveryman;
	  }else if(/^\d+$/i.test(value)){ //电话号码
      	results = all_deliveryman.filter(n => n.deliveryman_mobile.indexOf(value) != -1)
      }else if(/^\w+$/i.test(value)){ //首字母
	    results = all_deliveryman.filter(n => {
	      return n.py.some(m => m.toUpperCase().indexOf(value) == 0)
	    })
	  }else{ //中文全称
	    results = all_deliveryman.filter(n => n.deliveryman_name.indexOf(value) != -1)
	  }
	  this.setState({ filter_deliveryman_results: results, selected_deliveryman_id: results.length && results[0].deliveryman_id });
	}
	onExportExcel(){
		var filterdata =  {};
		if(this.refs.searchKeywords){
			var keywords = this.refs.searchKeywords.refs.input.value;
			if(keywords != '')
				filterdata.keywords = keywords;
		}
		filterdata.begin_time = this.state.begin_time;
		filterdata.end_time = this.state.end_time;
		if(this.refs.station){
			var station_id = parseInt($(findDOMNode(this.refs.station))[0].value);
			if(station_id != this.refs.station.props['default-value'])
				filterdata.station_id = station_id;			
		}
		if(this.refs.province){
			var province_id = parseInt($(findDOMNode(this.refs.province))[0].value);
			if(province_id != this.refs.province.props['default-value'])
				filterdata.province_id = province_id;
		}
		if(this.refs.city){
			var city_id = parseInt($(findDOMNode(this.refs.city))[0].value);
			if(city_id != this.refs.city.props['default-value'])
				filterdata.city_id = city_id;
		}
		var deliveryman_id = this.refs.deliveryman.value;
		if(deliveryman_id != 0){
			filterdata.deliveryman_id = deliveryman_id;			 
		}
		var cod = this.refs.COD;
		if(cod != undefined){
			if(cod.value == 1){
				filterdata.isCOD = 1;
			}else if(cod.value == 2){
				filterdata.isCOD = 0;
			}			
		}
		this.props.actions.exportExcel(filterdata);
	}
	onBegintimeChange(time){
		this.setState({begin_time:time});
	}
	onEndtimeChange(time){
		this.setState({end_time:time});
	}
	onProvinceChange(e){
	  var {value} = e.target;
	  this.props.actions.resetCities();
	  if(value != this.refs.province.props['default-value'])
	    var $city = $(findDOMNode(this.refs.city));
		//this.props.actions.getCities(value);
	    this.props.actions.getCitiesSignal(value, 'authority').done(() => {
	      this.props.getStationListByScopeSignal({signal:'authority', province_id: value});
	      $city.trigger('focus'); //聚焦已使city_id的值更新

	    });
	}
	onCityChange(e){
		this.setState({ _hasInitial: false});
		var {value} = e.target;
		/*this.props.actions.getCityStations(value);*/
		var $deliveryman = $(findDOMNode(this.refs.deliveryman));
		if(value == SELECT_DEFAULT_VALUE){
			this.props.actions.getAllDeliveryman().done(() => {
				$deliveryman.trigger('focus');
			});
		}else{
			this.props.actions.getCityDeliveryman(value).done(() => {
				//this.props.actions.getCityStations(value);
				this.props.getStationListByScopeSignal({signal:'authority', city_id: value})
				$deliveryman.trigger('focus');
				
			});			
		}

	}
	FilterDeliveyRecord(search_in_state){
		this.setState({[search_in_state]:true});
		var filterdata =  {};
		if(this.refs.searchKeywords){
			var keywords = this.refs.searchKeywords.refs.input.value;
			if(keywords != '')
				filterdata.keywords = keywords;
		}
		filterdata.begin_time = this.state.begin_time;
		filterdata.end_time = this.state.end_time;
		if(this.refs.station){
			var station_id = parseInt($(findDOMNode(this.refs.station))[0].value);
			if(station_id != this.refs.station.props['default-value'])
				filterdata.station_id = station_id;			
		}
		if(this.refs.province){
			var province_id = parseInt($(findDOMNode(this.refs.province))[0].value);
			if(province_id != this.refs.province.props['default-value'])
				filterdata.province_id = province_id;
		}
		if(this.refs.city){
			var city_id = parseInt($(findDOMNode(this.refs.city))[0].value);
			if(city_id != this.refs.city.props['default-value'])
				filterdata.city_id = city_id;
		}
		var deliveryman_id = this.refs.deliveryman.value;
		if(deliveryman_id != 0){
			filterdata.deliveryman_id = deliveryman_id;			 
		}
		var cod = this.refs.COD;
		if(cod != undefined){
			if(cod.value == 1){
				filterdata.isCOD = 1;
			}else if(cod.value == 2){
				filterdata.isCOD = 0;
			}			
		}
		filterdata.page_no = 0;
		filterdata.page_size = this.props.page_size;
		this.props.actions.getDeliveryRecord(filterdata)
			.always(() => {
				this.setState({[search_in_state]:false});
			});
	}
	componentDidMount(){
		setTimeout(() => {
			LazyLoad('noty');
			this.props.actions.getProvincesSignal('authority');
			this.props.actions.getAllDeliveryman();
			this.props.getStationListByScopeSignal({signal:'authority'});
		}, 0);		
	}
}

/*FilterHeader = reduxForm({
  form: 'salary_manage_filter',
  fields: [
    'begin_time',
    'end_time',
    'province_id',
    'city_id',
    'deliveryman_id',
    'COD',
    'search_txt',
  ],
  destroyOnUnmount: false,
}, state => {
  var curDate = new Date();
  var now = dateFormat(new Date());
  return {

    initialValues: {
      begin_time: getDate(-1),
      end_time: now,
    }
  }
})( FilterHeader );*/

var SalaryRow = React.createClass({
  getInitialState: function() {
    return {
    	delivery_pay:0,
    	COD_amount:0,
    	remark:'',
    	is_review:false,
    	Edit_ing:false,
    };
  },
/*	componentWillReceiveProps(nextProps){
		this.setState({COD_amount:nextProps.COD_amount, remark:nextProps.remark})
	},*/
	render(){
		var {props} = this;
		var {main, is_POS} = props;
		var {active_order_id} = main;
		var str = '';
		if(is_POS != null && props.total_amount > 0){
			if(is_POS) str = '签收收款: POS机';
			else str = '签收收款: 现金'
		}
		return(
			<tr className={active_order_id == props.order_id ? 'active' : ''} onClick={this.ClickHandler}>
				<td ><div style={{width:80}}>{props.delivery_time}</div></td>
				<td><div style={{width:80}}>{props.signin_time}</div></td>
				<td>{props.order_id}</td>
				<RecipientInfo data={props} />
				<td>{props.deliveryman_name}<br/>{props.deliveryman_mobile}</td>
				<td>
					{ DELIVERY_MAP[props.delivery_type] }
				</td>
				<td>
					{ props.delivery_count >= 2 ? 
						[
						<span key='sec_signin'>第二次配送:正常签收</span>, <br key='sec_signin_br'/>,
						<span key='first_unsign'>第一次配送:未签收</span>,<br key='first_signin_br'/>,
						<a key='unSignCredential' href='javascript:;' onClick={this.showCredential}>[未签收凭证]</a>]
						:
						props.order_status == SIGN_STATUS_EXCEPTION ? 
						[<span key='span_unsign'>未签收</span>,<br key='unsign_br'/>,<a href='javascript:;' onClick={this.showCredential} key='unSign_Credential'>[未签收凭证]</a>]
						:<span>正常签收</span>
					}
				</td>
				<td>{props.delivery_count >= 2
					? '是'
					:'否'}</td>
				<td>
					{	pay_status[props.pay_status] }<br />
					{str}
				</td>
				<td>{'原价:￥'+ props.total_original_price / 100 }<br/>
					{ '实际售价:￥'+ props.total_discount_price /100 }<br/>
					{'应收金额:￥' + props.total_amount /100}</td>
				<td><input type='text' readOnly value={this.state.delivery_pay }
						ref = 'delivery_pay'
						className='form-control input-xs short-input'
						onChange = {this.onDeliverypayChange} 
						style={{width:50, marginLeft:'auto', marginRight:'auto',
						backgroundColor: this.state.is_review? '#dac7a7':''}}/></td>
				<td>
					<input type='text' readOnly className="form-control short-input" 
						ref = 'COD_amount'
						value ={this.state.COD_amount }
						onChange = {this.onReceiveAmountChange}
						style={{height:27,width:70, marginLeft:'auto', marginRight:'auto', 
								backgroundColor: this.state.is_review? '#dac7a7':''}}/></td>
				<td><input type='text' readOnly className='form-control' style={{height:27,
						backgroundColor: this.state.is_review? '#dac7a7':''}}
						ref = 'remark' 
						value = {this.state.remark}
						onChange = {this.onRemarkChange}/></td>
				<td>
					{
						V('DeliveryManSalaryManageEdit')
							?this.state.Edit_ing
								?[<a href='javascript:;' onClick = {this.onCancel}>[取消]</a>,<br/>]
								:[<a href='javascript:;' onClick = {this.onEdit}>[编辑]</a>,<br/>]
							:null
					}
					
					{
						V('DeliveryManSalaryManageCheck')
							?<a href='javascript:;' onClick={this.onChangeDeliveryRecord}>[审核完成]</a>
							:null
					}
				</td>
				<td>
					<a href='javascript:;' onClick={this.showOperationRecord}>{props.updated_time}</a>
				</td>
			</tr>
			)
	},
	ClickHandler:function(){
		if(this.props.main.active_order_id != this.props.order_id)
			this.props.actions.activeOrder(this.props.order_id);
	},
	showCredential:function(){
		this.props.viewCredentialModal(this.props.order_id);
	},
	showOperationRecord: function(){
		var data = {};
		data.order_id = this.props.order_id;
		data.owner_mobile = this.props.recipient_mobile;
		data.owner_name = this.props.recipient_name;
		this.props.viewOperationRecordModal(data);
	},
	componentDidMount:function(){
		this.setState({
			COD_amount:this.props.COD_amount / 100,
			remark:this.props.remark, 
			delivery_pay: this.props.delivery_pay / 100,
			is_review: this.props.is_review,})
	},
	onDeliverypayChange:function(e){
		var {value} = e.target;
		this.setState({delivery_pay:value});
	},
	onReceiveAmountChange:function(e){
		var {value} = e.target;
		this.setState({COD_amount:value});
	},
	onRemarkChange:function(e){
		var {value} = e.target;
		this.setState({remark:value});
	},
	onEdit:function(){
		this.setState({Edit_ing:true, is_review: false});
		var COD_amount = this.refs.COD_amount;
		var remark = this.refs.remark;
		var delivery_pay = this.refs.delivery_pay;
		COD_amount.removeAttribute('readOnly');
		remark.removeAttribute('readOnly');
		delivery_pay.removeAttribute('readOnly');
	},
	onChangeDeliveryRecord:function(){
		if(this.state.Edit_ing || !this.state.is_review){
			this.setState({Edit_ing:false});
			var data = {};
			data.COD_amount = this.state.COD_amount * 100;
			data.remark = this.state.remark;
			data.delivery_pay = this.state.delivery_pay * 100;
			data.updated_time = this.props.updated_time;
			var {order_id} = this.props;
			if(!/^\d+(\.\d+)?$/.test(this.state.COD_amount) || !/^\d+(\.\d+)?$/.test(this.state.delivery_pay)){
				this.setState({Edit_ing:true});
				Noty('warning','金额格式不正确');return;
			}
			if(this.state.COD_amount * 100 != this.props.total_amount && !data.remark){
				this.setState({Edit_ing:true});
				Noty('warning', '实收金额与应收金额数目不一致，请在备注原因'); return; 			
			}
			var COD_amount = this.refs.COD_amount ;
			var remark = this.refs.remark;
			var delivery_pay = this.refs.delivery_pay ;		
			this.props.actions.UpdateDeliverymanSalary(order_id,data);
			COD_amount.setAttribute('readOnly','true');
			remark.setAttribute('readOnly','true');
			delivery_pay.setAttribute('readOnly','true');
			this.setState({is_review:true});			
		}
			
	},
	onCancel:function(){
		var COD_amount = this.refs.COD_amount;
		var remark = this.refs.remark;
		var delivery_pay = this.refs.delivery_pay;
		COD_amount.setAttribute('readOnly','true');
		remark.setAttribute('readOnly','true');
		delivery_pay.setAttribute('readOnly','true');
		this.setState({COD_amount:this.props.COD_amount / 100 , remark:this.props.remark,delivery_pay:this.props.delivery_pay / 100,Edit_ing:false});
	}

})

class DeliveryManSalaryManagePannel extends Component{
	constructor(props){
		super(props);
		this.viewCredentialModal = this.viewCredentialModal.bind(this);
		this.viewOperationRecordModal = this.viewOperationRecordModal.bind(this);
		this.state = {
			page_size: 10,
		}
	}
	render(){
		var {area, dispatch, deliveryman, main, loading, refresh, stations} = this.props;
		var {exportExcel , getDeliveryProof, getOrderOptRecord, resetOrderOptRecord, getStationListByScopeSignal, resetStationListWhenScopeChange} = this.props.actions;
		var {deliveryRecord, check_order_info, active_order_id, proof, operationRecord, filter_data, total, COD_amount, POS_amount, cash_amount, delivery_pay, total_amount } = main;
		var page_no = filter_data == undefined ? 0 : filter_data.page_no;
		var { viewCredentialModal ,viewOperationRecordModal} = this;
		var {provinces, cities } = area;
		var content = deliveryRecord.map((n,i) => {
			return <SalaryRow key={n.order_id}
						{...{...n, ...this.props, viewCredentialModal, viewOperationRecordModal}} />;
		});
		return (
				<div className=''>
					{/*<TopHeader {...{exportExcel}}/>*/}
					<FilterHeader  {...{area,deliveryman,stations: stations.station_list, page_size: this.state.page_size}} actions = {{...bindActionCreators({...AreaActions(), ...FormActions, ...DeliverymanActions, 
											...stationSalaryActions, exportExcel, 
											resetStationListWhenScopeChange},dispatch) }}
									getStationListByScopeSignal = { getStationListByScopeSignal }/>
					<div className='panel' >
						<header className="panel-heading">工资信息列表</header>
						<div className="panel-body">
						  <div ref="table-container" className="table-responsive ">
						  	<div ref='box' id='box'  style={{maxHeight:434, overflowY:'auto', position:'relative'}} onscroll = {this.onTbScroll.bind(this)}>
							    <table id='tab' className="table table-hover text-center " ref='tab' style={{width:1784}}>
							      <thead >
							      <tr>
							        <th><div style={{width:80}}>配送时间</div></th>
							        <th><div style={{width:80}}>签收时间</div></th>
							        <th><div style={{width:120}}>订单号</div></th>
							        <th><div style={{width:220}}>收货人信息</div></th>
							        <th><div style={{width:140}}>配送员</div></th>
							        <th><div style={{width:80}}>配送方式</div></th>
							        <th><div style={{width:80}}>签收状态</div></th>
							        <th><div style={{width:100}}>是否第二次配送</div></th>
							        <th><div style={{width:80}}>支付状态</div></th>
							        <th><div style={{width:80}}>总金额</div></th>
							        <th><div style={{width:80}}>配送工资</div></th>
							        <th><div style={{width:80}}>实收金额</div></th>							        
							        <th><div style={{width:160}}>备注</div></th>
							        <th><div style={{width:80}}>管理操作</div></th>
							        <th><div style={{width:120}}>操作时间</div></th>
							      </tr>
							      </thead>
							      <tbody>
							      	{ 
							      		tableLoader( loading || refresh, content ) 
							      	}
							      </tbody>
							    </table>
						    </div>
						    <Pagination
						        page_no={page_no}
						        total_count={total}
						        page_size={this.state.page_size} 
						        onPageChange = {this.onPageChange.bind(this)}/>
						    <div className='form-inline'>
							    <div style={{marginTop:20,float:'left'}}>
							    	<span style={{marginRight:10}}><i style={{color:'#ccc',}} className='fa fa-square'></i><span style={{fontSize:10}}>待审核</span></span>
							    	<span ><i style={{color:'#dac7a7'}} className='fa fa-square'></i><span style={{fontSize:10}}>审核完成</span></span>
							    </div>
							    <div style={{marginTop:20,float:'right'}}>
							    	<span style={{fontWeight:'bold'}}>{'应收金额总计：'}</span>
							    	<input readOnly type='text' style={{width:100}} 
							    		value = {total_amount / 100}
							    		className="form-control input-xs short-input"/>
							    	<span style={{fontWeight:'bold'}}>{'　工资总计：'}</span>
							    	<input readOnly type='text' style={{width:100}} 
							    		value ={delivery_pay / 100}
							    		className="form-control input-xs short-input"/>
							    	<span style={{fontWeight:'bold'}}>{'　实收金额总计：'}</span>
							    	<input readOnly type='text' style={{width:100}} 
							    		value = {COD_amount / 100}
							    		className="form-control input-xs short-input"/>
							    	{'　(现金:￥' + cash_amount / 100 }{',POS机:￥' + POS_amount / 100}{')　'}
							    </div>
						    </div>
						    <div className='clearfix'></div>
						  </div>
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

					  <CredentialsModal ref="viewCredential" pics = {proof} {...{getDeliveryProof}}/>
					  <OperationRecordModal ref='viewOperationRecord' {...{getOrderOptRecord, resetOrderOptRecord, list:operationRecord.list || [], page_no:0}}/>
				</div>
			)
	}
	componentDidMount(){
		this.onTbScroll('tab','box',1);
		LazyLoad('chinese_py');
		this.props.actions.resetDeliveryRecord();

		/*this.props.actions.getDeliveryRecord();*/
		//this.props.actions.getProvinces();
/*		window.onload = function (){
			
		}*/		
	}
	onPageChange(page){
		this.search(page);
	}
	search(page){
		var {filter_data} = this.props.main;
		var {page_no} = filter_data;
    	page = typeof page == 'undefined' ? page_no : page;
    	filter_data.page_no = page;
    	this.props.actions.getDeliveryRecord(filter_data);
	}
	viewCredentialModal(order_id){
		this.refs.viewCredential.show(order_id);
	}
	viewOperationRecordModal(data){
		this.refs.viewOperationRecord.show(data);
	}
	onTbScroll(viewid, scrollid, size){
	    	// 获取滚动条容器
		var scroll = document.getElementById(scrollid);
		/*var scroll = $(findDOMNode(this.refs.tab));*/
	        // 将表格拷贝一份
		var tb2 = document.getElementById(viewid).cloneNode(true);
		/*var tb2 = $(findDOMNode(this.refs.box).cloneNode(true));*/
	        // 获取表格的行数
		/*var len = tb2.rows.length;*/
		var len = tb2.rows.length;
	        // 将拷贝得到的表格中非表头行删除
		for(var i=tb2.rows.length;i>size;i--){
			// 每次删除数据行的第一行
	                tb2.deleteRow(size);
		}
	        // 创建一个div
		var bak = document.createElement("div");
	        // 将div添加到滚动条容器中
		scroll.appendChild(bak);
	        // 将拷贝得到的表格在删除数据行后添加到创建的div中
		bak.appendChild(tb2);
	        // 设置创建的div的position属性为absolute，即绝对定于滚动条容器（滚动条容器的position属性必须为relative）
		bak.style.position = "absolute";
	        // 设置创建的div的背景色与原表头的背景色相同（貌似不是必须）
		bak.style.backgroundColor = "#fff";
	        // 设置div的display属性为block，即显示div（貌似也不是必须，但如果你不希望总是显示拷贝得来的表头，这个属性还是有用处的）
		bak.style.display = "block";
	        // 设置创建的div的left属性为0，即该div与滚动条容器紧贴
		bak.style.left = 0;
	        // 设置div的top属性为0，初期时滚动条位置为0，此属性与left属性协作达到遮盖原表头
		bak.style.top = "0px";
	        // 给滚动条容器绑定滚动条滚动事件，在滚动条滚动事件发生时，调整拷贝得来的表头的top值，保持其在可视范围内，且在滚动条容器的顶端

		// 设置div的top值为滚动条距离滚动条容器顶部的距离值
		bak.style.top = scroll.scrollTop + 'px';
	        // 给滚动条容器绑定滚动条滚动事件，在滚动条滚动事件发生时，调整拷贝得来的表头的top值，保持其在可视范围内，且在滚动条容器的顶端
		scroll.onscroll = function(){
	                // 设置div的top值为滚动条距离滚动条容器顶部的距离值
			bak.style.top = this.scrollTop+"px";
		}				
	}


}

class CredentialsModal extends Component{
	render(){
		var {call_picture_url, door_picture_url, receipt_picture_url, sms_picture_url} = this.props.pics;
		var credentials =[];
		credentials = [
			{url:receipt_picture_url, title:'单据'},
			{url:door_picture_url, title: '门牌'},
			{url:call_picture_url, title: '通话记录'},
			{url:sms_picture_url, title:'短信截屏'},
		]
		return(
			<StdModal title = '未签收照片凭证' ref='viewCredential' footer={false}>
				
				<table className='table table-responsive'>
				<tbody>
					<tr>
						<td>
							<img onClick={this.alertBigImg.bind(this, 0)} style={{width:200,height:200}} src = {receipt_picture_url}/><br/>
							<span>单据</span>
						</td>
						<td>
							<img onClick={this.alertBigImg.bind(this, 1)} style={{width:200,height:200}} src = {door_picture_url} /><br />
							<span>门牌</span>
						</td>
					</tr>
					<tr>
						<td>
							<img onClick={this.alertBigImg.bind(this, 2)} style={{width:200,height:200}} src={call_picture_url} /><br/>
							<span>通话记录</span>
						</td>
						<td>
							<img onClick={this.alertBigImg.bind(this, 3)} style={{width:200,height:200}} src={sms_picture_url} /><br />
							<span>短信截屏</span>
						</td>
					</tr>
				</tbody>
				</table>
				<div className='form-group pull-right'>
				  <button className="btn btn-theme btn-sm space-right" onClick={this.hide.bind(this)}>关闭</button>           
				</div>
				<BigImgModal ref='bigImgModal' {...{credentials}}/>
			</StdModal>
			)
	}
	show(orderId){
		this.props.getDeliveryProof(orderId);
		this.refs.viewCredential.show();
	}
	hide(){
		this.refs.viewCredential.hide();
	}
	alertBigImg(index){
		this.refs.bigImgModal.show(index);
	}
}

class BigImgModal extends Component{
	constructor(props){
		super(props);
		this.state = {
			index: 0,
		}
	}
	render(){
		var {credentials} = this.props;
		var {index} = this.state;
		var title = credentials[index].title;
		var url = credentials[index].url;
		return(
			<StdModal ref='bigImg' title={title} footer={false}>
				<div>
					<div>
						<img style={{maxWidth: 570}} src={url}/>
					</div>
					<div>
						<span style={{cursor:'pointer'}} onClick={this.goPre.bind(this)}>上一张</span>
						<span style={{cursor:'pointer'}} onClick={this.goNext.bind(this)}>下一张</span>
					</div>
				</div>
			</StdModal>
			)
	}
	show(index){
		this.setState({index});
		this.refs.bigImg.show();
	}
	goPre(){
		var {index} = this.state;
		var {credentials} = this.props;
		if(index <= 0)
			index = credentials.length -1;
		else
			index -= 1;
		this.setState({index});		
	}
	goNext(){
		var {index} = this.state;
		var {credentials} = this.props;
		if(index >= credentials.length -1)
			index = 0;
		else
			index += 1;
		this.setState({index});
	}
}

/*class OperationRecordModal extends Component{
	render(){		
		return(
			<StdModal title = '操作历史记录' ref='viewOperationRecordModal'>

			</StdModal>
			)
	}
	show(){
		this.refs.viewOperationRecordModal.show();
	}
	hide(){
		this.refs.viewOperationRecordModal.hide();
	}
}*/

function mapStateToProps({stationSalaryManage}){
	return stationSalaryManage;
}

function mapDispatchToProps(dispatch){
	var actions ={actions: bindActionCreators({
	  	...AreaActions(AreaActionTypes1), 
	    ...stationSalaryActions,
	    ...DeliverymanActions,
	    getStationListByScopeSignal,
	    resetStationListWhenScopeChange
	  }, dispatch)};
	actions.dispatch = dispatch;
	return actions;
}

export default connect(mapStateToProps, mapDispatchToProps)(DeliveryManSalaryManagePannel)
