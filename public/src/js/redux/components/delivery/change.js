import React, {Component, PropTypes} from 'react';
import { render } from 'react-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as OrderManageActions from 'actions/order_manage';
import DatePicker from 'common/datepicker';
import Select from 'common/select';
import Pagination from 'common/pagination';

import Config from 'config/app.config';
import history from 'history_instance';
import LineRouter from 'common/line_router';
import OrderProductsDetail from 'common/order_products_detail';

// import ManageDetailModal from './manage_detail_modal';
// import ManageAlterStationModal from './manage_alter_station_modal';

class TopHeader extends Component {
  render(){
    return (
      <div className="clearfix top-header">
        <LineRouter 
          routes={[{name: '送货单管理', link: '/dm/process'}, {name: '订单转送货单列表', link: ''}]} />
      </div>
    )
  }
}

class FilterHeader extends Component {
  render(){
    var { start_date, delivery_date, startDateChange, deliveryDateChange } = this.props;
    return (
      <div className="panel search">
        <div className="panel-body form-inline">
          <div className="search-input inline-block">
            <input className="form-control input-sm" placeholder="关键字" />
            <i className="fa fa-search"></i>
          </div>
          {' 开始时间'}
          <DatePicker date={start_date} onChange={startDateChange} className="short-input" />
          {' 配送时间'}
          <DatePicker date={delivery_date} onChange={deliveryDateChange} className="short-input" />
          <Select default-text="选择配送中心" className="space"/>
          <Select default-text="所属省份" className="space"/>
          <Select default-text="所属城市" className="space"/>

          <button className="btn btn-theme btn-sm">转换</button>
        </div>
      </div>
    )
  }
}
// FilterHeader.propTypes = {
//   start_date: PropTypes.string.isRequired,
//   delivery_date: PropTypes.string.isRequired,
//   startDateChange: PropTypes.func.isRequired,
//   deliveryDateChange: PropTypes.func.isRequired
// }

class OrderRow extends Component {
  render(){
    var { props } = this;
    return (
      <tr className={props.selected_order_id == props.order_id ? 'active' : ''}>
        <td>
          <input type="checkbox" />
        </td>
        <td>{props.delivery_date}</td>
        <td>{props.owner_name}<br />{props.owner_mobile}</td>
        <td className="text-left">
          姓名：{props.recipient_name}<br />
          电话：{props.recipient_mobile}<br />
          <div className="address-detail-td">
            <span className="inline-block">地址：</span><span className="address-all">{props.recipient_address}</span>
          </div>
          建筑：todo
        </td>
        <td>todo</td>
        <td>todo</td>
        <td className="nowrap">todo</td>
        <td>todo</td>
        <td><div className="remark-in-table">{props.remarks}</div></td>
        <td>{props.updated_by}</td>
        <td><div className="time">{props.updated_date}</div></td>
      </tr>
    )
  }
  // clickHandler(){
  //   this.props.checkOrder(this.props.order_id);
  // }
}

class DeliverChangePannel extends Component {
  constructor(props){
    super(props);
    this.state = {
      page_size: 8,
    }
  }
  render(){
    var { filter, startDateChange, deliveryDateChange, checkOrder } = this.props;
    var { page_no, total, list, check_order_info, selected_order_id } = this.props.orders;
    var { viewDetail, alterStation } = this;

    var content = list.map((n, i) => {
      return <OrderRow key={n.order_id} {...{...n, selected_order_id, viewDetail, checkOrder}} />;
    })
    return (
      <div className="order-manage">

        <TopHeader />
        <FilterHeader {...{...filter, startDateChange, deliveryDateChange}} />

        <div className="panel">
          <header className="panel-heading">送货列表</header>
          <div className="panel-body">
            <div className="table-responsive">
              <table className="table table-hover text-center">
                <thead>
                <tr>
                  <th><input type="checkbox" /></th>
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
                {content}
                </tbody>
              </table>
            </div>
          </div>

           <Pagination 
              page_no={page_no} 
              total_count={total} 
              page_size={this.state.page_size} 
              onPageChange={this.onPageChange}
            />
        </div>

        { check_order_info
          ? <OrderProductsDetail products={check_order_info.products} />
          : null }

        <div ref="modal-wrap"></div>
      </div>
    )
  }
  onPageChange(page){
    this.setState({page_no: page});
  }
  componentDidMount() {
    // var { getOrderList, orders } = this.props;
    // getOrderList({page_no: orders.page_no, page_size: this.state.page_size});
  }
}

function mapStateToProps({deliveryChange}){
  return deliveryChange;
}

/* 这里可以使用 bindActionCreators , 也可以直接写在 connect 的第二个参数里面（一个对象) */
function mapDispatchToProps(dispatch){
  return bindActionCreators(OrderManageActions, dispatch);
}

export default connect(mapStateToProps, OrderManageActions)(DeliverChangePannel);
