/**
 * 订单完成页面
 */
import React, {Component, PropTypes} from 'react';
import { render, findDOMNode } from 'react-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import LinkedStateMixin from 'react-addons-linked-state-mixin';
import { reduxForm } from 'redux-form';

import clone from 'clone';

import DatePicker from 'common/datepicker';
import Select from 'common/select';
import TimeInput from 'common/time_input';
import Pagination from 'common/pagination';
import LineRouter from 'common/line_router';
import StdModal from 'common/std_modal';
import { tableLoader } from 'common/loading';
import RadioGroup from 'common/radio_group';
import SearchInput from 'common/search_input';
import RecipientInfo from 'common/recipient_info';
import ToolTip from 'common/tooltip';
import AddressSelector from 'common/address_selector';

import { order_status, DELIVERY_MAP, YES_OR_NO ,ACCESSORY_CATE_ID, pay_status} from 'config/app.config';
import history from 'history_instance';
import LazyLoad from 'utils/lazy_load';
import { form, Noty, dateFormat, parseTime, dom } from 'utils/index';
import V from 'utils/acl';

import * as OrderActions from 'actions/orders';
import AreaActions from 'actions/area';
import DeliverymanActions from 'actions/deliveryman';
import * as DeliveryDistributeActions from 'actions/delivery_distribute';
import { getPayModes } from 'actions/order_manage_form';
import * as OrderSupportActions from 'actions/order_support';
import { triggerFormUpdate } from 'actions/form';
import { getStationListByScopeSignal, resetStationListWhenScopeChange } from 'actions/station_manage';

import OrderProductsDetail from 'common/order_products_detail';
import OrderDetailModal from './order_detail_modal';
import ScanModal from 'common/scan_modal';
import OperationRecordModal from 'common/operation_record_modal.js';
import { DeliverymanActionTypes2 } from 'actions/action_types';

class TopHeader extends Component {
  render(){
    return (
      <div className="clearfix top-header">
        {
          V('DeliveryManageDistributeExportExcel')
            ?
            <button onClick={this.props.exportExcel} className="btn btn-theme btn-xs pull-right" style={{marginLeft: 20}}>
              <i className="fa fa-download"></i> 导出
            </button>
            :
            null
        }

        <LineRouter 
          routes={[{name: '送货单管理', link: ''}, {name: '完成列表', link: ''}]} />
      </div>
    )
  }
}

class FilterHeader extends Component {
  constructor(props){
    super(props);
    this.state = {
      search_ing: false,
      search_by_keywords_ing: false,
      filter_deliveryman_results: [],
      selected_deliveryman_id: 0,
      all_print_status: YES_OR_NO,
    };
    this.AddressSelectorHook = this.AddressSelectorHook.bind(this);
  }
  componentWillReceiveProps(nextProps){
    var { deliveryman } = nextProps;
    //只需要初始化一次
    if(deliveryman.load_success && !this.state._hasInitial){
      var all = {} ;
      all.deliveryman_id = 0;
      all.deliveryman_name = '选择配送员';
      all.deliveryman_mobile = '';
      this.setState({ _hasInitial:true});
      var { list } = deliveryman;
      list.unshift(all);
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
      fields: {
        keywords,
        begin_time,
        end_time,
        pay_modes_id,
        status,
        deliveryman_id,
        delivery_id,
        province_id,
        city_id,
        district_id,
      },
      provinces,
      cities,
      districts,
      stations: { station_list },
      all_order_status,
      all_pay_modes,
    } = this.props;
    var { filter_deliveryman_results, search_ing, search_by_keywords_ing } = this.state;
    var content = filter_deliveryman_results.map( (n, i) => {
          return <option key={n.deliveryman_id + ' ' + i} value={n.deliveryman_id}>{n.deliveryman_name + ' ' + n.deliveryman_mobile}</option>
    })
    return (
      <div className="panel search">
        <div className="panel-body">
          <div className="form-group form-inline">
            <SearchInput {...keywords} searchHandler={this.search.bind(this, 'search_by_keywords_ing')} searching={search_by_keywords_ing} className="form-inline v-mg" placeholder="关键字" />
            {' 开始时间'}
            <DatePicker editable redux-form={begin_time} className="short-input" />
            {' 结束时间'}
            <DatePicker editable redux-form={end_time} className="short-input space-right" />
            <Select {...pay_modes_id} options={all_pay_modes} default-text="选择支付方式" className="space-right"/>
            <Select {...status} options={all_order_status} default-text="选择订单状态" className="space-right"/>
            {
              V( 'DeliveryManageDistributeAddressFilter' )
              ? <AddressSelector
                  {...{ province_id, city_id, district_id, provinces, cities, districts, actions: this.props,
                   AddressSelectorHook: this.AddressSelectorHook, form: 'order_distribute_filter' }}
                />
              : null
            }
            {
              V( 'DeliveryManageDistributeStationFilter' )
                ? <Select {...delivery_id} options={station_list} default-text="选择配送中心" className="space-right"/>
                : null
            }
            <div className="input-group input-group-sm" style={{height:'27px'}}>
              <span  style={{height:'27px',lineHeight:1}} className="input-group-addon"><i className="fa fa-search"></i></span>
              <input type="text"  style={{height:'27px', width:'120px'}} 
                className="form-control" placeholder="配送员拼音首字母或手机号" 
                onChange = {this.filterHandler.bind(this)} />
            </div>
            <select onChange={this.onSelectDeliveryman.bind(this)} {...deliveryman_id} name= 'deliveryman' ref='deliveryman' className="form-control input-sm"  style={{height:'27px',minWidth:100}}>
              {
                content.length
                ? content
                : <option>无</option>
              }
            </select>
            {' '}
            <button disabled={search_ing} data-submitting={search_ing} onClick={this.search.bind(this, 'search_ing')} className="btn btn-theme btn-xs space-right">
              <i className="fa fa-search"></i>{' 搜索'}
            </button>
            {' '}
            {
              V( 'DeliveryManageDistributeScan' )
                ?<button onClick={this.onScanHandler.bind(this)} className="btn btn-theme btn-xs space-right">扫描</button>
                :null
            }
            
          </div>
        </div>
      </div>
    )
  }
  componentDidMount(){
    setTimeout(function(){
      var { getProvincesSignal, getPayModes, getAllDeliveryman, getStationListByScopeSignal } = this.props;
      getProvincesSignal();
      getPayModes();
      getAllDeliveryman();
      getStationListByScopeSignal();
      LazyLoad('noty');
    }.bind(this),0)
  }
  AddressSelectorHook(e, data){
    this.props.resetStationListWhenScopeChange('order_distribute_filter');
    this.props.getStationListByScopeSignal({ ...data });
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
    this.props.triggerFormUpdate('order_distribute_filter', 'deliveryman_id', results.length && results[0].deliveryman_id)
    this.setState({ filter_deliveryman_results: results, selected_deliveryman_id: results.length && results[0].deliveryman_id });
  }
  onSelectDeliveryman(e){
    this.setState({ selected_deliveryman_id: e.target.value});
  } 
  search(search_in_state){
    this.setState({[search_in_state]: true});
    this.props.triggerFormUpdate('order_distribute_filter', 'order_ids', ''); //清空扫描列表
    this.props.getOrderDistributeList({page_no: 0, page_size: this.props.page_size})
      .always(()=>{
        this.setState({[search_in_state]: false});
      });
  }
  onScanHandler(){
    this.props.showScanModal();
  }
}
FilterHeader.propTypess = {
  provinces: PropTypes.array.isRequired,
  cities: PropTypes.array.isRequired,
  all_pay_modes: PropTypes.array.isRequired,
  delivery_stations: PropTypes.array.isRequired,
  all_order_status: PropTypes.array.isRequired,
  all_pay_modes: PropTypes.array.isRequired,
  all_deliveryman: PropTypes.array.isRequired,
}
FilterHeader = reduxForm({
  form: 'order_distribute_filter',
  fields: [
    'keywords',
    'begin_time',
    'end_time',
    'pay_modes_id',
    'status',
    'deliveryman_id',
    'delivery_id',
    'province_id',
    'city_id',
    'district_id',

    'order_ids' //扫描结果
  ]
}, state => {
  var now = dateFormat(new Date());
  return {
    //赋初始值
    initialValues: {
      begin_time: now,
      end_time: now,
    }
  }
})( FilterHeader );

