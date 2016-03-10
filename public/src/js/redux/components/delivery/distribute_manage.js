import React, {Component, PropTypes} from 'react';
import { render, findDOMNode } from 'react-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import LinkedStateMixin from 'react-addons-linked-state-mixin';
import { reduxForm } from 'redux-form';

import DatePicker from 'common/datepicker';
import Select from 'common/select';
import TimeInput from 'common/time_input';
import Pagination from 'common/pagination';
import LineRouter from 'common/line_router';
import StdModal from 'common/std_modal';
import { tableLoader } from 'common/loading';
import RadioGroup from 'common/radio_group';
import RecipientInfo from 'common/recipient_info';

import { order_status, DELIVERY_MAP, YES_OR_NO } from 'config/app.config';
import history from 'history_instance';
import LazyLoad from 'utils/lazy_load';
import { form, Noty, dateFormat, parseTime } from 'utils/index';
import V from 'utils/acl';

import * as OrderActions from 'actions/orders';
import AreaActions from 'actions/area';
import * as DeliverymanActions from 'actions/deliveryman';
import * as DeliveryDistributeActions from 'actions/delivery_distribute';
import { getPayModes } from 'actions/order_manage_form';
import * as OrderSupportActions from 'actions/order_support';

import OrderProductsDetail from 'common/order_products_detail';
import OrderDetailModal from './order_detail_modal';
import ScanModal from 'common/scan_modal';
import OperationRecordModal from 'common/operation_record_modal.js';

class TopHeader extends Component {
  render(){
    return (
      <div className="clearfix top-header">
        <LineRouter 
          routes={[{name: '送货单管理', link: ''}, {name: '配送单列表', link: ''}]} />
      </div>
    )
  }
}

