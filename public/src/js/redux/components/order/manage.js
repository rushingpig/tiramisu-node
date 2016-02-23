import React, {Component, PropTypes} from 'react';
import { render, findDOMNode } from 'react-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { reduxForm } from 'redux-form';
import LinkedStateMixin from 'react-addons-linked-state-mixin';

import AreaActions from 'actions/area';
import { AreaActionTypes2 } from 'actions/action_types';
import * as OrderActions from 'actions/orders';
import * as OrderManageActions from 'actions/order_manage';
import { getOrderSrcs, getDeliveryStations, autoGetDeliveryStations } from 'actions/order_manage_form';

import DatePicker from 'common/datepicker';
import Select from 'common/select';
import Pagination from 'common/pagination';
import {order_status, SELECT_DEFAULT_VALUE, DELIVERY_TO_HOME, DELIVERY_TO_STORE} from 'config/app.config';
import history from 'history_instance';
import LineRouter from 'common/line_router';
import SearchInput from 'common/search_input';
import { tableLoader, get_table_empty } from 'common/loading';
import StdModal from 'common/std_modal';
import RecipientInfo from 'common/recipient_info';

import LazyLoad from 'utils/lazy_load';
import { colour, Noty, core } from 'utils/index';
import { createMap, autoMatch } from 'mixins/map';

import OrderProductsDetail from 'common/order_products_detail';
import OrderDetailModal from 'common/order_detail_modal';
import AlterDeliveryModal from './manage_alter_delivery_modal';
import OrderSrcsSelects from 'common/order_srcs_selects';
import OperationRecordModal from 'common/operation_record_modal.js';

class TopHeader extends Component {
  render(){
    return (
      <div className="clearfix top-header">
        <button onClick={this.addOrder.bind(this)} className="btn btn-sm btn-theme pull-left">添加订单</button>
        <LineRouter 
          routes={[{name: '总订单页面', link: '/om/index'}, {name: '处理页面', link: ''}]}
          className="pull-right" />
      </div>
    )
  }
  addOrder(){
    // history.replace('/om/index/add');
    history.push('/om/index/add');
  }
}

/**
 * 每个页面的filter都对应一个form表单，在全局state的form字段下
 */
class FilterHeader extends Component {
  constructor(props){
    super(props);
    this.state = {
      submit_opts: [{id: 1, text: '已提交'}, {id: 0, text: '未提交'}],
      deal_opts: [{id: 1, text: '已处理'}, {id: 0, text: '未处理'}],
      selected_order_src_level1_id: SELECT_DEFAULT_VALUE,
      search_ing: false,
    }
  }
  render(){
    var { 
      fields: {
        keywords,
        begin_time,
        end_time,
        is_submit,
        is_deal,
        src_id,
        province_id,
        city_id,
        status,
      },
      provinces,
      cities,
      all_order_srcs,
      all_order_status,
    } = this.props;
    var { search_ing } = this.state;

    return (
      <div className="panel search">
        <div className="panel-body form-inline">
          <input {...keywords} className="form-control input-xs v-mg" placeholder="关键字" />
          {' 开始时间'}
          <DatePicker editable redux-form={begin_time} className="short-input" />
          {' 配送时间'}
          <DatePicker editable redux-form={end_time} className="short-input space-right" />
          <Select {...is_submit} options={this.state.submit_opts} default-text="是否提交" className="space-right"/>
          <Select {...is_deal} options={this.state.deal_opts} default-text="是否处理" className="space-right"/>
          <OrderSrcsSelects {...{all_order_srcs, src_id}} />
          <Select {...province_id} onChange={this.onProvinceChange.bind(this, province_id.onChange)} options={provinces} ref="province" default-text="选择省份" className="space-right"/>
          <Select {...city_id} options={cities} default-text="选择城市" ref="city" className="space-right"/>
          <Select {...status} options={all_order_status} default-text="订单状态" className="space-right"/>
          <button disabled={search_ing} data-submitting={search_ing} onClick={this.search.bind(this)} className="btn btn-theme btn-xs">
            <i className="fa fa-search" style={{'padding': '0 3px'}}></i>
          </button>
        </div>
      </div>
    )
  }
  componentDidMount(){
    setTimeout(()=>{
      var { getProvinces, getOrderSrcs } = this.props.actions;
      getProvinces();
      getOrderSrcs();
      LazyLoad('noty');
    },0)
  }
  onProvinceChange(callback, e){
    var {value} = e.target;
    this.props.actions.provinceReset();
    if(value != this.refs.province.props['default-value'])
      var $city = $(findDOMNode(this.refs.city));
      this.props.actions.getCities(value).done(() => {
        $city.trigger('focus'); //聚焦已使city_id的值更新
      });
    callback(e);
  }
  search(){
    this.setState({search_ing: true});
    this.props.actions.getOrderList({page_no: 0, page_size: this.props.page_size})
      .always(()=>{
        this.setState({search_ing: false});
      });
  }
}
FilterHeader.propTypes = {
  actions: PropTypes.object.isRequired,
}
FilterHeader = reduxForm({
  form: 'order_manage_filter',
  fields: [
    'keywords',
    'begin_time',
    'end_time',
    'is_submit',
    'is_deal',
    'src_id',
    'province_id',
    'city_id',
    'status',
  ]
})( FilterHeader );