class OrderRow extends Component {
  render(){
    var { props } = this;
    var _order_status = order_status[props.status] || {};
    return (
      <tr onClick={this.clickHandler.bind(this)} className={props.active_order_id == props.order_id ? 'active' : ''}>
        <td>
          <input onChange={this.checkOrderHandler.bind(this)} checked={props.checked} disabled={props.status == 'COMPLETED'} type="checkbox" />
        </td>
        <td>
          {
            props.status == 'DELIVERY'
              ? [
                  V('DeliveryManageDistributeSigninOrder') && [
                    <a onClick={this.showSignedModal.bind(this)} key="signin" href="javascript:;">[签收]</a>,
                    <br key="br" />,
                  ],
                  V('DeliveryManageDistributeUnSigninOrder') &&
                  <a onClick={this.showUnSignedModal.bind(this)} key="unsignin" href="javascript:;">[未签收]</a>
                ]
              : 
                  V('DeliveryManageDistributeEditSigninOrder') && 
                    <a onClick={this.showEditModal.bind(this)} key="signin" href="javascript:;">[编辑]</a>

          }
        </td>
        <td>{props.delivery_time ? parseTime(props.delivery_time) : '未知'}</td>
        <td>￥{props.total_amount/100}</td>
        <td>{props.owner_name}<br />{props.owner_mobile}</td>
        <RecipientInfo data={props} />
        <td><a onClick={props.viewOrderDetail} href="javascript:;">{props.order_id}</a></td>
        <td>{props.delivery_type}</td>
        <td><div className="remark-in-table">{props.remarks}</div></td>
        <td>{parseTime(props.signin_time)}</td>
        <td>
          <div 
            className="bordered bold order-status"
            style={{color: _order_status.color || 'inherit', background: _order_status.bg }}
            onMouseEnter={() => props.status == 'DELIVERY' && this.refs.tooltip_delivery.show()}
            onMouseLeave={() => props.status == 'DELIVERY' && this.refs.tooltip_delivery.hide()}
            >
            {_order_status.value}
            {
              props.status == 'DELIVERY'
                ? (
                    <ToolTip key="tooltip" placement="left" ref="tooltip_delivery" >
                      <div className="nowrap">
                        配送员：{props.deliveryman_name}　{props.deliveryman_mobile}
                      </div>
                    </ToolTip>
                  )
                : null
            }
          </div>
        </td>
        <td>{props.updated_by}</td>
        <td><a onClick={this.viewOrderOperationRecord.bind(this)} className="inline-block time" href="javascript:;">{props.updated_time}</a></td>
      </tr>
    )
  }
  showSignedModal(e){
    this.props.showSignedModal(this.props);
    e.stopPropagation();
  }
  showUnSignedModal(e){
    this.props.showUnSignedModal(this.props);
    e.stopPropagation();
  }
  showEditModal(e){
    this.props.showEditModal(this.props);
    e.stopPropagation();
  }
  checkOrderHandler(e){
    var { order_id, checkOrderHandler } = this.props;
    checkOrderHandler(order_id, e.target.checked);
  }
  clickHandler(){
    this.props.activeOrderHandler(this.props.order_id);
  }
  viewOrderOperationRecord(e){
    this.props.viewOrderOperationRecord(this.props);
    e.stopPropagation();
  }
}