class FilterHeader extends Component {
  constructor(props){
    super(props);
    this.state = {
      search_ing: false,
      all_print_status: YES_OR_NO,
    }
  }
  render(){
    var { 
      fields: {
        keywords,
        begin_time,
        end_time,
        pay_modes_id,
        status,
        deliveryman_id,
        delivery_id,
        province_id,
        city_id,
      },
      provinces,
      cities,
      delivery_stations,
      all_order_status,
      all_pay_modes,
      all_deliveryman,
    } = this.props;
    var { search_ing } = this.state;
    return (
      <div className="panel search">
        <div className="panel-body">
          <div className="form-group form-inline">
            <input {...keywords} className="form-control input-xs v-mg" placeholder="关键字" />
            {' 开始时间'}
            <DatePicker editable redux-form={begin_time} className="short-input" />
            {' 配送时间'}
            <DatePicker editable redux-form={end_time} className="short-input space-right" />
            <Select {...pay_modes_id} options={all_pay_modes} default-text="选择支付方式" className="space-right"/>
            <Select {...status} options={all_order_status} default-text="选择订单状态" className="space-right"/>
            <Select {...deliveryman_id} options={all_deliveryman.map(n => ({id: n.deliveryman_id, text: n.deliveryman_name}))} default-text="选择配送员" className="space-right"/>
            {
              V( 'DeliveryManageDistributeStationFilter' )
                ? <Select {...delivery_id} options={delivery_stations} default-text="选择配送中心" className="space-right"/>
                : null
            }
          </div>
          <div className="form-group form-inline">
            {
              V( 'DeliveryManageDistributeAddressFilter' )
              ? [
                  <Select {...province_id} onChange={this.onProvinceChange.bind(this, province_id.onChange)} options={provinces} ref="province" key="province" default-text="选择省份" className="space-right"/>,
                  <Select {...city_id} options={cities} default-text="选择城市" ref="city" key="city" className="space-right"/>
                ]
              : null
            }
            <button disabled={search_ing} data-submitting={search_ing} onClick={this.search.bind(this)} className="btn btn-theme btn-xs space-right">
              <i className="fa fa-search"></i>{' 搜索'}
            </button>
            {'　'}
            <button onClick={this.onScanHandler.bind(this)} className="btn btn-theme btn-xs space-right">扫描</button>
          </div>
        </div>
      </div>
    )
  }
  componentDidMount(){
    setTimeout(function(){
      var { getProvinces, getPayModes, getAllDeliveryman, getDeliveryStations } = this.props;
      getProvinces();
      getPayModes();
      getAllDeliveryman();
      getDeliveryStations();
      LazyLoad('noty');
    }.bind(this),0)
  }
  onProvinceChange(callback, e){
    var {value} = e.target;
    this.props.provinceReset();
    if(value != this.refs.province.props['default-value'])
      var $city = $(findDOMNode(this.refs.city));
      this.props.getCities(value).done(() => {
        $city.trigger('focus'); //聚焦已使city_id的值更新
      });
    callback(e);
  }
  search(){
    this.setState({search_ing: true});
    this.props.getOrderDistributeList({page_no: 0, page_size: this.props.page_size})
      .always(()=>{
        this.setState({search_ing: false});
      });
  }
  onScanHandler(){
    this.props.showScanModal();
  }
}
FilterHeader.propTypes = {
  provinces: PropTypes.array.isRequired,
  cities: PropTypes.array.isRequired,
  all_pay_modes: PropTypes.array.isRequired,
  delivery_stations: PropTypes.array.isRequired,
  all_order_status: PropTypes.array.isRequired,
  all_pay_modes: PropTypes.array.isRequired,
  all_deliveryman: PropTypes.array.isRequired,
}
FilterHeader = reduxForm({
  form: 'order_distribute_filter',
  fields: [
    'keywords',
    'begin_time',
    'end_time',
    'pay_modes_id',
    'status',
    'deliveryman_id',
    'delivery_id',
    'province_id',
    'city_id'
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
    var _order_status = order_status[props.status] || {};
    return (
      <tr onClick={this.clickHandler.bind(this)} className={props.active_order_id == props.order_id ? 'active' : ''}>
        <td>
          <input onChange={this.checkOrderHandler.bind(this)} checked={props.checked} disabled={props.status == 'COMPLETED'} type="checkbox" />
        </td>
        <td>
          {
            props.status == 'DELIVERY'
              ? [
                  <a onClick={this.showSignedModal.bind(this)} key="signin" href="javascript:;">[签收]</a>,
                  <br key="br" />,
                  <a onClick={this.showUnSignedModal.bind(this)} key="unsignin" href="javascript:;">[未签收]</a>
                ]
              : null
          }
        </td>
        <td>{parseTime(props.delivery_time)}</td>
        <td>￥{props.total_amount/100}</td>
        <td>{props.owner_name}<br />{props.owner_mobile}</td>
        <RecipientInfo data={props} />
        <td><a onClick={props.viewOrderDetail} href="javascript:;">{props.order_id}</a></td>
        <td>{props.delivery_type}</td>
        <td><div className="remark-in-table">{props.remarks}</div></td>
        <td>{parseTime(props.signin_time)}</td>
        <td><div className="bordered bold order-status" style={{color: _order_status.color || 'inherit', background: _order_status.bg }}>{_order_status.value}</div></td>
        <td>{props.updated_by}</td>
        <td><a onClick={this.viewOrderOperationRecord.bind(this)} className="inline-block time" href="javascript:;">{props.updated_time}</a></td>
      </tr>
    )
  }
  showSignedModal(e){
    this.props.showSignedModal(this.props);
    e.stopPropagation();
  }
  showUnSignedModal(e){
    this.props.showUnSignedModal(this.props);
    e.stopPropagation();
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

class DeliveryDistributePannel extends Component {
  constructor(props){
    super(props);
    this.state = {
      page_size: 5,
    }
    this.showSignedModal = this.showSignedModal.bind(this);
    this.showUnSignedModal = this.showUnSignedModal.bind(this);
    this.checkOrderHandler = this.checkOrderHandler.bind(this);
    this.activeOrderHandler = this.activeOrderHandler.bind(this);
    this.viewOrderDetail = this.viewOrderDetail.bind(this);
    this.viewOrderOperationRecord = this.viewOrderOperationRecord.bind(this);
    this.showScanModal = this.showScanModal.bind(this);
    this.search = this.search.bind(this);
  }
  render(){
    var { filter, area, deliveryman, orders, main, all_order_srcs, all_pay_modes, signOrder, unsignOrder, 
      searchByScan, getOrderOptRecord, resetOrderOptRecord, operationRecord } = this.props;
    var { submitting } = main;
    var { loading, refresh, page_no, total, list, check_order_info, active_order_id } = orders;
    var { search, showSignedModal, showUnSignedModal, showScanModal, checkOrderHandler, 
      viewOrderDetail, activeOrderHandler, viewOrderOperationRecord } = this;

    var {scan, scan_list} = main; //扫描
    if(scan){
      list = scan_list;
    }
    var content = list.map((n, i) => {
      return <OrderRow 
        key={n.order_id} 
        {...{...n, active_order_id, showSignedModal, showUnSignedModal, 
          viewOrderDetail, checkOrderHandler, activeOrderHandler, viewOrderOperationRecord}}
      />;
    })
    return (
      <div className="order-manage">

        <TopHeader />
        <FilterHeader
          {...{...this.props, ...filter, ...area, showScanModal, all_deliveryman: deliveryman.list}}
          page_size={this.state.page_size}
        />

        <div className="panel">
          <header className="panel-heading">送货列表</header>
          <div className="panel-body">
            <div className="table-responsive main-list">
              <table className="table table-hover text-center">
                <thead>
                <tr>
                  <th><input onChange={this.checkAll.bind(this)} type="checkbox" /></th>
                  <th>管理操作</th>
                  <th>配送时间</th>
                  <th>货到付款金额</th>
                  <th>下单人</th>
                  <th>收货人信息</th>
                  <th>订单号</th>
                  <th>配送方式</th>
                  <th>备注</th>
                  <th>订单完成时间</th>
                  <th>订单状态</th>
                  <th>操作人</th>
                  <th>操作时间</th>
                </tr>
                </thead>
                <tbody>
                  { tableLoader( loading || refresh, content ) }
                </tbody>
              </table>
            </div>

            {
              scan
                ? null
                : <Pagination 
                    page_no={page_no} 
                    total_count={total} 
                    page_size={this.state.page_size} 
                    onPageChange={this.onPageChange.bind(this)}
                  />
            }
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

        <OrderDetailModal ref="detail_modal" data={check_order_info || {}} all_order_srcs={all_order_srcs.map} all_pay_modes={all_pay_modes} />
        <SignedModal ref="SignedModal" {...{submitting, signOrder, callback: search}} />
        <UnSignedModal ref="UnSignedModal" {...{submitting, unsignOrder, callback: search}} />
        <ScanModal ref="ScanModal" submitting={submitting} search={searchByScan}  />
        <OperationRecordModal ref="OperationRecordModal" {...{getOrderOptRecord, resetOrderOptRecord, ...operationRecord}} />
      </div>
    )
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
    var { getOrderDistributeList, orders } = this.props;
    page = typeof page == 'undefined' ? orders.page_no : page;
    getOrderDistributeList({page_no: page, page_size: this.state.page_size});
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
  showSignedModal(n){
    this.refs.SignedModal.show(n);
  }
  showUnSignedModal(n){
    this.refs.UnSignedModal.show(n);
  }
  showScanModal(){
    this.refs.ScanModal.show();
  }

}

function mapStateToProps({distributeManage}){
  return distributeManage;
}

/* 这里可以使用 bindActionCreators , 也可以直接写在 connect 的第二个参数里面（一个对象) */
function mapDispatchToProps(dispatch){
  return bindActionCreators({
    ...OrderActions,
    ...AreaActions(),
    ...OrderSupportActions,
    ...DeliverymanActions,
    ...DeliveryDistributeActions,
    getPayModes
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(DeliveryDistributePannel);

/***************   *******   *****************/
/***************   子模态框   *****************/
/***************   *******   *****************/

var SignedModal = React.createClass({
  getInitialState: function() {
    return {
      CASH: 'CASH', //现金赔偿
      REFUND: 'REFUND', //全额退款

      order: {},

      signin_date: dateFormat(new Date()),
      // signin_hour: '',  // 直接 TimeInput.val()获取
      late_minutes: 0,
      refund_method: '',
      refund_money: 0,
      refund_reson: '',
    };
  },
  mixins: [ LinkedStateMixin ],
  render: function(){
    var { signin_date, late_minutes, refund_method, refund_money, refund_reson} = this.state;
    return (
      <StdModal submitting={this.props.submitting} onConfirm={this.submitHandler} onCancel={this.hideCallback} title="订单完成页面" ref="modal">
        <div className="form-group mg-15 form-inline">
          <label>签收时间：</label>
          <DatePicker value={signin_date} onChange={this.onSignInDateChange} className="short-input" />
          {'　'}
          <TimeInput onChange={this.onTimeChange} onOK={this.onTimeOK} ref="timeinput" />
        </div>
        <div className="form-group form-inline mg-15">
          <div className="row">
            <div className="col-xs-6">
              <label>迟到时长：</label>
              <div className="inline-block input-group input-group-xs">
                <input value={late_minutes} onChange={this.onLateTimeChange} type="text" className="form-control" style={{'width': 50}} />
                <span className="input-group-addon">Min</span>
              </div>
            </div>
            <div className="col-xs-6">
              <label>货到付款金额：￥</label>
              <input value={this.state.order.total_amount / 100 || 0} readOnly className="form-control input-xs short-input" style={{'width': 50}} />
            </div>
          </div>
        </div>
        <div className="form-group mg-15">
          <label className="">
            <input value={this.state.CASH} onClick={this.checkMethod} checked={this.state.CASH == refund_method} type="radio" name="method" />
            {' 现金赔偿（迟到30mins以内）'}
          </label>
          {
            this.state.refund_method == this.state.CASH
            ? <div className="form-group form-inline">
                <div className="input-group input-group-xs pl-20">
                  <input valueLink={this.linkState('refund_money')} className="form-control input-xs" style={{'width': 50}} />
                  <span className="input-group-addon">RMB</span>
                </div>
              </div>
            : null
          }
        </div>
        <div className="form-group mg-15">
          <label className="">
            <input value={this.state.REFUND} onClick={this.checkMethod} checked={this.state.REFUND == refund_method} type="radio" name="method" />
            {' 全额退款（迟到时间>=30mins）'}
          </label>
          {
            this.state.refund_method == this.state.REFUND
            ? <div className="form-group pl-20">
                <RadioGroup 
                  value={refund_reson} 
                  vertical={true}
                  name="refund_reson"
                  radios={[
                    {value: '迟到30mins以上', text: '迟到30mins以上'}, 
                    {value: '款式不符', text: '款式不符'}, 
                    {value: '尺寸、规格不符', text: '尺寸、规格不符'}]}
                  onChange={this.checkReason}
                />
              </div>
            : null
          }
        </div>
      </StdModal>
    )
  },
  submitHandler(){
    var { order, CASH, late_minutes, refund_method, refund_money, refund_reson, signin_date } = this.state;
    var signin_hour = this.refs.timeinput.val();
    if(!form.isNumber(late_minutes) || late_minutes < 0){
      Noty('warning', '迟到时间输入有误');return;
    }
    if(!signin_date || !signin_hour){
      Noty('warning', '请填写签收时间');return;
    }
    if(late_minutes > 0){
      if(!refund_method){
        Noty('warning', '请选择赔偿方式');return;
      }
      if(refund_method == CASH){
        if(!form.isNumber(refund_money)){
          Noty('warning', '请输入现金赔偿金额');return;
        }
      }else{
        if(!refund_reson){
          Noty('warning', '请勾选全额退款原因');return;
        }
      }
    }
    this.props.signOrder(order.order_id, {
      late_minutes: late_minutes,
      payfor_type: refund_method,
      payfor_amount: refund_money,
      payfor_reason: refund_reson,
      signin_time: signin_date + ' ' + signin_hour
    }).done(function(){
      this.refs.modal.hide();
      this.props.callback();
      Noty('success', '签收成功！');
    }.bind(this))
    .fail(function(msg, code){
      Noty('error', msg || '提交失败')
    })
  },
  onSignInDateChange: function(value){
    this.setState({ signin_date: value })
  },
  onTimeChange: function(value){
    this.setState({signin_hour: value})
  },
  onTimeOK(signin_time){
    var { delivery_time } = this.state.order;
    try{
      delivery_time = (delivery_time.match(/\d{2}:\d{2}$/)[0]).split(':');
      signin_time = signin_time.split(':');
      let delivery_date = new Date(0);
      let signin_date = new Date(0);
      delivery_date.setHours(delivery_time[0]);
      delivery_date.setMinutes(delivery_time[1]);
      signin_date.setHours(signin_time[0]);
      signin_date.setMinutes(signin_time[1]);
      let late_minutes = ( signin_date - delivery_date ) / (1000*60);

      this.onLateTimeChange({target: {value: late_minutes}}); //模拟
    }catch(e){
      console.log(e);
    }
  },
  onLateTimeChange: function(e){
    var { value } = e.target;
    this.setState({ late_minutes: value, refund_money: value <=30 ? value : ''})
  },
  checkMethod: function(e){
    this.setState({ refund_method: e.target.value });
  },
  checkReason: function(value){
    this.setState({ refund_reson: value });
  },
  show: function(order){
    this.refs.modal.show();
    this.setState({order});
  },
  hideCallback: function(){
    this.refs.timeinput.reset();
    this.setState(this.getInitialState());
  },
});

var UnSignedModal = React.createClass({
  getInitialState: function() {
    return {
      NOTFOUND: 'NOTFOUND',
      OTHER: 'OTHER',

      order: {},

      reason_type: '',
      notfound_reason: '联系不上用户，无人签收',
      other_reason: '',
      real_pay: 0,
      black_list: '0',
    };
  },
  mixins: [ LinkedStateMixin ],
  render: function(){
    var { notfound_reason } = this.state;
    return (
      <StdModal submitting={this.props.submitting} onConfirm={this.submitHandler} onCancel={this.hideCallback} title="订单未完成页面" ref="modal">
        <div className=" mg-15">
          <label className="strong-label">未签收原因：</label>
          <div className="form-group form-inline">
            <label>
              <input value={this.state.NOTFOUND}
               checked={this.state.reason_type == this.state.NOTFOUND} 
               onClick={this.checkReason} type="radio" name="reason" />
              {' ' + notfound_reason}
            </label>
          </div>
          <div className="form-group form-inline">
            <label>
              <input value={this.state.OTHER} 
                checked={this.state.reason_type == this.state.OTHER} 
                onClick={this.checkReason} type="radio" name="reason" />
              {' 其他'}
            </label>
            {'　'}
            <input valueLink={this.linkState('other_reason')} className="form-control input-xs long-input" />
          </div>
        </div>
        <div className="form-inline mg-15">
          <div className="row">
            <div className="col-xs-6">
              <label>货到付款金额：￥</label>
              <input value={this.state.order.total_amount/100 || 0} readOnly className="form-control input-xs short-input" style={{'width': 50}} />
            </div>
            <div className="col-xs-6">
              <label>实收金额：</label>
              <input valueLink={this.linkState('real_pay')} className="form-control input-xs" style={{'width': 50}} />
            </div>
          </div>
        </div>
        <div className="form-group mg-15">
          <label className="strong-label">是否将该用户列入黑名单：</label>
          {'　'}
          <RadioGroup 
            value={this.state.black_list} 
            className="inline-block"
            radios={[{value: "1", text: '是'}, {value: "0", text: '否'}]}
            onChange={this.checkBlackList}
          />
          <p className="font-xs gray">（列入黑名单后，此用户ID下单无法再选择货到付款模式）</p>
        </div>
      </StdModal>
    )
  },
  submitHandler(){
    var { order, reason_type, OTHER, notfound_reason, other_reason, real_pay, black_list } = this.state;
    if(!reason_type){
      Noty('warning', '请选择未签收原因');return;
    }
    if( reason_type == OTHER && !other_reason.trim()){
      Noty('warning', '请填写其他未签收原因');return;
    }
    if( !form.isNumber( real_pay ) ){
      Noty('warning', '请填写正确的实收金额');return;
    }
    this.props.unsignOrder(order.order_id, {
      COD_amount: real_pay * 100,
      unsignin_reason: reason_type == OTHER ? other_reason : notfound_reason,
      is_blacklist: black_list,
    }).done(function(){
      this.refs.modal.hide();
      this.props.callback();
      Noty('success', '操作成功！');
    }.bind(this))
    .fail(function(msg, code){
      Noty('error', msg || '提交失败')
    })
  },
  checkReason: function(e){
    var reason_type = e.target.value;
    this.setState({ reason_type, other_reason: reason_type == this.state.NOTFOUND ? '' : this.state.other_reason });
  },
  checkBlackList: function(value){
    this.setState({ black_list: value });
  },
  show: function(order){
    this.refs.modal.show();
    this.setState({order});
  },
  hideCallback: function(){
    this.setState(this.getInitialState());
  },
})