var OrderRow = React.createClass({
  render(){
    var { props } = this;
    var src_name = props.src_name ? props.src_name.split(',') : ['', ''];
    var _order_status = order_status[props.status] || {};
    return (
      <tr className={props.active_order_id == props.order_id ? 'active' : ''} onClick={this.clickHandler}>
        <td>
          <a onClick={this.editHandler} href="javascript:;">[编辑]</a><br/>
          <a onClick={this.viewOrderDetail} href="javascript:;">[查看]</a><br/>
          <a onClick={this.alterDelivery} href="javascript:;" className="nowrap">[修改配送]</a><br/>
          <a onClick={this.alterStation} href="javascript:;" className="nowrap">[分配配送站]</a><br/>
          <a onClick={this.cancelOrder} href="javascript:;" className="nowrap">[订单取消]</a>
        </td>
        <td>{props.merchant_id}</td>
        <td>{props.order_id}</td>
        <td>{props.owner_name}<br />{props.owner_mobile}</td>
        <td><div className="time">{props.created_time}</div></td>
        {/*收货人信息*/}
        <RecipientInfo data={props} />
        <td>{props.delivery_type}</td>
        {/*订单来源*/}
        <td className="nowrap">
          {src_name[0]}
          {src_name[1] ? [<br />, <span className="bordered bg-warning">{src_name[1]}</span>] : null}
        </td>
        <td><strong className="strong">{props.pay_status}</strong></td>
        <td className="nowrap text-left">
          原价：￥{props.original_price/100} <br />
          实际售价：￥{props.discount_price/100} <br />
          应收金额：￥{props.total_amount/100}
        </td>
        {/*订单状态*/}
        <td><div style={{color: _order_status.color || 'inherit'}}>{_order_status.value}</div></td>
        <td>{props.delivery_name}</td>
        <td><div className="time">{props.delivery_time}</div></td>
        <td>{props.is_submit == '1' ? '是' : '否'}</td>
        <td>{props.is_deal == '1' ? '是' : '否'}</td>
        <td>{props.city}</td>
        <td>{props.cancel_reason}</td>
        <td><div className="remark-in-table">{props.remarks}</div></td>
        <td>{props.updated_by}</td>
        <td>{props.created_by}</td>
        <td><a onClick={this.viewOrderOperationRecord} className="inline-block time" href="javascript:;">{props.updated_time}</a></td>
      </tr>
    )
  },
  activeOrder(){
    var { 
      order_id, active_order_id, activeOrder, prepareDeliveryDataOK,
      getProvinces, getCities, getDistricts, getDeliveryShops, getDeliveryStations
    } = this.props;
    if(order_id != active_order_id){
      activeOrder(order_id).done(function(data){
        //这里拉取数据完全是为了给“修改配送”modal使用
        setTimeout(function(){
          $.when(
            getProvinces(),
            getCities(data.province_id),
            getDistricts(data.city_id),
            getDeliveryShops(data.regionalism_id),
            getDeliveryStations()
          ).done(prepareDeliveryDataOK)
        }.bind(this), 400)
      });
    }
  },
  clickHandler(){
    this.activeOrder();
    this.props.showProductsDetail();
  },
  editHandler(e){
    history.push('/om/index/' + this.props.order_id);
    e.stopPropagation();
  },
  viewOrderDetail(e){
    this.props.viewOrderDetail(this.props);
    this.activeOrder();
    e.stopPropagation();
  },
  alterDelivery(e){
    this.props.showAlterDelivery();
    this.activeOrder();
    e.stopPropagation();
  },
  alterStation(e){
    this.props.showAlterStation();
    this.activeOrder();
    e.stopPropagation();
  },
  viewOrderOperationRecord(e){
    this.props.viewOrderOperationRecord(this.props);
    e.stopPropagation();
  },
  cancelOrder(e){
    this.props.showCancelOrder(this.props);
    this.activeOrder();
    e.stopPropagation();
  },
  orderException(e){
    //已被弃用
    this.props.showOrderException(this.props);
    this.activeOrder();
    e.stopPropagation();
  }
})