class DeliveryDistributePannel extends Component {
  constructor(props){
    super(props);
    this.state = {
      page_size: 8,
    }
    this.showSignedModal = this.showSignedModal.bind(this);
    this.showUnSignedModal = this.showUnSignedModal.bind(this);
    this.showEditModal = this.showEditModal.bind(this);
    this.checkOrderHandler = this.checkOrderHandler.bind(this);
    this.activeOrderHandler = this.activeOrderHandler.bind(this);
    this.viewOrderDetail = this.viewOrderDetail.bind(this);
    this.viewOrderOperationRecord = this.viewOrderOperationRecord.bind(this);
    this.showScanModal = this.showScanModal.bind(this);
    this.search = this.search.bind(this);
    this.refreshDataList = this.refreshDataList.bind(this);
  }
  render(){
    var { filter, area, deliveryman, order_deliveryman, orders, main, all_order_srcs, all_pay_modes, signOrder, unsignOrder, dispatch, 
      searchByScan, exportExcel, getOrderOptRecord, resetOrderOptRecord, operationRecord, D_, editSignedOrder, resetDeliveryman  } = this.props;
    var { submitting } = main;
    var { loading, refresh, page_no, checkall, total, list, check_order_info, active_order_id, get_products_detail_ing } = orders;
    var { search, showSignedModal, showUnSignedModal, showEditModal,showScanModal, checkOrderHandler, 
      viewOrderDetail, activeOrderHandler, viewOrderOperationRecord, refreshDataList } = this;

    var {scan} = main; //扫描
    var content = list.map((n, i) => {
      return <OrderRow 
        key={n.order_id} 
        {...{...n, active_order_id, showSignedModal, showUnSignedModal, showEditModal,
          viewOrderDetail, checkOrderHandler, activeOrderHandler, viewOrderOperationRecord, D_}}
      />;
    })
    return (
      <div className="order-manage">

        <TopHeader exportExcel={exportExcel} />
        <FilterHeader
          {...{...this.props, ...filter, ...area, showScanModal}}
          {...{...bindActionCreators({...DeliverymanActions()}, dispatch)}}
          page_size={this.state.page_size}
        />

        <div className="panel">
          <header className="panel-heading">送货列表</header>
          <div className="panel-body">
            <div ref="table-container" className="table-responsive main-list">
              <table className="table table-hover text-center">
                <thead>
                <tr>
                  <th><input checked={checkall} onChange={this.checkAll.bind(this)} type="checkbox" /></th>
                  <th>管理操作</th>
                  <th>配送时间</th>
                  <th>货到付款金额</th>
                  <th>下单人</th>
                  <th>收货人信息</th>
                  <th>订单号</th>
                  <th>配送方式</th>
                  <th>备注</th>
                  <th>订单完成时间</th>
                  <th>订单状态</th>
                  <th>操作人</th>
                  <th>操作时间</th>
                </tr>
                </thead>
                <tbody>
                  { tableLoader( loading || refresh, content ) }
                </tbody>
              </table>
            </div>

            {
              scan
                ? null
                : <Pagination 
                    page_no={page_no} 
                    total_count={total} 
                    page_size={this.state.page_size} 
                    onPageChange={this.onPageChange.bind(this)}
                  />
            }
          </div>
        </div>

        { check_order_info
          ? <div className="panel">
              <div className="panel-body">
                <div>订单产品详情</div>
                <OrderProductsDetail loading={get_products_detail_ing} products={check_order_info.products} />
              </div>
            </div>
          : null }

        <OrderDetailModal ref="detail_modal" data={check_order_info || {}} all_order_srcs={all_order_srcs.map} all_pay_modes={all_pay_modes} />
        <SignedModal ref="SignedModal" {...{submitting, signOrder,loading,refresh, D_, callback: refreshDataList, order_deliveryman, resetDeliveryman}} />
        <UnSignedModal ref="UnSignedModal" {...{submitting, unsignOrder, callback: refreshDataList}} />
        <EditModal ref="EditModal" {...{D_, editSignedOrder, order_deliveryman, resetDeliveryman}}/>
        <ScanModal ref="ScanModal" submitting={submitting} search={searchByScan}  />
        <OperationRecordModal ref="OperationRecordModal" {...{getOrderOptRecord, resetOrderOptRecord, ...operationRecord}} />
      </div>
    )
  }
  onPageChange(page){
    var unlock = dom.lock(this.refs['table-container']);
    this.search(page).done(unlock);
  }
  componentDidMount() {
    this.search();

    LazyLoad('noty');
    LazyLoad('chinese_py');

    var { getOrderSrcs, getPayModes } = this.props;
    getOrderSrcs();
    getPayModes();
  }
  search(page){
    var { getOrderDistributeList, orders } = this.props;
    page = typeof page == 'undefined' ? orders.page_no : page;
    return getOrderDistributeList({page_no: page, page_size: this.state.page_size});
  }
  refreshDataList(){
    //更新数据，需要loading图
    this.props.refreshDataList();
    this.search();
  }
  activeOrderHandler(order_id){
    if(this.props.orders.active_order_id != order_id)
      this.props.activeOrder(order_id);
  }
  checkOrderHandler(order_id, checked){
    this.props.checkOrder(order_id, checked);
  }
  checkAll(e){
    this.props.checkAllOrders(e.target.checked);
  }
  viewOrderDetail(){
    this.refs.detail_modal.show();
  }
  viewOrderOperationRecord(order){
    this.refs.OperationRecordModal.show(order);
  }
  showSignedModal(n){
    this.props.getDeliverymanByOrder(n.order_id);
    /*this.props.getOrderSpareparts(n.order_id);   */ 
    this.props.getOrderDetail(n.order_id);
    
    this.props.getSpareparts(n.order_id);
    this.refs.SignedModal.show(n);
  }
  showUnSignedModal(n){
    this.refs.UnSignedModal.show(n);
  }
  showScanModal(){
    this.refs.ScanModal.show();
  }
  showEditModal(n){
    this.props.getDeliverymanByOrder(n.order_id);
    this.props.getOrderDetail(n.order_id);
    this.refs.EditModal.show(n);
  }

}

function mapStateToProps({distributeManage}){
  return distributeManage;
}

/* 这里可以使用 bindActionCreators , 也可以直接写在 connect 的第二个参数里面（一个对象) */
function mapDispatchToProps(dispatch){
  var actions = bindActionCreators({
    ...OrderActions,
    ...AreaActions(),
    ...OrderSupportActions,
    ...DeliverymanActions(DeliverymanActionTypes2),
    ...DeliveryDistributeActions,
    getPayModes,
    triggerFormUpdate,
    getStationListByScopeSignal,
    resetStationListWhenScopeChange
  }, dispatch);
  actions.dispatch = dispatch;
  return actions
}

export default connect(mapStateToProps, mapDispatchToProps)(DeliveryDistributePannel);

/***************   *******   *****************/
/***************   子模态框   *****************/
/***************   *******   *****************/

var PartRow = React.createClass({
  render(){
    var { props } = this;
    return (
      <tr>
        <td>{ props.name }</td>
        <td>{ '￥ ' + (props.unit_price/100).toString() }</td>
        <td>{ props.sub }</td>
        <td>
        <button 
          className='btn btn-sm btn-default' 
          style={{borderRadius:'10px 10px',width:'20px',height:'20px',lineHeight:'0.5',padding:'5px 5px'}}
          onClick = { this.onDecrement }>-</button>
        {' ' + props.num + ' '}
        <button 
          className='btn btn-sm btn-default' 
          style={{borderRadius:'10px 10px',width:'20px',height:'20px',lineHeight:'0.5',padding:'5px 5px'}}
          onClick = { this.onIncrement}>+</button>
        </td>
        <td>
          <input type = "text" value = { props.greeting_card } onChange= { this.onRemarksChange}/>
        </td>
      </tr>
      )
  },

  onRemarksChange(e){
    this.props.onRemarksChange(this.props.sku_id,e);
  },
  onIncrement(){
    this.props.onIncrement(this.props.sku_id);
  },
  onDecrement(){
    this.props.onDecrement(this.props.sku_id);
  }
})

