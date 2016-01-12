import React, {Component, PropTypes} from 'react';

import * as OrderManageActions from 'actions/orders';

import Pagination from 'common/pagination';
import Config from 'config/app.config';
import { get_table_empty } from 'common/loading';

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
        <td><div className="time">{props.updated_date}<br/><a href="#">操作记录</a></div></td>
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
      page_size: 8,
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
    <div ref="modal" aria-hidden="false" aria-labelledby="myModalLabel" role="dialog" className="modal fade" >
      <div className="modal-backdrop fade"></div>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <button onClick={this.hide} aria-hidden="true" data-dismiss="modal" className="close" type="button">×</button>
            <h4 className="modal-title">历史订单</h4>
          </div>
          <div className="modal-body">
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
          </div>
        </div>
      </div>
    </div>
    )
  }
  onPageChange(page){
    this.setState({page_no: page});
  }
  componentDidMount() {

  }
  search(){
    var { getHistoryOrders, data: {page_no, page_size} } = this.props;
    var { phone_num } = this.state;
    getHistoryOrders({phone_num, page_no, page_size});
  }
  show(){
    $(this.refs.modal).modal('show');
    this.search();
  }
  hide(){
    $(this.refs.modal).modal('hide');
  }
}

HistoryOrders.PropTypes = {
  data: PropTypes.object.isRequired,
  getHistoryOrders: PropTypes.func.isRequired,
  checkHistoryOrder: PropTypes.func.isRequired
}

export default HistoryOrders;