class ManagePannel extends Component {
  constructor(props){
    super(props);
    this.viewOrderDetail = this.viewOrderDetail.bind(this);
    this.showAlterDelivery = this.showAlterDelivery.bind(this);
    this.showAlterStation = this.showAlterStation.bind(this);
    this.showCancelOrder = this.showCancelOrder.bind(this);
    this.showOrderException = this.showOrderException.bind(this);
    this.viewOrderOperationRecord = this.viewOrderOperationRecord.bind(this);
    this.search = this.search.bind(this);
    this.state = {
      page_size: 5,
    }
  }
  render(){
    var { filter, area, alter_delivery_area, delivery_stations,
      main: {submitting, prepare_delivery_data_ok},
      activeOrder, showProductsDetail, operationRecord, dispatch, getOrderList, getOrderOptRecord, resetOrderOptRecord, cancelOrder, orderException } = this.props;
    var { loading, page_no, total, list, check_order_info, active_order_id, show_products_detail } = this.props.orders;
    var { viewOrderDetail, showAlterDelivery, showAlterStation, showCancelOrder, showOrderException, viewOrderOperationRecord, search } = this;

    var content = list.map((n, i) => {
      return <OrderRow key={n.order_id} 
        {...{...n, active_order_id, ...this.props, viewOrderDetail, showAlterDelivery, showAlterStation, showCancelOrder, showOrderException, viewOrderOperationRecord}} />;
    })
    return (
      <div className="order-manage">

        <TopHeader />
        <FilterHeader {...{...filter, ...area}}
           actions={{...bindActionCreators({...AreaActions(), getOrderSrcs}, dispatch), getOrderList}}
           page_size={this.state.page_size} />

        <div className="panel">
          <header className="panel-heading">订单列表</header>
          <div className="panel-body">
            <div className="table-responsive">
              <table className="table table-hover text-center">
                <thead>
                <tr>
                  <th>操作管理</th>
                  <th>商户订单</th>
                  <th>订单号</th>
                  <th>下单人</th>
                  <th>下单时间</th>
                  <th>收货人信息</th>
                  <th>配送方式</th>
                  <th>订单来源</th>
                  <th>支付状态</th>
                  <th>总金额</th>
                  <th>订单状态</th>
                  <th>配送站</th>
                  <th>配送时间</th>
                  <th>是否提交</th>
                  <th>是否处理</th>
                  <th>所属城市</th>
                  <th>取消理由</th>
                  <th>备注</th>
                  <th>操作人</th>
                  <th>创建人</th>
                  <th>操作时间</th>
                </tr>
                </thead>
                <tbody>
                { tableLoader( loading, content ) }
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

        { show_products_detail && check_order_info
          ? <div className="panel">
              <div className="panel-body">
                <div>订单管理 >> 产品详情</div>
                <OrderProductsDetail products={check_order_info.products} />
              </div>
            </div>
          : null }

        <OrderDetailModal ref="detail_modal" data={check_order_info || {}} />
        <OperationRecordModal ref="OperationRecordModal" {...{getOrderOptRecord, resetOrderOptRecord, ...operationRecord}} />
        <CancelOrderModal ref="CancelOrderModal" {...{submitting, cancelOrder, callback: search}} />
        <OrderExceptionModal ref="OrderExceptionModal" {...{submitting, orderException, callback: search}} />
        <AlterStationModal ref="AlterStationModal" 
          {...{submitting, ...delivery_stations, order: check_order_info, active_order_id, show_products_detail, loading: !prepare_delivery_data_ok,
            ...alter_delivery_area, actions: this.props, callback: search}} />
        <AlterDeliveryModal ref="AlterDeliveryModal" 
          {...{submitting, ...delivery_stations, order: check_order_info, active_order_id, show_products_detail, loading: !prepare_delivery_data_ok,
            ...alter_delivery_area, actions: this.props, callback: search}} />
      </div>
    )
  }
  onPageChange(page){
    this.search(page);
  }
  componentDidMount() {
    this.search();
  }
  search(page){
    page = typeof page == 'undefined' ? this.props.orders.page_no : page;
    this.props.getOrderList({page_no: page, page_size: this.state.page_size});
  }
  viewOrderDetail(){
    this.refs.detail_modal.show();
  }
  showAlterDelivery(){
    this.refs.AlterDeliveryModal.show();
  }
  showAlterStation(){
    this.refs.AlterStationModal.show();
  }
  showCancelOrder(order){
    this.refs.CancelOrderModal.show(order);
  }
  showOrderException(order){
    this.refs.OrderExceptionModal.show(order);
  }
  viewOrderOperationRecord(order){
    this.refs.OperationRecordModal.show(order);
  }
}