class PartNode extends Component{  
  render(){
    var { data } = this.props ;
    return (
      <div style={{float:'left',height:'30px',margin:'5px 5px',}} onClick= {this.onChoose.bind(this)}>
        <img src={data.img_url || ''} style={{height:'30px',width:'30px', display: 'none'}}/>
        <span className='partBtn'><i className='fa fa-star-o'></i>{ data.name }</span>      
      </div>
      )
  }
  onChoose(e){
     this.props.onChange(this.props.data);
  }
}

class PartNodeSub extends Component{
  render(){
    var { data } = this.props ;
    return (
      <div style={{float:'left',height:'30px',margin:'5px 5px',}} onClick= {this.onChoose.bind(this)}>
        <img src={data.icon} style={{height:'30px',width:'30px',display:'none'}}/>
        <span className='partBtn'>{ data.name }</span>      
      </div>
      )
  }
  onChoose(e){
     this.props.onChange(this.props.data);
  }
}


class SparePartsGroup extends Component{
  constructor(props){
    super(props);
    this.state = {
      chosen_id : -1,
    }
  }

  render(){
    /*var {list } = this.props;*/
    var tmp = this.props.list.filter (n => n.sku_id == this.state.chosen_id);
    tmp = tmp.map( m => m.children = m.children || []);
/*    var children = tmp.length > 0 ? tmp[0].children : [];
    var parent_id = tmp.length > 0 ? tmp[0].id : -1;
    var parent_name = tmp.length > 0 ? tmp[0].name : '';*/
    return(
      <div>
        {
/*          children.length > 0
          ?
            [
              <div style={{paddingBottom:'10px'}}>
                {
                  this.props.list.map( n => 
                  {
                    return (<PartNode data = {n} onChange= {this.onPartChange.bind(this)}/> )             
                  })
                }
              </div>,
              <div style={{clear:'both',paddingTop:'10px',paddingBottom:'10px'}}>
                {
                  children.map( m =>
                  {
                    return (<PartNodeSub data = { {...m, parent_id, parent_name}} onChange= {this.onPartChange.bind(this)}/> )
                  })
                }
              </div>
          ]:*/
          <div style={{paddingBottom:'10px'}}>
            {
              this.props.list.map( (n, i) => 
                {
                  return (<PartNode key={n.sku_id || i} data = {n} onChange= {this.onPartChange.bind(this)}/> )             
                }
              )
            }
          </div>
        }
      </div>
    )
  }

  onPartChange(e){
    this.setState({chosen_id:e.sku_id});
    this.props.onChange(e);
  }
}

