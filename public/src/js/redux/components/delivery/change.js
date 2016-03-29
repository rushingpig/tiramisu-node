import React, {Component, PropTypes} from 'react';
import { render, findDOMNode } from 'react-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { reduxForm } from 'redux-form';

import DatePicker from 'common/datepicker';
import Select from 'common/select';
import Pagination from 'common/pagination';
import StdModal from 'common/std_modal';
import { tableLoader } from 'common/loading';

import { Noty, parseTime, dateFormat } from 'utils/index';
import V from 'utils/acl';
import { DELIVERY_MAP } from 'config/app.config';
import history, { go } from 'history_instance';
import LazyLoad from 'utils/lazy_load';

import OrderProductsDetail from 'common/order_products_detail';
import OrderDetailModal from './order_detail_modal';
import OperationRecordModal from 'common/operation_record_modal.js';

import * as OrderActions from 'actions/orders';
import * as OrderSupportActions from 'actions/order_support';
import AreaActions from 'actions/area';
import * as ChangeActions from 'actions/delivery_change';

import getTopHeader from '../top_header';

const TopHeader = getTopHeader([{name: '送货单管理', link: '/dm/change'}, {name: '订单转送货单列表', link: ''}]);

class FilterHeader extends Component {
  constructor(props){
    super(props);
    this.state = {
      search_ing: false,
    }
  }
  render(){
    var { 
      fields: {
        keywords,
        begin_time,
        end_time,
        delivery_id,
        province_id,
        city_id,
      },
      provinces,
      cities,
      delivery_stations,
      changeHandler,
      change_submitting,
    } = this.props;
    var { search_ing } = this.state;
    return (
      <div className="panel search">
        <div className="panel-body form-inline">
          <input {...keywords} className="form-control input-xs v-mg" placeholder="关键字" />
          {' 开始时间'}
          <DatePicker editable redux-form={begin_time} className="short-input" />
          {' 结束时间'}
          <DatePicker editable redux-form={end_time} className="short-input space-right" />
          { 
            V( 'DeliveryManageChangeStationFilter' )
              ? <Select {...delivery_id} options={delivery_stations} default-text="选择配送中心" className="space-right"/>
              : null
          }
          {
            V( 'DeliveryManageChangeAddressFilter' )
              ? [
                  <Select {...province_id} onChange={this.onProvinceChange.bind(this, province_id.onChange)} options={provinces} ref="province" default-text="选择省份" key="province" className="space-right"/>,
                  <Select {...city_id} options={cities} default-text="选择城市" ref="city" key="city" className="space-right"/>
                ]
              : null
          }
          <button disabled={search_ing} data-submitting={search_ing} onClick={this.search.bind(this)} className="btn btn-theme btn-xs">
            <i className="fa fa-search"></i>{' 搜索'}
          </button>
          {'　'}
          {
            V( 'DeliveryManageChangeChange' )
              ? <button disabled={change_submitting} data-submitting={change_submitting} onClick={changeHandler} className="btn btn-theme btn-xs">
                  转换
                </button>
              : null
          }
          
        </div>
      </div>
    )
  }
  componentDidMount(){
    setTimeout(function(){
      var { getProvinces, getDeliveryStations } = this.props;
      getProvinces();
      getDeliveryStations();
      LazyLoad('noty');
    }.bind(this),0)
  }
  onProvinceChange(callback, e){
    var {value} = e.target;
    this.props.resetCities();
    if(value != this.refs.province.props['default-value'])
      var $city = $(findDOMNode(this.refs.city));
      this.props.getCities(value).done(() => {
        $city.trigger('focus'); //聚焦已使city_id的值更新
      });
    callback(e);
  }
  search(){
    this.setState({search_ing: true});
    this.props.getOrderExchangeList({page_no: 0, page_size: this.props.page_size})
      .always(()=>{
        this.setState({search_ing: false});
      });
  }
}
FilterHeader.propTypess = {
  changeHandler: PropTypes.func.isRequired,
  provinces: PropTypes.array.isRequired,
  cities: PropTypes.array.isRequired,
  delivery_stations: PropTypes.array.isRequired,
}
FilterHeader = reduxForm({
  form: 'order_exchange_filter',
  fields: [
    'keywords',
    'begin_time',
    'end_time',
    'delivery_id',
    'province_id',
    'city_id',
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
    return (
      <tr onClick={this.clickHandler.bind(this)} className={props.active_order_id == props.order_id ? 'active' : ''}>
        <td>
          <input onChange={this.checkOrderHandler.bind(this)} checked={props.checked} type="checkbox" />
        </td>
        <td>{props.delivery_time ? parseTime(props.delivery_time) : '未知'}</td>
        <td>{props.owner_name}<br />{props.owner_mobile}</td>
        <td className="text-left">
          姓名：{props.recipient_name}<br />
          电话：{props.recipient_mobile}<br />
          <div className="address-detail-td">
            <span className="inline-block">地址：</span><span className="address-all">{props.recipient_address}</span>
          </div>
          建筑：{props.recipient_landmark}
        </td>
        <td>{props.coupon}</td>
        <td>{parseTime(props.submit_time)}</td>
        <td><a onClick={props.viewOrderDetail} href="javascript:;">{props.order_id}</a></td>
        <td>{DELIVERY_MAP[props.delivery_type] || props.delivery_type}</td>
        <td><div className="remark-in-table">{props.remarks}</div></td>
        <td>{props.updated_by}</td>
        <td><a onClick={this.viewOrderOperationRecord.bind(this)} className="inline-block time" href="javascript:;">{props.updated_time}</a></td>
      </tr>
    )
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

class DeliverChangePannel extends Component {
  constructor(props){
    super(props);
    this.state = {
      page_size: 8,
    }
    this.checkOrderHandler = this.checkOrderHandler.bind(this);
    this.activeOrderHandler = this.activeOrderHandler.bind(this);
    this.changeHandler = this.changeHandler.bind(this);
    this.viewOrderDetail = this.viewOrderDetail.bind(this);
    this.viewOrderOperationRecord = this.viewOrderOperationRecord.bind(this);
    this.search = this.search.bind(this);
    this.refreshDataList = this.refreshDataList.bind(this);
  }
  render(){
    var { filter, area, all_order_srcs, all_pay_modes, exchangeOrders, getOrderOptRecord, resetOrderOptRecord, operationRecord } = this.props;
    var { change_submitting } = filter;
    var { loading, refresh, page_no, checkall, total, list, checked_order_ids, check_order_info, active_order_id } = this.props.orders;
    var { search, changeHandler, checkOrderHandler, viewOrderDetail, activeOrderHandler, viewOrderOperationRecord, refreshDataList } = this;

    var content = list.map((n, i) => {
      return <OrderRow key={n.order_id} {...{...n, active_order_id, activeOrderHandler, checkOrderHandler, viewOrderDetail, viewOrderOperationRecord}} />;
    })
    return (
      <div className="order-manage">

        <TopHeader />
        <FilterHeader 
          {...{...this.props, ...filter, ...area, changeHandler }} 
          page_size={this.state.page_size} 
        />

        <div className="panel">
          <header className="panel-heading">送货列表</header>
          <div className="panel-body">
            <div className="table-responsive main-list">
              <table className="table table-hover text-center">
                <thead>
                <tr>
                  <th><input checked={checkall} onChange={this.checkAll.bind(this)} type="checkbox" /></th>
                  <th>配送时间</th>
                  <th>下单人</th>
                  <th>收货人</th>
                  <th>验证码</th>
                  <th>提交时间</th>
                  <th>订单号</th>
                  <th>配送方式</th>
                  <th>备注</th>
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
              <div className="panel-body">
                <div>订单产品详情</div>
                <OrderProductsDetail products={check_order_info.products} />
              </div>
            </div>
          : null }

        <ChangeModal {...{exchangeOrders, search, change_submitting, checked_order_ids}} ref="changeModal" />
        <OrderDetailModal ref="detail_modal" data={check_order_info || {}} all_order_srcs={all_order_srcs.map} all_pay_modes={all_pay_modes} />
        <OperationRecordModal ref="OperationRecordModal" {...{getOrderOptRecord, resetOrderOptRecord, ...operationRecord}} />
      </div>
    )
  }
  changeHandler(){
    if(this.props.orders.checked_order_ids.length){
      this.refs.changeModal.show();
    }else{
      Noty('warning', '请先选择需要转换的订单！');
    }
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
  onPageChange(page){
    this.search(page);
  }
  componentDidMount() {
    this.search();
    LazyLoad('noty');
    var { getOrderSrcs, getPayModes } = this.props;
    getOrderSrcs();
    getPayModes();
  }
  search(page){
    page = typeof page == 'undefined' ? this.props.orders.page_no : page;
    this.props.getOrderExchangeList({page_no: page, page_size: this.state.page_size});
  }
  refreshDataList(){
    //更新数据，需要loading图
    this.props.refreshDataList();
    this.search();
  }
}

function mapStateToProps({deliveryChange}){
  return deliveryChange;
}

/* 这里可以使用 bindActionCreators , 也可以直接写在 connect 的第二个参数里面（一个对象) */
function mapDispatchToProps(dispatch){
  return bindActionCreators({...OrderActions, ...OrderSupportActions, ...AreaActions(), ...ChangeActions}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(DeliverChangePannel);


/***************   *******   *****************/
/***************   子模态框   *****************/
/***************   *******   *****************/

class ChangeModal extends Component {
  render(){
    var { checked_order_ids } = this.props;
    return (
      <StdModal onConfirm={this.onConfirm.bind(this)} submitting={this.props.change_submitting} ref="modal" title="批量转换操作">
        <center><h5>您已同时勾选<span className="strong font-lg">{' ' + checked_order_ids.length + ' '}</span>个订单</h5></center>
        <center><h5>进行转换</h5></center>
      </StdModal>
    )
  }
  show(){
    this.refs.modal.show();
  }
  hide(){
    this.refs.modal.hide();
  }
  onConfirm(){
    var { exchangeOrders, search, checked_order_ids } = this.props;
    exchangeOrders(checked_order_ids).done(function(){
      // search();
      this.hide();
      Noty('success', '转换成功！')
      go('/dm/delivery');
    }.bind(this)).fail(() => {
      Noty('error', '转换异常')
    })
  }
};

ChangeModal.propTypess = {
  checked_order_ids: PropTypes.array.isRequired,
  exchangeOrders: PropTypes.func.isRequired,
  change_submitting: PropTypes.bool.isRequired,
  search: PropTypes.func.isRequired,
}