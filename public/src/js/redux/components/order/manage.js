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

import ManageDetailModal from './manage_detail_modal';
import ManageAlterStationModal from './manage_alter_station_modal';

class TopHeader extends Component {
  render(){
    return (
      <div className="clearfix top-header">
        <button onClick={this.addOrder.bind(this)} className="btn btn-theme pull-left">添加订单</button>
        <div className="pull-right line-router">
          <span className="node">总订单页面</span>
          <span>{'　/　'}</span>
          <span className="node active">处理页面</span>
        </div>
      </div>
    )
  }
  addOrder(){
    history.replace('/om/index/add');
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
          <Select default-text="是否提交" className="space"/>
          <Select default-text="是否处理" className="space"/>
          <Select default-text="订单来源" className="space"/>
          <Select default-text="选择城市" className="space"/>
          <Select default-text="订单状态" className="space"/>
          <button className="btn btn-theme btn-sm"><i className="fa fa-search"></i></button>
        </div>
      </div>
    )
  }
}
FilterHeader.propTypes = {
  start_date: PropTypes.string.isRequired,
  delivery_date: PropTypes.string.isRequired,
  startDateChange: PropTypes.func.isRequired,
  deliveryDateChange: PropTypes.func.isRequired
}

class OrderRow extends Component {
  render(){
    var { props } = this;
    return (
      <tr className={props.selected_order_id == props.order_id ? 'active' : ''} onClick={this.clickHandler.bind(this)}>
        <td>
          <a onClick={this.editHandler.bind(this)} href="javascript:;">[编辑]</a><br/>
          <a onClick={this.viewDetail.bind(this)} href="javascript:;">[查看]</a><br/>
          <a onClick={this.alterStation.bind(this)} href="javascript:;" className="nowrap">[修改配送]</a>
        </td>
        <td>{props.merchant_id}</td>
        <td>{props.order_id}</td>
        <td>{props.owner_name}<br />{props.owner_mobile}</td>
        <td><div className="time">{props.created_time}</div></td>
        <td className="text-left">
          姓名：{props.recipient_name}<br />
          电话：{props.recipient_mobile}<br />
          <div className="address-detail-td">
            <span className="inline-block">地址：</span><span className="address-all">{props.recipient_address}</span>
          </div>
          建筑：todo
        </td>
        <td>{props.delivery_date}</td>
        <td className="nowrap">todo<br /><span className="bordered">todo</span></td>
        <td><strong className="strong">{Config.pay_status[props.pay_status]}</strong></td>
        <td className="nowrap">
          总金额：todo <br />
          应收：todo
        </td>
        <td><div className="bg-success round">{props.status}</div></td>
        <td>todo</td>
        <td><div className="time">{props.delivery_time}</div></td>
        <td>{props.is_submit == '1' ? '是' : '否'}</td>
        <td>{props.is_deal == '1' ? '是' : '否'}</td>
        <td>{props.city}</td>
        <td>{props.cancel_reason}</td>
        <td><div className="remark-in-table">{props.remarks}</div></td>
        <td>{props.created_by}</td>
        <td>{props.updated_by}</td>
        <td><div className="time">{props.updated_date}<br/><a href="#">操作记录</a></div></td>
      </tr>
    )
  }
  clickHandler(){
    this.props.checkOrder(this.props.order_id);
  }
  editHandler(e){
    history.replace('/om/index/' + this.props.order_id);
    e.stopPropagation();
  }
  viewDetail(e){
    this.props.viewDetail(this.props);
    e.stopPropagation();
  }
  alterStation(e){
    this.props.alterStation(this.props);
    e.stopPropagation();
  }
}

function ProductRow(product){
  return (
    <tr>
      <td>{product.product_name}</td>
      <td>￥{product.original_price / 100}</td>
      <td>{product.size}</td>
      <td>{product.num}</td>
      <td>￥{product.discount_price / 100}</td>
      <td>{product.choco_board}</td>
      <td>{product.greeting_card}</td>
      <td>{product.atlas}</td>
      <td>{product.custom_name}</td>
      <td>{product.custom_desc}</td>
    </tr>
  )
}

class ManagePannel extends Component {
  constructor(props){
    super(props);
    this.viewDetail = this.viewDetail.bind(this);
    this.alterStation = this.alterStation.bind(this);
    this.state = {
      page_size: 8,
    }
  }
  render(){
    var { filter, startDateChange, deliveryDateChange, checkOrder } = this.props;
    var { page_no, total, list, check_order_info, selected_order_id } = this.props.orders;
    var { viewDetail, alterStation } = this;

    var content = list.map((n, i) => {
      return <OrderRow key={n.order_id} {...{...n, selected_order_id, viewDetail, alterStation, checkOrder}} />;
    })
    var products = check_order_info && check_order_info.products.map(function(n){
      return ProductRow(n);
    })
    return (
      <div className="order-manage">

        <TopHeader />
        <FilterHeader {...{...filter, startDateChange, deliveryDateChange}} />

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
          ? <div className="panel">
              <div className="panel-body">
                <div>订单管理 >> 产品详情</div>
                <div className="table-responsive">
                  <table className="table text-center">
                    <thead>
                    <tr>
                      <th>产品名称</th>
                      <th>原价</th>
                      <th>规格</th>
                      <th>数量</th>
                      <th>实际售价</th>
                      <th>巧克力牌</th>
                      <th>祝福贺卡</th>
                      <th>产品图册</th>
                      <th>自由拼名称</th>
                      <th>自由拼描述</th>
                    </tr>
                    </thead>
                    <tbody>
                      {products}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          : null }

        <div ref="modal-wrap"></div>
      </div>
    )
  }
  onPageChange(page){
    this.setState({page_no: page});
  }
  componentDidMount() {
    var { getOrderList, orders } = this.props;
    getOrderList({page_no: orders.page_no, page_size: this.state.page_size});
  }
  viewDetail(n){
    render(<ManageDetailModal data={n} data-id={new Date().getTime()} />, this.refs['modal-wrap']);
  }
  alterStation(n){
    render(<ManageAlterStationModal data={n} data-id={new Date().getTime()} />, this.refs['modal-wrap'])
  }
}

function mapStateToProps({orderManage}){
  return orderManage;
}

/* 这里可以使用 bindActionCreators , 也可以直接写在 connect 的第二个参数里面（一个对象) */
function mapDispatchToProps(dispatch){
  return bindActionCreators(OrderManageActions, dispatch);
}

// export default connect(mapStateToProps, OrderManageActions)(ManagePannel);
export default connect(mapStateToProps, mapDispatchToProps)(ManagePannel);