function mapStateToProps({orderManage}){
  return orderManage;
}

/* 这里可以使用 bindActionCreators , 也可以直接写在 connect 的第二个参数里面（一个对象) */
function mapDispatchToProps(dispatch){
  var actions = bindActionCreators({
    ...OrderActions, 
    ...AreaActions(AreaActionTypes2), 
    getDeliveryStations, 
    autoGetDeliveryStations,
    ...OrderManageActions
  }, dispatch);
  actions.dispatch = dispatch;
  return actions;
}

// export default connect(mapStateToProps, OrderActions)(ManagePannel);
export default connect(mapStateToProps, mapDispatchToProps)(ManagePannel);


/***************   *******   *****************/
/***************   子模态框   *****************/
/***************   *******   *****************/

var CancelOrderModal = React.createClass({
  getInitialState: function() {
    return {
      reason: '',
      tips: '请填写取消原因或从下方选择原因',
      order: {},
      reasons: ['客户打电话取消', '订单信息有误', '无法生产并与客户沟通'],
    };
  },
  mixins: [LinkedStateMixin],
  render(){
    var reasons = this.state.reasons.map((n, i) => {
      return <button onClick={this.chooseReason.bind(this, n)} key={i} className="btn btn-default btn-xs space">{n}</button>
    })
    return (
      <StdModal submitting={this.props.submitting} title="取消订单" onConfirm={this.onConfirm} onCancel={this.hideCallback} ref="modal">
        <div className="form-group round" style={{border: '1px solid #ccc'}}>
          <textarea 
            valueLink={this.linkState('reason')}
            className="form-control" 
            style={{'border': 'none', maxWidth: '100%'}} 
            placeholder={this.state.tips}
            rows="3"
            >
          </textarea>
          <hr className="dotted" style={{margin: '10px 0'}}/>
          <div className="text-center" style={{'paddingBottom': 10}}>
            {reasons}
          </div>
        </div>
      </StdModal>
    )
  },
  chooseReason(reason){
    this.setState({reason})
  },
  onConfirm(){
    var { reason, tips, order: {order_id, updated_time} } = this.state;
    if(reason){
      this.props.cancelOrder(order_id, {cancel_reason: reason, updated_time })
        .done(function(){
          this.refs.modal.hide();
          this.props.callback();
        }.bind(this))
        .fail(function(){
          Noty('error', '异常错误');
        }.bind(this));
    }else{
      Noty('warning', tips);
    }
  },
  componentDidMount(){

  },
  show(order){
    this.setState({order}, function(){
      this.refs.modal.show();
    })
  },
  hideCallback(){
    this.setState(this.getInitialState());
  }
});

