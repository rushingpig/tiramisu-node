import React, {Component, PropTypes} from 'react';
import { render, findDOMNode } from 'react-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { reduxForm } from 'redux-form';

import * as AreaActions from 'actions/area';
import * as OrderManageActions from 'actions/orders';
import { getOrderSrcs } from 'actions/order_manage_form';

import DatePicker from 'common/datepicker';
import Select from 'common/select';
import Pagination from 'common/pagination';
import Config from 'config/app.config';
import history from 'history_instance';
import LineRouter from 'common/line_router';
import SearchInput from 'common/search_input';
import { get_table_empty } from 'common/loading';
import LazyLoad from 'utils/lazy_load';

import OrderProductsDetail from 'common/order_products_detail';
import ManageDetailModal from 'common/order_detail_modal';
import ManageAlterStationModal from './manage_alter_station_modal';
import OrderSrcsSelects from 'common/order_srcs_selects';

class TopHeader extends Component {
  render(){
    return (
      <div className="clearfix top-header">
        <button onClick={this.addOrder.bind(this)} className="btn btn-theme pull-left">添加订单</button>
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

class FilterHeader extends Component {
  constructor(props){
    super(props);
    this.state = {
      submit_opts: [{id: 1, text: '已提交'}, {id: 0, text: '未提交'}],
      deal_opts: [{id: 1, text: '已处理'}, {id: 0, text: '未处理'}],
      selected_order_src_level1_id: Config.SELECT_DEFAULT_VALUE,
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
          <input {...keywords} className="form-control input-xs" placeholder="关键字" />
          {' 开始时间'}
          <DatePicker redux-form={begin_time} className="short-input" />
          {' 配送时间'}
          <DatePicker redux-form={end_time} className="short-input" />
          <Select {...is_submit} options={this.state.submit_opts} default-text="是否提交" className="space"/>
          <Select {...is_deal} options={this.state.deal_opts} default-text="是否处理" className="space"/>
          <OrderSrcsSelects {...{all_order_srcs, src_id}} />
          <Select {...province_id} onChange={this.onProvinceChange.bind(this, province_id.onChange)} options={provinces} ref="province" default-text="选择省份" className="space"/>
          <Select {...city_id} options={cities} default-text="选择城市" ref="city" className="space"/>
          <Select {...status} options={all_order_status} default-text="订单状态" className="space"/>
          <button disabled={search_ing} data-submitting={search_ing} onClick={this.search.bind(this)} className="btn btn-theme btn-xs"><i className="fa fa-search"></i></button>
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

class OrderRow extends Component {
  render(){
    var { props } = this;
    return (
      <tr className={props.active_order_id == props.order_id ? 'active' : ''} onClick={this.clickHandler.bind(this)}>
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
    this.props.activeOrder(this.props.order_id);
  }
  editHandler(e){
    history.push('/om/index/' + this.props.order_id);
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
    var { filter, area, activeOrder, dispatch, getOrderList } = this.props;
    var { page_no, total, list, check_order_info, active_order_id } = this.props.orders;
    var { viewDetail, alterStation } = this;

    var content = list.map((n, i) => {
      return <OrderRow key={n.order_id} {...{...n, active_order_id, viewDetail, alterStation, activeOrder}} />;
    })
    return (
      <div className="order-manage">

        <TopHeader />
        <FilterHeader {...{...filter, ...area}}
           actions={{...bindActionCreators({...AreaActions, getOrderSrcs}, dispatch), getOrderList}}
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
                {content.length ? content : get_table_empty()}
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
                <OrderProductsDetail products={check_order_info.products} />
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
  var actions = bindActionCreators(OrderManageActions, dispatch);
  actions.dispatch = dispatch;
  return actions;
}

// export default connect(mapStateToProps, OrderManageActions)(ManagePannel);
export default connect(mapStateToProps, mapDispatchToProps)(ManagePannel);
