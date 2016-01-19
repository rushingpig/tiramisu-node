import React, {Component, PropTypes} from 'react';
import * as OrderManageActions from 'actions/orders';

import Pagination from 'common/pagination';
import StdModal from 'common/std_modal';
import { get_table_empty } from 'common/loading';

import Config from 'config/app.config';
import { form } from 'utils/index';

import OrderProductsDetail from 'common/order_products_detail';


class OrderRow extends Component {
  render(){
    var { props } = this;
    return (
      <tr className={props.active_order_id == props.order_id ? 'active' : ''} onClick={this.clickHandler.bind(this)}>
        <td>{props.order_id}</td>
        <td><div className="time">{props.created_time}</div></td>
        <td>{props.owner_name}<br />{props.owner_mobile}</td>
        <td className="text-left">
          姓名：{props.recipient_name}<br />
          电话：{props.recipient_mobile}<br />
          <div className="address-detail-td">
            <span className="inline-block">地址：</span><span className="address-all">{props.recipient_address}</span>
          </div>
          建筑：todo
        </td>
        <td>{props.delivery_date}</td>
        <td><div className="remark-in-table">{props.remarks}</div></td>
        <td className="nowrap">todo<br /><span className="bordered">todo</span></td>
        <td><div className="bg-success round">{props.status}</div></td>
        <td>todo</td>
        <td>{props.updated_by}</td>
        <td><div className="time">{props.updated_date}</div></td>
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
    this.hide = this.hide.bind(this);
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
        <button className="btn btn-default btn-xs">复制订单</button>
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
    if(form.isMobile(phone_num))
      getHistoryOrders({owner_mobile: phone_num, page_no, page_size});
    else
      noty('warning', '错误的电话号码')
  }
  show(){
    this.refs.modal.show();
    this.search();
  }
  hide(){
    this.refs.modal.hide();
  }
}

HistoryOrders.PropTypes = {
  data: PropTypes.object.isRequired,
  getHistoryOrders: PropTypes.func.isRequired,
  checkHistoryOrder: PropTypes.func.isRequired
}

export default HistoryOrders;