var AlterStationModal = React.createClass({
  propTypes: {
    actions: PropTypes.shape({
      autoGetDeliveryStations: PropTypes.func.isRequired,
    })
  },
  getInitialState: function() {
    return {
      delivery_id: undefined,
      handling: false,
      auto_match_delivery_center: false,
      auto_match_msg: '',
    };
  },
  componentWillReceiveProps(nextProps){
    if(nextProps.order){
      this.setState({delivery_id: nextProps.order.delivery_id})
    }
  },
  mixins: [LinkedStateMixin],
  render(){
    var { submitting, loading, order } = this.props;
    var { handling } = this.state;
    return (
      <StdModal loading={loading} disabled={handling} submitting={submitting} onConfirm={this.onConfirm} title="分配配送站" onCancel={this.hideCallback} ref="modal">
        <div className="form-group">
          <label>收货地址：</label>
          {order && `${order.province_name} ${order.city_name} ${order.regionalism_name} ${order.recipient_address}`}
        </div>
        <div className="form-group form-inline">
          <label>配送中心：</label>
          <Select ref="delivery_center" valueLink={this.linkState('delivery_id')} className="transition" options={this.props.delivery_stations} />
          {'　'}
          <button onClick={this.autoMatchHandler} disabled={handling} data-submitting={handling} className="btn btn-xs btn-theme">自动分配</button>
          {' '}
          <span className={this.state.auto_match_delivery_center ? 'text-success' : 'text-danger'}>
            {this.state.auto_match_msg}
          </span>
        </div>
      </StdModal>
    )
  },
  componentDidMount(){
    setTimeout(function(){
      createMap(this);
    }.bind(this), 100)
    $(findDOMNode(this.refs.delivery_center)).on('click', this.clearMsg)
  },
  componentWillUnmount(){
    $(findDOMNode(this.refs.delivery_center)).off('click', this.clearMsg)
  },
  clearMsg(){
    $(findDOMNode(this.refs.delivery_center)).removeClass('alert-success alert-danger')
    this.setState({auto_match_msg: ''})
  },
  autoMatchHandler(e){
    var {order} = this.props;
    this.setState({handling: true}, function(){
      autoMatch.call(this, order.city_name, order.regionalism_name + order.recipient_address)
        .done((delivery_id) => {
          if(delivery_id)
            this.setState({delivery_id})
        })
        .always(() => {
          this.setState({handling: false})
        })
    })
  },
  onConfirm(){
    var { delivery_id } = this.state;
    var delivery_name = $(findDOMNode(this.refs.delivery_center)).find('option:selected').html();
    if(!delivery_id || delivery_id == SELECT_DEFAULT_VALUE){
      Noty('warning', '请选择配送中心'); return;
    }
    var { actions: {alterStation}, active_order_id, callback, order: {updated_time} } = this.props;
    alterStation(active_order_id, {delivery_id, delivery_name, updated_time})
      .done(function(){
        callback();
        this.refs.modal.hide();
      }.bind(this))
      .fail(function(){
        Noty('error', '服务器异常')
      })
  },
  show(){
    this.refs.modal.show();
  },
  hideCallback(){
    // this.refs.modal.hide();
    this.setState(this.getInitialState());
    this.props.actions.resetDeliveryStations();
  }
})

var OrderExceptionModal = React.createClass({
  getInitialState: function() {
    return {
      reason: '',
      tips: '请填写异常原因或从下方选择原因',
      order: {},
      reasons: ['配送站分配有误', '蛋糕无法派送'],
    };
  },
  mixins: [LinkedStateMixin],
  render(){
    var reasons = this.state.reasons.map((n, i) => {
      return <button onClick={this.chooseReason.bind(this, n)} key={i} className="btn btn-default btn-xs space">{n}</button>
    })
    return (
      <StdModal submitting={this.props.submitting} onConfirm={this.onConfirm} title="订单异常" onCancel={this.hideCallback} ref="modal">
        <div className="form-group round" style={{border: '1px solid #ccc'}}>
          <textarea 
            valueLink={this.linkState('reason')}
            className="form-control" 
            style={{'border': 'none', maxWidth: '100%'}} 
            placeholder={this.state.tips}
            rows="3"
            >
          </textarea>
          <hr className="dotted" style={{margin: '10px 0'}}/>
          <div className="text-center" style={{'paddingBottom': 10}}>
            {reasons}
          </div>
        </div>
      </StdModal>
    )
  },
  chooseReason(reason){
    this.setState({reason})
  },
  onConfirm(){
    var { reason, tips, order } = this.state;
    if(reason){
      this.props.orderException(order.order_id, {cancel_reason: reason})
        .done(function(){
          this.refs.modal.hide();
          this.props.callback();
        }.bind(this))
        .fail(function(){
          Noty('error', '异常错误');
        }.bind(this));
    }else{
      Noty('warning', tips);
    }
  },
  componentDidMount(){

  },
  show(order){
    this.setState({order}, function(){
      this.refs.modal.show();
    })
  },
  hideCallback(){
    this.setState(this.getInitialState());
  }
});