var SignedModal = React.createClass({
  getInitialState: function() {
    return {
      CASH: 'CASH', //现金赔偿
      FULL_REFUND: 'FULL_REFUND', //全额退款

      order: {},

      signin_date: dateFormat(new Date()),
      // signin_hour: '',  // 直接 TimeInput.val()获取
      late_minutes: 0,
      refund_method: '',
      refund_money: 0,
      refund_reson: '',
      order_refund_money: 0,
      plus_amount: 0,
      minus_amount: 0,
      orderSpareparts:[],
      current_id: -1,
      pay_way:1,
      is_refund: false,
      all_deliveryman: [],
      filter_deliveryman_results: [],
    };
  },
  mixins: [ LinkedStateMixin ],
  render: function(){
    var { signin_date, late_minutes, refund_method, refund_money, refund_reson,current_id, order_deliveryman , POS_terminal_id, plus_amount, minus_amount, order_refund_money, filter_deliveryman_results, order} = this.state;
    var { D_ ,loading, refresh } = this.props;
    
    var { spareparts, orderDetail } =  D_ ;
    /*var { order_deliveryman } =  D_ ;*/
    var content = this.state.orderSpareparts.map( (n, i) => {
      return <PartRow key = {n.sku_id + ' ' + i} 
                {...n} 
                onRemarksChange = { this.onRemarksChange }
                onIncrement = {this.onIncrement}
                onDecrement = {this.onDecrement}/>
    });
    var deliveryman_content = filter_deliveryman_results.map( (n, i) => {
          return <option key={n.deliveryman_id + ' ' + i} value={n.deliveryman_id}>{n.deliveryman_name + ' ' + n.deliveryman_mobile}</option>
    })
    return (
      <StdModal submitting={this.props.submitting} onConfirm={this.submitHandler} onCancel={this.hideCallback} title="订单完成页面" ref="modal">
        <div className="form-group mg-15 form-inline">
          <div className = "row">
            <div className="col-xs-6">
              <label>{'签收时间：'}</label>
              <DatePicker value={signin_date} onChange={this.onSignInDateChange} className="short-input" />
              {'　'}
              <TimeInput onChange={this.onTimeChange} onOK={this.onTimeOK} ref="timeinput" />
            </div>
            <div className="col-xs-6">
              <label>{'迟到时长：'}</label>
              <div className="inline-block input-group input-group-xs">
                <input value={late_minutes} onChange={this.onLateTimeChange} type="text" className="form-control" style={{'width': 50}} />
                <span className="input-group-addon">Min</span>
              </div>
            </div>
          </div>
        </div>
        <div className="form-group form-inline mg-15">
          <label>{'　配送员：'}</label>
          <div className="input-group input-group-xs" style={{height:'27px'}}>
            <span  style={{height:'27px',lineHeight:1}} className="input-group-addon"><i className="fa fa-search"></i></span>
            <input type="text"  style={{height:'27px'}} 
              className="form-control" placeholder="配送员拼音首字母或手机号" 
              onChange = {this.filterHandler} />
          </div>
          <select name= 'deliveryman' onChange = {this.onDeliverymanChange} value={current_id} ref='deliveryman' className="form-control input-sm space-left"  style={{height:'27px',minWidth:100}}>
            {
              deliveryman_content.length
              ? deliveryman_content
              : <option>无</option>
            }
          </select>
          {/*<Select name = 'deliveryman_id' options = { order_deliveryman } value = { current_id } ref = 'deliveryman_id' onChange= {this.onDeliverymanChange}/>*/}
        </div>

        <div className="form-group mg-15">
          <label>
            <input checked = {this.state.is_refund} type = 'checkbox' onClick={this.isRefundChange}/>
            {' 使用幸福承诺'}
          </label>
        </div>
        {
          this.state.is_refund && 
          [<div className="form-group mg-15">
            <label className="">
              <input value={this.state.CASH} onClick={this.checkMethod} checked={this.state.CASH == refund_method} type="radio" name="method" />
              {' 现金赔偿（迟到30mins以内）'}
            </label>
            {
              this.state.refund_method == this.state.CASH
              ? <div className="form-group form-inline">
                  <div className="input-group input-group-xs pl-20">
                    <input valueLink={this.linkState('refund_money')} className="form-control input-xs" style={{'width': 50}} />
                    <span className="input-group-addon">RMB</span>
                  </div>
                </div>
              : null
            }
          </div>,
          <div className="form-group mg-15">
            <label className="">
              <input value={this.state.FULL_REFUND} onClick={this.checkMethod} checked={this.state.FULL_REFUND == refund_method} type="radio" name="method" />
              {' 全额退款（迟到时间>=30mins）'}
            </label>
            {
              this.state.refund_method == this.state.FULL_REFUND
              ? <div className="form-group pl-20">
                  <RadioGroup 
                    value={refund_reson} 
                    vertical={true}
                    name="refund_reson"
                    radios={[
                      {value: '迟到30mins以上', text: '迟到30mins以上'}, 
                      {value: '款式不符', text: '款式不符'}, 
                      {value: '尺寸、规格不符', text: '尺寸、规格不符'}]}
                    onChange={this.checkReason}
                  />
                </div>
              : null
            }
          </div>]          
        }
        { minus_amount != 0 || plus_amount != 0 ?
          <div className = 'form-group form-inline mg-15'>
            <label>{'初始应收金额：￥'}</label>
            <input value={orderDetail.total_amount / 100 || 0} readOnly className="form-control input-xs short-input" style={{'width': 50}} />
            {minus_amount != 0 && 
              [<label>{'　减：￥'}</label>,
              <input value={minus_amount / 100 || 0} readOnly className="form-control input-xs short-input" style={{'width': 50}} />]}
            {plus_amount != 0 &&
              [<label>{'　加：￥'}</label>,
              <input value={plus_amount / 100 || 0} readOnly className="form-control input-xs short-input" style={{'width': 50}} />]}         
          </div>: null}
        <div className='form-group form-inline mg-15'>
          <div className='row'>
            <div className='col-xs-6'>
              <label>货到付款金额：￥</label>
              <input value={this.state.order.total_amount / 100 || 0} readOnly className="form-control input-xs short-input" style={{'width': 50}} />
              {
                this.state.order.total_amount != 0 ?
                <select ref='pay_way' name='pay_way' value={this.state.pay_way} className='form-control input-xs' onChange={this.onPayWayChange}>
                  <option value='1'>现金</option>
                  <option value='2'>POS机</option>
                </select>
                :null
              } 
            </div>
            <div className='col-xs-6'>
              {order.refund_amount && order.refund_amount != 0 ?
                [<label>系统退款金额：￥</label>,
                <input value={this.state.order.refund_amount / 100 || 0} readOnly className="form-control input-xs short-input" style={{'width': 50}} />]
                :null
              }
            </div>
          </div>
        </div>
        <div className="form-group mg-15">
          <label>已购配件：</label>
          <table className="table table-hove text-center table-bordered">
            <thead>
              <tr>
                <th>配件名称</th>
                <th>价格</th>
                <th>规格</th>
                <th>数量</th>
                <th>备注</th>
              </tr>
            </thead>
            <tbody>
            { tableLoader( loading || refresh ,  content ) }
            </tbody>
          </table>
        </div>
        <div className="form-group mg-15" style = {{marginBottom:50,}}>
          <label>可选配件：</label>
          <div>
            <SparePartsGroup list = { spareparts } onChange={this.onSparePartChange}/>
          </div>
        </div>
      </StdModal>
    )
  },
  isRefundChange(){
    this.setState({is_refund: !this.state.is_refund});
  },
  submitHandler(){
    var { order, CASH, late_minutes, refund_method, refund_money, refund_reson, signin_date, current_id, all_deliveryman, pay_way } = this.state;
    var { orderDetail } = this.props.D_;
    var currentOrderSpareparts = this.state.orderSpareparts;
    var { updated_time } = orderDetail;
    var signin_hour = this.refs.timeinput.val();
    var deliveryman_tmp = all_deliveryman.filter( m => m.deliveryman_id == current_id);
    var deliveryman = {};
    if(deliveryman_tmp.length > 0){
      deliveryman.id = deliveryman_tmp[0].deliveryman_id;
      deliveryman.name = deliveryman_tmp[0].deliveryman_name;
      deliveryman.mobile = deliveryman_tmp[0].deliveryman_mobile;
    }else{
      if (current_id == 0){
        Noty('warning', '请选择配送员'); return;        
      }      
    }
    /*deliveryman ={ id: 1, mobile :'18118776535' ,name :'hong'}*/

    if(!form.isNumber(late_minutes) || late_minutes < 0){
      Noty('warning', '迟到时间输入有误');return;
    }
    if(!signin_date || !signin_hour){
      Noty('warning', '请填写正确的签收时间');return;
    }
    // 去掉迟到赔付必填
 /*    if(late_minutes > 0){
     if(!refund_method){
        Noty('warning', '请选择赔偿方式');return;
      }*/
    if(this.state.is_refund){
      if(!refund_method){
         Noty('warning', '请选择赔偿方式');return;
       }
       if(refund_method == CASH){
         if(!form.isNumber(refund_money)){
           Noty('warning', '请输入现金赔偿金额');return;
         }else if(refund_money > 29){
           Noty('warning', '现金赔偿金额不应大于29元');return;         
         }
       }
    }else {
      this.setState({
        refund_money: 0,
        refund_reson: '',
        refund_method: '',
      })
    }

      //去掉必须的全额退款
/*      else{
        if(!refund_reson){
          Noty('warning', '请勾选全额退款原因');return;
        }
      }
    }*/
    var { orderSpareparts } = this.props.D_;
    var currentOrderDetail = this.state.order;
    var products = currentOrderSpareparts;
    var orderProducts = this.props.D_.orderDetail.products.filter( m =>  m.isAddition == 0 );
    products = products.filter( m =>  m.num != 0 );
    var { minus_amount } = this.state;
    if( minus_amount > 0){
      products = products.map( m => {
        if(m.amount > 0 && minus_amount >0 ) {
          m.amount -= minus_amount ;
          minus_amount -= m.amount;
          m.amount = m.amount > 0 ? m.amount : 0;
        }
        return m;
      })
    }
    products = [...products, ...orderProducts];
    var signData = {
      late_minutes: late_minutes,
      payfor_type: refund_method,
      payfor_amount: refund_money * 100,
      payfor_reason: refund_reson,
      signin_time: signin_date + ' ' + signin_hour,
      updated_time: updated_time,
      order: { products ,...this.state.order },
      is_POS: this.state.pay_way == 1? false:true,
      /* deliveryman: deliveryman,*/
    }
    if( orderDetail.deliveryman_id != current_id ){
      signData.deliveryman = deliveryman;
    }
    delete signData.D_;
    delete signData.order.D_;
    this.props.signOrder(order.order_id, signData).done(function(){
      this.refs.modal.hide();
      this.props.callback();
      Noty('success', '签收成功！');
    }.bind(this))
    .fail(function(msg, code){
      Noty('error', msg || '提交失败')
    })
  },
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
    this.setState({ filter_deliveryman_results: results, current_id: results.length && results[0].deliveryman_id });
  },
  onSignInDateChange: function(value){
    this.setState({ signin_date: value })
  },
  onTimeChange: function(value){
    this.setState({signin_hour: value})
  },
  onTimeOK(signin_time){
    var { order: {delivery_time}, signin_date } = this.state;
    try{
      let delivery_date = new Date(delivery_time.split(' ')[0] + ' 00:00:00');
      //当delivery_date
      if(!delivery_date.valueOf()){
        delivery_date = new Date();
      }
      delivery_time = (delivery_time.match(/\d{2}:\d{2}$/)[0]).split(':');
      signin_date = new Date(signin_date + ' 00:00:00');
      signin_time = signin_time.split(':');

      delivery_date.setHours(delivery_time[0]);
      delivery_date.setMinutes(delivery_time[1]);
      signin_date.setHours(signin_time[0]);
      signin_date.setMinutes(signin_time[1]);
      let late_minutes = ( signin_date - delivery_date ) / (1000*60);

      this.onLateTimeChange({target: {value: late_minutes > 0 ? late_minutes : 0}}); //模拟
    }catch(e){
      Noty('error', '数据有误')
    }
  },
  onPayWayChange: function(e){
    var pay_way = e.target.value;
    this.setState({pay_way})
  },
  onLateTimeChange: function(e){
    var { value } = e.target;
    this.setState({ late_minutes: value, refund_money: value <=30 ? value : ''})
  },
  onRemarksChange: function(id,e){
    var old_orderSpareparts = this.state.orderSpareparts;
    old_orderSpareparts = old_orderSpareparts.map( m => {
      if( m.sku_id == id){
        m.greeting_card = e.target.value;
      }
      return m;
    });
    this.setState({orderSpareparts:old_orderSpareparts});
  },
  onDecrement: function(id){
     var old_orderSpareparts = this.state.orderSpareparts ;
    var  initial_orderSpareparts = this.props.D_.orderSpareparts;

     old_orderSpareparts = old_orderSpareparts.map( m => {
       if( m.sku_id == id){
        if(m.num>0){
         m.num --;
         m.amount -= m.unit_price;
         //减少时，加，减金额的变化情况
         //当操作的配件已存在订单配件中，且当前该配件的数量大于订单中该配件的数量，加的金额减少，当前该配件的数量小于等于订单中该配件的数量，减得金额增加
         //当操作的配件不存在订单配件中，加的金额减少
         if( initial_orderSpareparts.some( h => h.sku_id == m.sku_id && h.num > m.num)){
          this.setState({minus_amount: this.state.minus_amount + m.unit_price})
         }else{
          this.setState({plus_amount: this.state.plus_amount - m.unit_price})
         }         
        }
        m.discount_price = m.unit_price * m.num;
       }
       m.amount = m.amount > 0 ? m.amount : 0;
       return m;
     });
     old_orderSpareparts = old_orderSpareparts.filter( m =>  m.num != 0 );
     this.setState({orderSpareparts:old_orderSpareparts}); 
     this.getCurrentAmount();  
  },
  onIncrement: function(id){
     var old_orderSpareparts = this.state.orderSpareparts;
    var  initial_orderSpareparts = this.props.D_.orderSpareparts;

      old_orderSpareparts = old_orderSpareparts.map( m => {
       if( m.sku_id == id){
         m.num ++;
         m.amount += m.unit_price;
         //增加时，加，减金额的变化情况，
         //1.当操作的配件已存在订单配件中，且当前该配件的数量少于订单中该配件的数量，减得金额减少，
         //其余情况，加的金额增加
         if( initial_orderSpareparts.some(h => h.sku_id == m.sku_id && h.num >= m.num)){
          this.setState({minus_amount: this.state.minus_amount - m.unit_price});
         }else{
          this.setState({plus_amount: this.state.plus_amount + m.unit_price});
         }
        m.discount_price = m.unit_price * m.num;
       }

       return m;
     });
     this.setState({orderSpareparts:old_orderSpareparts});  
     this.getCurrentAmount(); 
  },
  onDeliverymanChange: function(e){
    var current_id = e.target.value;
    this.setState({current_id});
  },
  checkMethod: function(e){
    this.setState({ refund_method: e.target.value });
  },
  checkReason: function(value){
    this.setState({ refund_reson: value });
  },
  show: function(order){
    this.refs.modal.show();
    this.setState({order, signin_date: order.delivery_time.split(' ')[0] });
  },
  hideCallback: function(){
    this.refs.timeinput.reset();
    this.props.resetDeliveryman();
    this.setState(this.getInitialState());
  },
  /**
   * 点击可选配件里的配件时触发
   * @param  {[type]} e [description]
   * @return {[type]}   [description]
   */
  onSparePartChange(e){
    var e_copy = clone(e);   //深沉拷贝，否则在修改e_copy的值时会影响原有配件的值
    var old_orderSpareparts = this.state.orderSpareparts;  //old_orderSpareparts  当前列表已购配件
    var  initial_orderSpareparts = this.props.D_.orderSpareparts;  //订单原有配件
    if(old_orderSpareparts.some( m => m.sku_id == e_copy.sku_id )){
      //当选择的配件已存在已购配件列表时
      old_orderSpareparts.map( m => {
        if(m.sku_id == e_copy.sku_id){
          m.num ++;
          m.amount += e_copy.discount_price;   //已购配件中该配件加1，同时amount变化
          /*加、减金额变化两种情况，‘加’的金额增加，‘减’的金额减少*/
          if(initial_orderSpareparts.some(h => h.sku_id == e_copy.sku_id && h.num >= m.num)){
            //选择的配件存在于原订单配件列表中，且目前该配件的数量少于原订单该配件的数量
            this.setState({minus_amount: this.state.minus_amount - m.unit_price});
          }else{
            this.setState({plus_amount: this.state.plus_amount + m.unit_price});            
          }
        m.discount_price = m.unit_price * m.num;
        }
        return m;
      })
    }else{
      //当选择的配件不存在已购配件列表时
      var newvalue = e_copy;
      e_copy.num = 1;
      newvalue.unit_price = newvalue.discount_price;
      newvalue.amount = newvalue.discount_price;
      old_orderSpareparts.push(newvalue);

      //因为选择的配件不存在已购配件中，故加，减金额的变化只讨论该配件是否存在于原订单配件列表中
      if(initial_orderSpareparts.every( h => h.sku_id != e_copy.sku_id )){
       this.setState({plus_amount: this.state.plus_amount + e_copy.unit_price});
      }else{
       this.setState({minus_amount: this.state.minus_amount - e_copy.unit_price});
      }
    }       
      /*if( 'id' in newvalue){
        old_orderSpareparts.push(newvalue);
      }*/
      this.setState({orderSpareparts:old_orderSpareparts});
      this.getCurrentAmount();
  },
  getCurrentAmount(){
    var { orderSpareparts } = this.props.D_;
    var currentOrderSpareparts = this.state.orderSpareparts;
    var total_amount = this.props.D_.orderDetail.total_amount;
    var orderSparepartsAmount = 0 ;
    var currentOrderSparepartsAmount = 0;
    var refund_amount = 0;
    var order = clone( this.state.order ) ;

    orderSpareparts.forEach(function(m){
      orderSparepartsAmount += m.discount_price;  //此处discount_price 为单价乘以数量
    });
    currentOrderSpareparts.forEach(m => {
      currentOrderSparepartsAmount +=  m.unit_price  * m.num;
    });
    var rest = currentOrderSparepartsAmount - orderSparepartsAmount;
    if(this.state.order.pay_status == pay_status.PAYED && rest < 0){
      refund_amount = -rest;
    }else{
      total_amount = total_amount + rest;
    }
    order.total_amount = total_amount;
    if(refund_amount >= 0) order.refund_amount = refund_amount;
    this.setState( {order} );
  },
/*  componentDidMount() {
    var orderSpareparts = this.props.D_.orderSpareparts;
    var {current_id} = this.props.D_;
    this.setState({orderSpareparts ,current_id });    
  },*/
  componentWillReceiveProps(nextProps){
    var { D_, order_deliveryman } = nextProps;
    var { is_POS} = D_;  
    if(order_deliveryman.load_success && this.props.order_deliveryman != order_deliveryman){
      var {list} = order_deliveryman;
      var build = function(){
        var new_data = list.map(function(n){
          n.py = window.makePy(n.deliveryman_name);
          return n;
        })
        this.setState({
          all_deliveryman: list, filter_deliveryman_results: new_data, 
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
      var  products  = D_.orderDetail.products || [];
      products = products.filter( m => m.isAddition == 1);
      var orderSpareparts = clone(products);
      orderSpareparts = orderSpareparts.map( m => {
         m.unit_price = m.discount_price / m.num;
        return m;     
      })
      var {current_id} = order_deliveryman;
      var pay_way = 1;
      if(D_.orderDetail.is_POS) 
        pay_way =2;
      orderSpareparts = orderSpareparts.map( m => {
        m.unit_price = m.discount_price / m.num;
        return m;
      })
      this.setState({orderSpareparts , pay_way, current_id});

    }


  },
});

var UnSignedModal = React.createClass({
  getInitialState: function() {
    return {
      NOTFOUND: 'NOTFOUND',
      OTHER: 'OTHER',

      order: {},

      reason_type: '',
      notfound_reason: '联系不上用户，无人签收',
      other_reason: '',
      real_pay: 0,
      black_list: '0',
    };
  },
  mixins: [ LinkedStateMixin ],
  render: function(){
    var { notfound_reason } = this.state;
    return (
      <StdModal submitting={this.props.submitting} onConfirm={this.submitHandler} onCancel={this.hideCallback} title="订单未完成页面" ref="modal">
        <div className=" mg-15">
          <label className="strong-label">未签收原因：</label>
          <div className="form-group form-inline">
            <label>
              <input value={this.state.NOTFOUND}
               checked={this.state.reason_type == this.state.NOTFOUND} 
               onClick={this.checkReason} type="radio" name="reason" />
              {' ' + notfound_reason}
            </label>
          </div>
          <div className="form-group form-inline">
            <label>
              <input value={this.state.OTHER} 
                checked={this.state.reason_type == this.state.OTHER} 
                onClick={this.checkReason} type="radio" name="reason" />
              {' 其他'}
            </label>
            {'　'}
            <input valueLink={this.linkState('other_reason')} className="form-control input-xs long-input" />
          </div>
        </div>
        <div className="form-inline mg-15">
          <div className="row">
            <div className="col-xs-6">
              <label>货到付款金额：￥</label>
              <input value={this.state.order.total_amount/100 || 0} readOnly className="form-control input-xs short-input" style={{'width': 50}} />
            </div>
            <div className="col-xs-6">
              <label>实收金额：</label>
              <input valueLink={this.linkState('real_pay')} className="form-control input-xs" style={{'width': 50}} />
            </div>
          </div>
        </div>
        <div className="form-group mg-15">
          <label className="strong-label">是否将该用户列入黑名单：</label>
          {'　'}
          <RadioGroup 
            value={this.state.black_list} 
            className="inline-block"
            radios={[{value: "1", text: '是'}, {value: "0", text: '否'}]}
            onChange={this.checkBlackList}
          />
          <p className="font-xs gray">（列入黑名单后，此用户ID下单无法再选择货到付款模式）</p>
        </div>
      </StdModal>
    )
  },
  submitHandler(){
    var { order, reason_type, OTHER, notfound_reason, other_reason, real_pay, black_list } = this.state;
    if(!reason_type){
      Noty('warning', '请选择未签收原因');return;
    }
    if( reason_type == OTHER && !other_reason.trim()){
      Noty('warning', '请填写其他未签收原因');return;
    }
    if( !form.isNumber( real_pay ) ){
      Noty('warning', '请填写正确的实收金额');return;
    }
    this.props.unsignOrder(order.order_id, {
      COD_amount: real_pay * 100,
      unsignin_reason: reason_type == OTHER ? other_reason : notfound_reason,
      is_blacklist: black_list,
    }).done(function(){
      this.refs.modal.hide();
      this.props.callback();
      Noty('success', '操作成功！');
    }.bind(this))
    .fail(function(msg, code){
      Noty('error', msg || '提交失败')
    })
  },
  checkReason: function(e){
    var reason_type = e.target.value;
    this.setState({ reason_type, other_reason: reason_type == this.state.NOTFOUND ? '' : this.state.other_reason });
  },
  checkBlackList: function(value){
    this.setState({ black_list: value });
  },
  show: function(order){
    this.refs.modal.show();
    this.setState({order});
  },
  hideCallback: function(){
    this.setState(this.getInitialState());
  },
})

class EditModal extends Component{
  constructor(props){
    super(props);
    this.state = {
      deliveryman_id:0,
      all_deliveryman:[],
      is_POS:0,
      total_amount:0,
      order_id:'',
      filter_deliveryman_results:[],
    } 
  }

  render(){
    var {all_deliveryman,is_POS, total_amount, deliveryman_id, filter_deliveryman_results} = this.state;
    var pay_way = is_POS ? 2:1;
    var content = filter_deliveryman_results.map( n => {
          return <option key={n.deliveryman_id} value={n.deliveryman_id}>{n.deliveryman_name + ' ' + n.deliveryman_mobile}</option>
    })    
    return(
      <StdModal ref='modal' title='编辑订单完成页面' onConfirm={this.submitHandler.bind(this)} onCancel = {this.hideCallback.bind(this)}>
        <div className='form-group mg-15 form-inline'>
          <div className="mg-15">
            <div className="input-group input-group-xs" style={{height:'27px'}}>
              <span  style={{height:'27px',lineHeight:1}} className="input-group-addon"><i className="fa fa-search"></i></span>
              <input type="text"  style={{height:'27px'}} 
                className="form-control" placeholder="配送员拼音首字母或手机号" 
                onChange = {this.filterHandler.bind(this)} />
            </div>
            <select name= 'deliveryman' onChange={this.deliveryManChange.bind(this)} value={deliveryman_id} ref='deliveryman' className="form-control input-sm space-left"  style={{height:'27px',minWidth:100}}>
              {
                content.length
                ? content
                : <option>无</option>
              }
            </select>
            {/*<Select options={order_deliveryman} value={deliveryman_id} onChange={this.deliveryManChange.bind(this)}/>*/}
          </div>
          <div className="">
            <label>货到付款金额：￥</label>
            <input value={total_amount / 100 || 0} readOnly className="form-control input-xs short-input" style={{'width': 50}} />
            {
              total_amount != 0 ?
              <select value={pay_way} ref='pay_way' name='pay_way' value={pay_way} className='form-control input-xs space-left' onChange={this.onPayWayChange.bind(this)}>
                <option value='1'>现金</option>
                <option value='2'>POS机</option>
              </select>
              :null
            }               
          </div>
        </div>
      </StdModal>
      )
  }
  show(order){
    this.setState({total_amount: order.total_amount, order_id: order.order_id});
    LazyLoad('chinese_py');
    this.refs.modal.show();
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
      results = order_deliveryman.filter(n => {
        return n.py.some(m => m.toUpperCase().indexOf(value) == 0)
      })
    }else{ //中文全称
      results = all_deliveryman.filter(n => n.deliveryman_name.indexOf(value) != -1)
    }
    this.setState({ filter_deliveryman_results: results, deliveryman_id: results.length && results[0].deliveryman_id });
  }
  componentWillReceiveProps(nextProps){
    var { D_ , order_deliveryman} = nextProps;
    var { is_POS } = D_;
    var {current_id, load_success} = order_deliveryman;
    this.setState({ is_POS});
    if(load_success && this.props.order_deliveryman != order_deliveryman){
      var {list} = order_deliveryman;
      var build = function(){
        var new_data = list.map(function(n){
          n.py = window.makePy(n.deliveryman_name);
          return n;
        })
        this.setState({
          all_deliveryman: list, filter_deliveryman_results: new_data, deliveryman_id: current_id,
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
  deliveryManChange(e){
    var {value} = e.target;
    this.setState({deliveryman_id:value});
  }
  onPayWayChange(e){
    var {value} = e.target;
    var is_POS = 0;
    if(value == 2) is_POS = 1;
    this.setState({is_POS});
  }
  submitHandler(){
    var {all_deliveryman, deliveryman_id, order_id} = this.state;
    var deliveryman_name ='';
    var deliveryman_mobile = '';
    all_deliveryman.forEach( m => {
      if(m.deliveryman_id == deliveryman_id){
        deliveryman_mobile = m.deliveryman_mobile;
        deliveryman_name = m.deliveryman_name;
      }
    })
    if(deliveryman_id == 0){
        Noty('warning', '请选择配送员'); return;        
    }
    var form_data = {};
    form_data.deliveryman_id = deliveryman_id;
    form_data.deliveryman_name = deliveryman_name;
    form_data.deliveryman_mobile = deliveryman_mobile;
    if(this.state.total_amount != 0){
      if(this.refs.pay_way.value == 1){
        form_data.is_POS = 0;
      }else{
        form_data.is_POS = 1;
      }
    }
    this.props.editSignedOrder(order_id, form_data).done(function(){
        this.refs.modal.hide();
        this.props.resetDeliveryman();
        this.setState({
          pay_way:1,
          deliveryman_id:0,
          all_deliveryman:[],
          is_POS:0,
          total_amount:0,
          order_id:'',
        })
        Noty('success', '编辑成功！');
      }.bind(this))
      .fail(function(msg, code){
        Noty('error', msg || '编辑失败')
    })
    
  }
  hideCallback(){
    this.props.resetDeliveryman();
    this.setState({
      deliveryman_id:0,
      all_deliveryman:[],
      is_POS:0,
      total_amount:0,
      order_id:'',
      filter_deliveryman_results:[],
    })
  }
}


