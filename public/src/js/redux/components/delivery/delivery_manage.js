import React, {Component, PropTypes} from 'react';
import { render } from 'react-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as OrderManageActions from 'actions/orders';

import DatePicker from 'common/datepicker';
import Select from 'common/select';
import Pagination from 'common/pagination';
import StdModal from 'common/std_modal';
import LineRouter from 'common/line_router';

import Config from 'config/app.config';
import history from 'history_instance';
import LazyLoad from 'utils/lazy_load';

import OrderProductsDetail from 'common/order_products_detail';

// import ManageDetailModal from 'common/order_detail_modal';
// import ManageAlterStationModal from './manage_alter_station_modal';

class TopHeader extends Component {
  render(){
    return (
      <div className="clearfix top-header">
        <LineRouter 
          routes={[{name: '送货单管理', link: '/dm/change'}, {name: '送货单列表', link: ''}]} />
      </div>
    )
  }
}

class FilterHeader extends Component {
  render(){
    var { start_date, delivery_date } = this.props;
    return (
      <div className="panel search">
        <div className="panel-body">
          <div className="form-group form-inline">
            <input className="form-control input-xs" placeholder="关键字" />
            {' 开始时间'}
            <DatePicker date={start_date} className="short-input" />
            {' 配送时间'}
            <DatePicker date={delivery_date} className="short-input" />
            <Select default-text="选择配送方式" className="space"/>
            <Select default-text="是否打印" className="space"/>
            <Select default-text="是否有祝福贺卡" className="space"/>
            <Select default-text="所属省份" className="space"/>
            <Select default-text="所属城市" className="space"/>
            <button className="btn btn-theme btn-xs">批量打印</button>
          </div>
          <div className="form-group form-inline">
            <button className="btn btn-default btn-xs space-right">扫描前请点击</button>
            <button className="btn btn-theme btn-xs space-right">扫描完成</button>
            <button className="btn btn-theme btn-xs">批量编辑配送员</button>
          </div>
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
      <tr className={props.active_order_id == props.order_id ? 'active' : ''}>
        <td>
          <input type="checkbox" />
        </td>
        <td>
          <a onClick={this.showEditModal.bind(this)} href="javascript:;">[编辑配送员]</a><br/>
          <a onClick={this.showPrintModal.bind(this)} href="javascript:;">[打印]</a>
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
  showEditModal(){
    this.props.showEditModal();
  }
  showPrintModal(){
    this.props.showPrintModal();
  }
  // clickHandler(){
  //   this.props.activeOrder(this.props.order_id);
  // }
}

class DeliveryManagePannel extends Component {
  constructor(props){
    super(props);
    this.state = {
      page_size: 8,
    }
    this.showEditModal = this.showEditModal.bind(this);
    this.showPrintModal = this.showPrintModal.bind(this);
  }
  render(){
    var { filter } = this.props;
    var { page_no, total, list, check_order_info, active_order_id } = this.props.orders;
    var { viewDetail } = this;

    var content = list.map((n, i) => {
      return <OrderRow key={n.order_id} {...{...n, active_order_id, viewDetail, activeOrder}} />;
    })
    return (
      <div className="order-manage">

        <TopHeader />
        <FilterHeader {...filter} />

        <div className="panel">
          <header className="panel-heading">送货列表</header>
          <div className="panel-body">
            <div className="table-responsive">
              <table className="table table-hover text-center">
                <thead>
                <tr>
                  <th><input type="checkbox" /></th>
                  <th>管理操作</th>
                  <th>是否打印</th>
                  <th>配送员</th>
                  <th>送达时间</th>
                  <th>下单人</th>
                  <th>收货人信息</th>
                  <th>祝福贺卡</th>
                  <th>转单时间</th>
                  <th>订单状态</th>
                  <th>订单号</th>
                  <th>备注</th>
                </tr>
                </thead>
                <tbody>
                  <OrderRow showEditModal={this.showEditModal} showPrintModal={this.showPrintModal} />
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
  showEditModal(n){
    render(<EditModal data={n} data-id={new Date().getTime()} />, this.refs['modal-wrap']);
  }
  showPrintModal(n){
    render(<PrintModal data={n} data-id={new Date().getTime()} />, this.refs['modal-wrap']);
  }
  onPageChange(page){
    this.setState({page_no: page});
  }
  componentDidMount() {
    // var { getOrderList, orders } = this.props;
    // getOrderList({page_no: orders.page_no, page_size: this.state.page_size});
    LazyLoad('chinese_py');
  }
}

function mapStateToProps({deliveryManage}){
  return deliveryManage;
}

/* 这里可以使用 bindActionCreators , 也可以直接写在 connect 的第二个参数里面（一个对象) */
function mapDispatchToProps(dispatch){
  return bindActionCreators(OrderManageActions, dispatch);
}

export default connect(mapStateToProps, OrderManageActions)(DeliveryManagePannel);

/***************   *******   *****************/
/***************   子模态框   *****************/
/***************   *******   *****************/

var PrintModal = React.createClass({
  getInitialState: function() {
    return {
      
    };
  },
  componentWillReceiveProps: function(nextProps){
    if(nextProps['data-id'] != this.props['data-id']){
      this.show();
    }
  },
  render: function(){
    var { num } = this.props;
    return (
      <StdModal ref="modal" title="批量打印订单">
        <center><h5>您已同时勾选{num}个订单</h5></center>
        <center><h5>进行打印</h5></center>
      </StdModal>
    )
  },
  componentDidMount: function(){
    this.show();
  },
  show: function(){
    this.refs.modal.show();
  },
  hide: function(){
    this.refs.modal.hide();
  },
});


var EditModal = React.createClass({
  getDefaultProps: function() {
    return {
      data: [
        { id: '1', text: '张三三', phone: '17744445555' },
        { id: '2', text: '李四四', phone: '13544445555' },
        { id: '3', text: '王五五', phone: '13344445555' },
        { id: '4', text: '韩梅梅', phone: '13644445555' },
        { id: '5', text: '刘小明', phone: '18944445555' }
      ]
    };
  },
  getInitialState: function() {
    var { data } = this.props;
    var { makePy } = window;
    var new_data = data;
    new_data = data.map(function(n){
      if(makePy)
        n.py = makePy(n.text);
      else
        n.py = [];
      return n;
    })
    return {
      data: new_data,
      filter_results: new_data,
      selected_delivery_man: undefined,
    };
  },
  componentWillReceiveProps: function(nextProps){
    //组建身份证，当它不一样时，证明要重新打开
    if(nextProps['data-id'] != this.props['data-id']){
      this.show();
    }
  },
  render: function(){
    var { filter_results, selected_delivery_man } = this.state;
    var content = filter_results.map( n => {
      return <option key={n.id} value={n.id}>{n.text + ' ' + n.phone}</option>
    });
    return (
      <StdModal ref="modal" title="编辑配送人员">
        <div className="form-group form-inline mg-15">
          <div className="input-group input-group-sm">
              <span className="input-group-addon"><i className="fa fa-filter"></i></span>
              <input onChange={this.filterHandler} type="text" 
                className="form-control" style={{'width': '200'}} placeholder="输入配送员姓名或手机号码检索" />
          </div>
        </div>
        <center className="form-inline mg-15" style={{'padding': '33px 0', 'textIndent': -15}}>
          <label>{'配送人员　'}</label>
          <select value={selected_delivery_man} className="form-control input-sm" style={{'minWidth': '145px'}}>
            {
              content.length
              ? content
              : <option>无</option>
            }
          </select>
        </center>
      </StdModal>
    )
  },
  filterHandler: function(e){
    var { value } = e.target;
    var { data } = this.state;
    var results = [];
    value = value.toUpperCase();
    if(value === ''){
      results = data;
    }else if(/^\d+$/i.test(value)){ //电话号码
      results = data.filter(n => n.phone.indexOf(value) == 0)
    }else if(/^\w+$/i.test(value)){ //首字母
      results = data.filter(n => {
        return n.py.some(m => m.indexOf(value) == 0)
      })
    }else{ //中文全称
      results = data.filter(n => n.text.indexOf(value) != -1)
    }
    this.setState({ filter_results: results, selected_delivery_man: results.length && results[0].id });
  },
  componentDidMount: function(){
    this.show();
  },
  show: function(){
    this.refs.modal.show();
  },
  hide: function(){
    this.refs.modal.hide();
  },
})

