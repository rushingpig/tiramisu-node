import React, {Component, PropTypes} from 'react';
import * as OrderManageActions from 'actions/orders';

import Pagination from 'common/pagination';
import StdModal from 'common/std_modal';
import { get_table_empty } from 'common/loading';
import RecipientInfo from 'common/recipient_info';

import {order_status} from 'config/app.config';
import { form, Noty } from 'utils/index';

import OrderProductsDetail from 'common/order_products_detail';


class OrderRow extends Component {
  render(){
    var { props } = this;
    var src_name = props.src_name.split(',');
    var _order_status = order_status[props.status] || {};
    return (
      <tr className={props.active_order_id == props.order_id ? 'active' : ''} onClick={this.clickHandler.bind(this)}>
        <td>{props.order_id}</td>
        <td><div className="time">{props.created_time}</div></td>
        <td>{props.owner_name}<br />{props.owner_mobile}</td>
        <RecipientInfo data={props} />
        <td>{props.delivery_time ? props.delivery_time : '未知'}</td>
        <td><div className="remark-in-table">{props.remarks}</div></td>
        {/*订单来源*/}
        <td className="nowrap">
          {src_name[0]}
          {src_name[1] ? [<br />, <span className="bordered bg-warning">{src_name[1]}</span>] : null}
        </td>
        {/*订单状态*/}
        <td><div style={{color: _order_status.color || 'inherit'}}>{_order_status.value}</div></td>
        <td>todo</td>
        <td>{props.updated_by}</td>
        <td><div className="time">{props.updated_time}</div></td>
      </tr>
    )
  }
  clickHandler(){
    this.props.checkHistoryOrder(this.props.order_id);
  }
}

class HistoryOrders extends Component {
  constructor(props){
    super(props);
    this.search = this.search.bind(this);
    this.show = this.show.bind(this);
    this.hideCallback = this.hideCallback.bind(this);
    this.state = {
      page_size: 3,
      phone_num: this.props.phone_num
    }
  }
  render(){
    var { checkHistoryOrder } = this.props;
    var { page_no, total, list, check_order_info, active_order_id } = this.props.data;
    var { viewDetail } = this;

    var content = list.map((n, i) => {
      return <OrderRow key={n.order_id} {...{...n, active_order_id, viewDetail, checkHistoryOrder}} />;
    })
    return (
    <StdModal ref="modal" size="lg" footer={false} title="历史订单">
      <div className="form-group form-inline">
        <label>
          {'手机号码 '}
          <input value={this.state.phone_num} onChange={this.onPhonenumChange.bind(this)} className="form-control input-xs" />
        </label>
        {'　'}
        <button onClick={this.search} className="btn btn-default btn-xs">查询</button>
        {'　'}
        <button onClick={this.copyOrder.bind(this)} className="btn btn-default btn-xs">复制订单</button>
        <span className="pull-right theme">{ window.xfxb.user.name }</span>
      </div>
      <div className="table-responsive">
        <table className="table table-hover text-center">
          <thead>
          <tr>
            <th>订单号</th>
            <th>下单时间</th>
            <th>下单人</th>
            <th>收货人信息</th>
            <th>配送时间</th>
            <th>备注</th>
            <th>订单来源</th>
            <th>订单状态</th>
            <th>发票备注</th>
            <th>操作人</th>
            <th>操作时间</th>
          </tr>
          </thead>
          <tbody>
          {content.length ? content : get_table_empty()}
          </tbody>
        </table>
      </div>

      <Pagination 
        page_no={page_no} 
        total_count={total} 
        page_size={this.state.page_size} 
        onPageChange={this.onPageChange}
      />

      { check_order_info
      ? <div className="panel">
          <div className="panel-body">
            <div>历史订单产品详情</div>
            <OrderProductsDetail products={check_order_info.products} />
          </div>
        </div>
      : null }
    </StdModal>
    )
  }
  onPhonenumChange(e){
    this.setState({ phone_num: e.target.value })
  }
  componentWillReceiveProps(nextProps){
    if(nextProps.phone_num != this.props.phone_num){
      this.setState({ phone_num: nextProps.phone_num })
    }
  }
  onPageChange(page){
    this.setState({page_no: page});
  }
  componentDidMount() {

  }
  search(){
    var { getHistoryOrders, data: {page_no} } = this.props;
    var { phone_num, page_size } = this.state;
    if(!phone_num){
      return;
    }else if(form.isMobile(phone_num)){
      getHistoryOrders({owner_mobile: phone_num, page_no, page_size});
    }else{
      Noty('warning', '错误的电话号码')
    }
  }
  copyOrder(){
    var { data: {check_order_info}, getCopyOrderById, copyOrder } = this.props;
    if(check_order_info){
      getCopyOrderById(check_order_info.order_id)
        .done(() => {
          copyOrder();
          this.refs.modal.hide();
        })
        .fail((msg) => {
          Noty('error', msg || '网络繁忙，请稍后再试')
        })
    }else{
      Noty('warning', '请点击选择你想要复制的订单');
    }
  }
  show(){
    this.refs.modal.show();
    this.search();
  }
  hideCallback(){
    
  }
}

HistoryOrders.propTypess = {
  data: PropTypes.object.isRequired,
  getHistoryOrders: PropTypes.func.isRequired,
  checkHistoryOrder: PropTypes.func.isRequired,
  getCopyOrderById: PropTypes.func.isRequired,
  copyOrder: PropTypes.func.isRequired,
}

export default HistoryOrders;
