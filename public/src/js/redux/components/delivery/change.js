import React, {Component, PropTypes} from 'react';
import { render } from 'react-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import DatePicker from 'common/datepicker';
import Select from 'common/select';
import Pagination from 'common/pagination';
import StdModal from 'common/std_modal';
import LineRouter from 'common/line_router';
import { tableLoader } from 'common/loading';

import { Noty } from 'utils/index';
import { DELIVERY_MAP } from 'config/app.config';
import history from 'history_instance';
import LazyLoad from 'utils/lazy_load';

import OrderProductsDetail from 'common/order_products_detail';
import OrderDetailModal from 'common/order_detail_modal';

import * as OrderActions from 'actions/orders';
import * as ChangeActions from 'actions/delivery_change';

// import ManageDetailModal from 'common/order_detail_modal';
// import ManageAlterStationModal from './manage_alter_station_modal';

class TopHeader extends Component {
  render(){
    return (
      <div className="clearfix top-header">
        <LineRouter 
          routes={[{name: '送货单管理', link: '/dm/change'}, {name: '订单转送货单列表', link: ''}]} />
      </div>
    )
  }
}

class FilterHeader extends Component {
  render(){
    var { start_date, delivery_date, changeHandler } = this.props;
    return (
      <div className="panel search">
        <div className="panel-body form-inline">
          <input className="form-control input-xs" placeholder="关键字" />
          {' 开始时间'}
          <DatePicker date={start_date} className="short-input" />
          {' 配送时间'}
          <DatePicker date={delivery_date} className="short-input" />
          <Select default-text="选择配送中心" className="space"/>
          <Select default-text="所属省份" className="space"/>
          <Select default-text="所属城市" className="space"/>

          <button onClick={changeHandler} className="btn btn-theme btn-xs">转换</button>
        </div>
      </div>
    )
  }
}
FilterHeader.propTypes = {
  changeHandler: PropTypes.func.isRequired,
}

class OrderRow extends Component {
  render(){
    var { props } = this;
    return (
      <tr onClick={this.clickHandler.bind(this)} className={props.active_order_id == props.order_id ? 'active' : ''}>
        <td>
          <input onChange={this.checkOrderHandler.bind(this)} checked={props.checked} type="checkbox" />
        </td>
        <td>{props.delivery_time}</td>
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
        <td>todo</td>
        <td><a onClick={props.viewOrderDetail} href="javascript:;">{props.order_id}</a></td>
        <td>{DELIVERY_MAP[props.pay_modes_id]}</td>
        <td><div className="remark-in-table">{props.remarks}</div></td>
        <td>{props.updated_by}</td>
        <td><div className="time">{props.updated_date}</div></td>
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
  }
  render(){
    var { filter, exchangeOrders } = this.props;
    var { change_submitting } = filter;
    var { loading, page_no, total, list, checked_order_ids, check_order_info, active_order_id } = this.props.orders;
    var { checkOrderHandler, viewOrderDetail, activeOrderHandler } = this;

    var content = list.map((n, i) => {
      return <OrderRow key={n.order_id} {...{...n, active_order_id, activeOrderHandler, checkOrderHandler, viewOrderDetail}} />;
    })
    return (
      <div className="order-manage">

        <TopHeader />
        <FilterHeader {...filter} changeHandler={this.changeHandler} />

        <div className="panel">
          <header className="panel-heading">送货列表</header>
          <div className="panel-body">
            <div className="table-responsive">
              <table className="table table-hover text-center">
                <thead>
                <tr>
                  <th><input onChange={this.checkAll.bind(this)} type="checkbox" /></th>
                  <th>送达时间</th>
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
                { tableLoader( loading, content ) }
                </tbody>
              </table>
            </div>

            <Pagination 
              page_no={page_no} 
              total_count={total} 
              page_size={this.state.page_size} 
              onPageChange={this.onPageChange}
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

        <ChangeModal {...{exchangeOrders, change_submitting, checked_order_ids}} ref="changeModal" />
        <OrderDetailModal ref="detail_modal" data={check_order_info || {}} />
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
  onPageChange(page){
    this.setState({page_no: page});
  }
  componentDidMount() {
    var { getOrderList, orders } = this.props;
    getOrderList({page_no: orders.page_no, page_size: this.state.page_size});

    LazyLoad('noty');
  }
}

function mapStateToProps({deliveryChange}){
  return deliveryChange;
}

/* 这里可以使用 bindActionCreators , 也可以直接写在 connect 的第二个参数里面（一个对象) */
function mapDispatchToProps(dispatch){
  return bindActionCreators({...OrderActions, ...ChangeActions}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(DeliverChangePannel);


/***************   *******   *****************/
/***************   子模态框   *****************/
/***************   *******   *****************/

class ChangeModal extends Component {
  componentWillReceiveProps(nextProps){
    if(nextProps['data-id'] != this.props['data-id']){
      this.show();
    }
  }
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
    var { exchangeOrders, checked_order_ids } = this.props;
    exchangeOrders(checked_order_ids).done(function(){
      this.hide();
      Noty('success', '转换成功！')
    }.bind(this)).fail(() => {
      Noty('error', '转换异常')
    })
  }
};

ChangeModal.PropTypes = {
  checked_order_ids: PropTypes.array.isRequired,
  exchangeOrders: PropTypes.func.isRequired,
  change_submitting: PropTypes.bool.isRequired,
}