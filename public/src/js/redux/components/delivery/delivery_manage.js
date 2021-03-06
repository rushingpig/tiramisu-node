/**
 * 送货单管理
 */
import React, {Component, PropTypes} from 'react';
import { render, findDOMNode } from 'react-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import LinkedStateMixin from 'react-addons-linked-state-mixin';
import { reduxForm } from 'redux-form';
import classNames from 'classnames';

import DatePicker from 'common/datepicker';
import Select from 'common/select';
import Pagination from 'common/pagination';
import StdModal from 'common/std_modal';
import LineRouter from 'common/line_router';
import { tableLoader } from 'common/loading';
import SearchInput from 'common/search_input';
import RecipientInfo from 'common/recipient_info';
import ToolTip from 'common/tooltip';
import AddressSelector from 'common/address_selector';

import { order_status, YES_OR_NO, DELIVERY_MAP, PRINT_STATUS } from 'config/app.config';
import history from 'history_instance';
import LazyLoad from 'utils/lazy_load';
import { Noty, map, reactReplace, form, parseTime, dateFormat, dom } from 'utils/index';
import V from 'utils/acl';

import * as OrderActions from 'actions/orders';
import AreaActions from 'actions/area';
import DeliverymanActions from 'actions/deliveryman';
import * as DeliveryManageActions from 'actions/delivery_manage';
import * as OrderSupportActions from 'actions/order_support';
import { triggerFormUpdate } from 'actions/form';
import { getStationListByScopeSignal, resetStationListWhenScopeChange } from 'actions/station_manage';

import OrderProductsDetail from 'common/order_products_detail';
import OrderDetailModal from './order_detail_modal';
import ScanModal from 'common/scan_modal';
import OperationRecordModal from 'common/operation_record_modal.js';
import { DeliverymanActionTypes2 } from 'actions/action_types';

const TopHeader = () => (
  <div className="clearfix top-header">
    <LineRouter 
      routes={[{name: '送货单管理', link: '/dm/change'}, {name: '送货单列表', link: ''}]} />
  </div>
)

class FilterHeader extends Component {
  constructor(props){
    super(props);
    this.state = {
      search_ing: false,
      search_by_keywords_ing: false,
      all_print_status: YES_OR_NO,
      delivery_types: map(DELIVERY_MAP, (text, id) => ({id, text})),
    };
    this.AddressSelectorHook = this.AddressSelectorHook.bind(this);
  }
  render(){
    var { 
      fields: {
        keywords,
        begin_time,
        end_time,
        delivery_type,
        print_status,
        is_greeting_card,
        province_id,
        city_id,
        district_id,
        delivery_id
      },
      provinces,
      cities,
      districts,
      stations: { station_list },
      change_submitting,
    } = this.props;
    var { search_ing, search_by_keywords_ing, delivery_types, all_print_status } = this.state;
    return (
      <div className="panel search">
        <div className="panel-body">
          <div className="form-group form-inline">
            <SearchInput {...keywords} searchHandler={this.search.bind(this, 'search_by_keywords_ing')} searching={search_by_keywords_ing} className="form-inline v-mg" placeholder="关键字" />
            {' 开始时间'}
            <DatePicker editable redux-form={begin_time} className="short-input" />
            {' 结束时间'}
            <DatePicker editable redux-form={end_time} className="short-input space-right" />
            <Select {...delivery_type} options={delivery_types} default-text="选择配送方式" className="space-right"/>
            <Select {...print_status} options={all_print_status} default-text="是否打印" className="space-right"/>
            <Select {...is_greeting_card} options={YES_OR_NO} default-text="是否有祝福贺卡" className="space-right"/>
            { 
              V( 'DeliveryManageDeliveryAddressFilter' )
              ? <AddressSelector
                  {...{ province_id, city_id, district_id, provinces, cities, districts, actions: this.props,
                    AddressSelectorHook: this.AddressSelectorHook, form: 'order_delivery_filter' }}
                />
              : null
            }
            {
              V( 'DeliveryManageDeliveryStationFilter' )
                ? <Select {...delivery_id} options={station_list} default-text="选择配送中心" className="space-right"/>
                : null
            }
            <button disabled={search_ing} data-submitting={search_ing} onClick={this.search.bind(this, 'search_ing')} className="btn btn-theme btn-xs">
              <i className="fa fa-search"></i>{' 搜索'}
            </button>
          </div>
          <div className="form-group form-inline">
            {
              V('DeliveryManageDeliveryBatchPrint') && 
              <button onClick={this.printHandler.bind(this)} className="btn btn-theme space-right btn-xs">批量打印</button>
            }
            {
              V('DeliveryManageDeliveryScan') &&
              <button onClick={this.onScanHandler.bind(this)} className="btn btn-theme btn-xs space-right">扫描</button>
            }
            {
              V('DeliveryManageDeliveryBatchAllocateDeliveryman') &&
              <button onClick={this.batchEdit.bind(this)} className="btn btn-theme btn-xs">批量编辑配送员</button>
            }
          </div>
        </div>
      </div>
    )
  }
  componentDidMount(){
    setTimeout(function(){
      var { getProvincesSignal, getStationListByScopeSignal } = this.props;
      getProvincesSignal();
      getStationListByScopeSignal();
      LazyLoad('noty');
    }.bind(this),0)
  }
  AddressSelectorHook(e, data){
    this.props.resetStationListWhenScopeChange('order_delivery_filter');
    this.props.getStationListByScopeSignal({ ...data });
  }
  search(search_in_state){
    this.setState({[search_in_state]: true});
    this.props.triggerFormUpdate('order_delivery_filter', 'order_ids', ''); //清空扫描列表
    this.props.getOrderDeliveryList({page_no: 0, page_size: this.props.page_size})
      .always(()=>{
        this.setState({[search_in_state]: false});
      });
  }
  printHandler(){
    this.props.showBatchPrintModal();
  }
  batchEdit(){
    this.props.showBatchEditModal();
  }
  onScanHandler(){
    this.props.showScanModal();
  }
}
FilterHeader.propTypess = {
  showBatchPrintModal: PropTypes.func.isRequired,
  showBatchEditModal: PropTypes.func.isRequired,
  provinces: PropTypes.array.isRequired,
  cities: PropTypes.array.isRequired,
}
FilterHeader = reduxForm({
  form: 'order_delivery_filter',
  fields: [
    'keywords',
    'begin_time',
    'end_time',
    'delivery_type',
    'print_status',
    'is_greeting_card',
    'province_id',
    'city_id',
    'district_id',
    'delivery_id',

    'order_ids' //扫描结果
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
  constructor(props){
    super(props);
    this.state = {
      greeting_card_focus: false,
    }
  }
  render(){
    var { props } = this;
    var delivery_time = props.delivery_time && props.delivery_time.split(' ');
    var _order_status = order_status[props.status] || {};
    return (
      <tr onClick={this.clickHandler.bind(this)} className={props.active_order_id == props.order_id ? 'active' : ''}>
        <td>
          <input onChange={this.checkOrderHandler.bind(this)} checked={props.checked} type="checkbox" />
        </td>
        <td>
          {
            V('DeliveryManageDeliveryAllocateDeliveryman') && props.print_status != 'PRINTABLE'
              ? [<a onClick={this.showEditModal.bind(this)} key="edit" href="javascript:;" className="nowrap">[编辑配送员]</a>, <br key="br" />]
              : null
          }
          {
            V('DeliveryManageDeliveryPrint') && (
              props.print_status == 'AUDITING'
                ? <span key="auditing">[正在审核]</span>
                : <a onClick={this.printHandler.bind(this)} key="print" href="javascript:;" className="nowrap">
                    {
                      props.print_status == 'PRINTABLE'
                        ? <span key="printable">[打印]</span>
                        : 

                          ( props.print_status == 'UNPRINTABLE'
                                ? 
                                  V( 'DeliveryManageUnprintable' )
                                    ?<span key="unprintable">[申请打印]</span>
                                    :null
                                : 
                                  V('DeliveryManageReprintable')
                                    ?<span key="reprintable">[重新打印]</span>
                                    :null
                          )
                        
                    }
                  </a>
            )
          }
        </td>
        <td>
          <div className={'round inline-block ' + (PRINT_STATUS[props.print_status] == '是' ? 'alert-success' : 'alert-danger') + ' white'} style={{width: 20}}>
            { PRINT_STATUS[props.print_status] }
          </div>
        </td>
        <td>{props.deliveryman_name}<br />{props.deliveryman_mobile}</td>
        <td>{delivery_time ? <div className="time">{delivery_time[0]}<br/>{delivery_time[1]}</div> : null}</td>
        <td>{props.owner_name}<br />{props.owner_mobile}</td>
        <RecipientInfo data={props} />
        <td className="text-left">
        {
          this.state.greeting_card_focus
          ? <input key="greetingCardInput" ref="greetingCardInput" value={reactReplace(props.greeting_card, '|', ' ')} onBlur={this.setGreetingCardStatus.bind(this, false)} />
          : <div key="greetingCard" ref="greetingCard" onClick={this.setGreetingCardStatus.bind(this, true)}>{reactReplace(props.greeting_card, '|', <br key="br" />)}</div>
        }
        </td>
        <td>{props.exchange_time}</td>
        <td>
          <div 
            className="bordered bold order-status"
            style={{color: _order_status.color || 'inherit', background: _order_status.bg }}
            onMouseEnter={() => props.status == 'DELIVERY' && this.refs.tooltip_delivery.show()}
            onMouseLeave={() => props.status == 'DELIVERY' && this.refs.tooltip_delivery.hide()}
            >
            <span key="_order_status">{_order_status.value}</span>
            {
              props.status == 'DELIVERY'
                ? (
                    <ToolTip key="tooltip" ref="tooltip_delivery" >
                      <div className="nowrap">
                        配送员：{props.deliveryman_name}　{props.deliveryman_mobile}
                      </div>
                    </ToolTip>
                  )
                : null
            }
          </div>
        </td>
        <td><a onClick={props.viewOrderDetail} href="javascript:;">{props.order_id}</a></td>
        <td>{props.remarks}</td>
        <td>{props.updated_by}</td>
        <td><a onClick={this.viewOrderOperationRecord.bind(this)} className="inline-block time" href="javascript:;">{props.updated_time}</a></td>
      </tr>
    )
  }
  showEditModal(e){
    this.props.showEditModal(this.props);
    e.stopPropagation();
  }
  printHandler(e){
    this.props.printHandler(this.props);
    e.stopPropagation();
  }
  checkOrderHandler(e){
    var { order_id, checkOrderHandler } = this.props;
    checkOrderHandler(order_id, e.target.checked);
    // e.stopPropagation();
  }
  clickHandler(){
    this.props.activeOrderHandler(this.props.order_id);
  }
  viewOrderOperationRecord(e){
    this.props.viewOrderOperationRecord(this.props);
    e.stopPropagation();
  }
  setGreetingCardStatus(status){
    this.setState({ greeting_card_focus: status });
    if(status){
      setTimeout(function(){
        this.refs.greetingCardInput.select();
      }.bind(this), 100);
    }
  }
}

class DeliveryManagePannel extends Component {
  constructor(props){
    super(props);
    this.state = {
      page_size: 8,
      batch_edit: false,
    }
    this.showEditModal = this.showEditModal.bind(this);
    this.showBatchEditModal = this.showBatchEditModal.bind(this);
    this.showBatchPrintModal = this.showBatchPrintModal.bind(this);
    this.checkOrderHandler = this.checkOrderHandler.bind(this);
    this.activeOrderHandler = this.activeOrderHandler.bind(this);
    this.viewOrderDetail = this.viewOrderDetail.bind(this);
    this.viewOrderOperationRecord = this.viewOrderOperationRecord.bind(this);
    this.printHandler = this.printHandler.bind(this);
    this.search = this.search.bind(this);
    this.refreshDataList = this.refreshDataList.bind(this);
    this.showScanModal = this.showScanModal.bind(this);
  }
  render(){
    var { filter, area, main, all_order_srcs, all_pay_modes, deliveryman,
      applyDeliveryman, startPrint, applyPrint, validatePrintCode, rePrint, searchByScan,
      getAllDeliveryman, getDeliverymanByOrder, resetDeliveryman,
      getOrderOptRecord, resetOrderOptRecord, operationRecord, dispatch } = this.props;
    var { loading, refresh, page_no, checkall, total, list, checked_orders, check_order_info, 
      active_order_id, get_products_detail_ing } = this.props.orders;
    var { showBatchPrintModal, printHandler, showEditModal, showScanModal, showBatchEditModal,
       checkOrderHandler, viewOrderDetail, activeOrderHandler, viewOrderOperationRecord, refreshDataList } = this;

    var {scan } = main; //扫描

    var content = list.map((n, i) => {
      return <OrderRow 
        key={n.order_id} 
        {...{...n, active_order_id, showEditModal, printHandler, 
          checkOrderHandler, viewOrderDetail, activeOrderHandler, viewOrderOperationRecord}} 
      />;
    })
    return (
      <div className="order-manage">

        <TopHeader />
        <FilterHeader 
          {...{...this.props, ...filter, ...area, showScanModal, showBatchPrintModal, showBatchEditModal}} 
          page_size={this.state.page_size}
        />

        <div className="panel">
          <header className="panel-heading">送货列表</header>
          <div className="panel-body">
            <div ref="table-container" className="table-responsive main-list">
              <table className="table table-hover text-center">
                <thead>
                <tr>
                  <th><input checked={checkall} onChange={this.checkAll.bind(this)} type="checkbox" /></th>
                  <th>管理操作</th>
                  <th>是否打印</th>
                  <th>配送员</th>
                  <th>配送时间</th>
                  <th>下单人</th>
                  <th>收货人信息</th>
                  <th>祝福贺卡</th>
                  <th>转单时间</th>
                  <th>订单状态</th>
                  <th>订单号</th>
                  <th>备注</th>
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
                <OrderProductsDetail loading={get_products_detail_ing} products={check_order_info.products} />
              </div>
            </div>
          : null }
        <EditModal ref="EditModal" 
          {...{getAllDeliveryman, getDeliverymanByOrder, applyDeliveryman, resetDeliveryman}}
          submitting = {main.submitting}
          deliveryman = {deliveryman}
          callback={refreshDataList} />
        <OrderDetailModal ref="detail_modal" data={check_order_info || {}} all_order_srcs={all_order_srcs.map} all_pay_modes={all_pay_modes} />
        <PrintModal ref="PrintModal" {...{checked_orders, startPrint, callback: refreshDataList}} />
        <ApplyPrintModal ref="ApplyPrintModal" {...{applyPrint, submitting: main.submitting}} callback={refreshDataList} />
        <RePrintModal ref="RePrintModal" {...{validatePrintCode, rePrint, submitting: main.submitting}} callback={refreshDataList} />
        <ScanModal ref="ScanModal" submitting={main.submitting} search={searchByScan} />
        <OperationRecordModal ref="OperationRecordModal" {...{getOrderOptRecord, resetOrderOptRecord, ...operationRecord}} />
      </div>
    )
  }
  showEditModal(n){
    this.refs.EditModal.show([n]);
  }
  showBatchEditModal(){
    var { checked_orders } = this.props.orders;
    if(checked_orders.length){
      this.refs.EditModal.show(checked_orders);
    }else{
      Noty('warning', '请先勾选订单！');
    }
  }
  showBatchPrintModal(n){
    var { checked_orders } = this.props.orders;
    if(checked_orders.length){
      this.refs.PrintModal.show();
    }else{
      Noty('warning', '请先勾选订单！');
    }
  }
  printHandler({ print_status, order_id }){
    if(print_status == 'PRINTABLE'){
      this.props.startPrint([order_id])
        .done(() => {
          this.search(); //重新请求，刷新数据
        })
        .fail(function(msg){
          Noty('error', msg || '打印出错，请稍后再试');
        })
    }else if(print_status == 'UNPRINTABLE'){
      this.refs.ApplyPrintModal.show(order_id);
    }else if(print_status == 'REPRINTABLE'){
      this.refs.RePrintModal.show(order_id); //再次打印，输入验证码
    }
  }
  showScanModal(){
    this.refs.ScanModal.show();
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
  onPageChange(page){
    var unlock = dom.lock(this.refs['table-container']);
    this.search(page).done(unlock);
  }
  componentDidMount() {
    this.search();

    LazyLoad('noty');
    LazyLoad('chinese_py');

    var { getOrderSrcs, getPayModes } = this.props;
    getOrderSrcs();
    getPayModes();
  }
  search(page){
    page = typeof page == 'undefined' ? this.props.orders.page_no : page;
    return this.props.getOrderDeliveryList({page_no: page, page_size: this.state.page_size});
  }
  refreshDataList(){
    //更新数据，需要loading图
    this.props.refreshDataList();
    this.search();
  }
}

/***************   *******   *****************/
/***************   子模态框   *****************/
/***************   *******   *****************/

var PrintModal = React.createClass({
  getInitialState: function() {
    return {
      submitting: false 
    };
  },
  render: function(){
    var { checked_orders } = this.props;
    return (
      <StdModal ref="modal" title="批量打印订单" submitting={this.state.submitting} onConfirm={this.printHandler}>
        <center>
          <h5>
            您已同时勾选
            <span className="strong font-lg">{' ' + checked_orders.length + ' '}</span>
            个订单
          </h5>
        </center>
        <center><h5>进行打印</h5></center>
      </StdModal>
    )
  },
  printHandler: function(){
    var { checked_orders } = this.props;
    if(checked_orders.some(n => n.print_status != 'PRINTABLE')){
      Noty('warning', '请确定所有订单均可直接打印!');
      return;
    }
    this.setState({submitting: true});
    this.props.startPrint(this.props.checked_orders.map(n => n.order_id))
      .done(function(){
        Noty('success', '操作成功');
        this.setState({submitting: false});
        this.refs.modal.hide();
        this.props.callback();
      }.bind(this))
      .fail(function(e){
        Noty('error', e || '出错了，请稍后再试');
      })
  },
  show: function(){
    this.refs.modal.show();
  },
  hide: function(){
    this.refs.modal.hide();
  },
});

var EditModal = React.createClass({
  propTypes: {
    'deliveryman': PropTypes.object.isRequired,
    'getAllDeliveryman': PropTypes.func.isRequired,
    'getDeliverymanByOrder': PropTypes.func.isRequired,
    'applyDeliveryman': PropTypes.func.isRequired,
  },
  getInitialState: function() {
    return {
      all_deliveryman: [],
      filter_results: [],
      search_txt: '',
      selected_deliveryman_id: undefined,
      orders: [],
     // _hasInitials: false,  //选择配送员后提交时，重置selected_deliveryman_id的值导致的显示问题，此处控制其显示
    };
  },
  componentWillReceiveProps: function(nextProps){
    var {deliveryman } = nextProps;
    //只需要初始化一次的（根据订单号来获取配送员后，此限制去掉 20160727 xiaohong）
    if(deliveryman.load_success && this.props.deliveryman != deliveryman){
      var { list } = deliveryman;
      var build = function(){
        var new_data = list.map(function(n){
          n.py = window.makePy(n.deliveryman_name);
          return n;
        })
        this.setState({
          all_deliveryman: list, filter_results: new_data, 
          selected_deliveryman_id: list.length && list[0].deliveryman_id  //只初始化一次, 提交后不再设置
        })
      }.bind(this);

      if(window.makePy){
        build();
      }else{
        //异步加载的chinese_py库可能还未加载完成，所以需要定时检测
        this._build_timer = setInterval(() => {
          if(window.makePy){
            build();
            clearInterval(this._build_timer);
            delete this._build_timer;
          }
        }, 100);
      }
    }
  },
  translate(){

  },
  render: function(){
    var { filter_results, search_txt, selected_deliveryman_id, orders } = this.state;
    var { batch_edit, submitting } = this.props;
    var content = filter_results.map( n => {
      return <option key={n.deliveryman_id} value={n.deliveryman_id}>{n.deliveryman_name + ' ' + n.deliveryman_mobile}</option>
    });
    return (
      <StdModal onConfirm={this.saveHandler} onCancel={this.hideCallback} submitting={submitting} ref="modal" title="编辑配送人员">
        <div className="form-group form-inline mg-15" style={{marginTop: 15}}>
          <div className="input-group input-group-sm" style={{marginLeft: 168}}>
            <span className="input-group-addon"><i className="fa fa-search"></i></span>
            <input value={search_txt} onChange={this.filterHandler} type="text" 
              className="form-control" style={{'width': '200'}} placeholder="配送员拼音首字母 或 手机号码" />
          </div>
        </div>
        <div className="form-inline mg-15" style={{'padding': '14px 0'}}>
          {
            orders.length > 1
            ? <center>
                <h5 style={{'marginTop': 0}}>
                  您已同时勾选
                  <span className="strong font-lg">{' ' + orders.length + ' '}</span>
                  个订单
                </h5>
                <h5 style={{'marginBottom': 30}}>来编辑配送人员</h5>
              </center>
            : null
          }
          <div style={{marginLeft: 168}}>
            <label>{'配送人员　'}</label>
            <select onChange={this.onSelectDeliveryman} value={selected_deliveryman_id} className="form-control input-sm" style={{'minWidth': '145px'}}>
              {
                content.length
                ? content
                : <option>无</option>
              }
            </select>
          </div>
        </div>
      </StdModal>
    )
  },
  filterHandler: function(e){
    var { value } = e.target;
    var { all_deliveryman } = this.state;
    var results = [];
    value = value.toUpperCase();
    if(value === ''){
      results = all_deliveryman;
    }else if(/^\d+$/i.test(value)){ //电话号码
      results = all_deliveryman.filter(n => n.deliveryman_mobile.indexOf(value) != -1)
    }else if(/^\w+$/i.test(value)){ //首字母
      results = all_deliveryman.filter(n => {
        return n.py.some(m => m.toUpperCase().indexOf(value) == 0)
      })
    }else{ //中文全称
      results = all_deliveryman.filter(n => n.deliveryman_name.indexOf(value) != -1)
    }
    this.setState({ filter_results: results, search_txt: e.target.value, selected_deliveryman_id: results.length && results[0].deliveryman_id });
  },
  onSelectDeliveryman: function(e){
    this.setState({ selected_deliveryman_id: e.target.value});
  },
  saveHandler: function(){
    var { selected_deliveryman_id, orders } = this.state;
    var selected_deliveryman = this.state.filter_results.filter(n => n.deliveryman_id == selected_deliveryman_id);
    if(selected_deliveryman_id == 0){
        Noty('warning', '请选择配送员'); return;        
    }
    this.props.applyDeliveryman({
      deliveryman_id: selected_deliveryman_id,
      deliveryman_name: selected_deliveryman.length && selected_deliveryman[0].deliveryman_name,
      deliveryman_mobile: selected_deliveryman.length && selected_deliveryman[0].deliveryman_mobile,
      order_ids: orders.map(n => n.order_id)
    }).done(function(json){
      Noty('success', '操作成功！');
      this.refs.modal.hide();
      this.props.callback();
    }.bind(this)).fail(function(msg){
      Noty('error', msg || '操作失败！');
    })
  },
  componentDidMount: function(){
    //稍微延时一下，
  },
  show: function(orders){
    this.setState({orders})
    if(orders.length > 1){
      setTimeout(() => {
        this.props.getAllDeliveryman();
      }, 200);
    }else if(orders.length == 1){
      var order_id = orders[0].order_id;
      setTimeout(() => {
        this.props.getDeliverymanByOrder(order_id);
      }, 200);
    }    
    this.refs.modal.show();
  },
  hideCallback: function(){
    this.props.resetDeliveryman();
    this.setState({
      filter_results: this.state.all_deliveryman,
      search_txt: '',
      selected_deliveryman_id: undefined,
      orders: [],
    });
  },
});

var ApplyPrintModal = React.createClass({
  propTypes: {
    applyPrint: PropTypes.func.isRequired,
  },
  getInitialState: function() {
    return {
      order_id: '',
      reason: '',
      applicant_mobile: '',
      director_mobile: '',

      applicant_mobile_error: false,
      director_mobile_error: false
    };
  },
  mixins: [LinkedStateMixin],
  render: function(){
    return (
      <StdModal onConfirm={this.saveHandler} onCancel={this.hideCallback} submitting={this.props.submitting} ref="modal" size="sm" title="重新申请打印">
        <div className="pl-50">
          <div className="form-group form-inline">
            <label>{'　订单编号：'}</label>
            <span>{` ${this.state.order_id}`}</span>
          </div>
          <div className="form-group form-inline">
            <label>{'　申请理由：'}</label>
            <textarea valueLink={this.linkState('reason')} placeholder="必填" cols="18" rows="2" className="form-control input-xs"></textarea>
          </div>
          <div className={classNames('form-group form-inline ', {'has-error': this.state.applicant_mobile_error})}>
            <label>{'申请人手机：'}</label>
            <input valueLink={this.linkState('applicant_mobile')} onFocus={this.hideApplicantMobileError} placeholder="必填" type="text" className="form-control input-xs" />
          </div>
          <div className={classNames('form-group form-inline ', {'has-error': this.state.director_mobile_error})}>
            <label>{'　主管手机：'}</label>
            <input valueLink={this.linkState('director_mobile')} onFocus={this.hideDirectorMobileError} placeholder="必填" type="text" className="form-control input-xs" />
          </div>
        </div>
      </StdModal>
    )
  },
  saveHandler: function(){
    var { reason, applicant_mobile, director_mobile } = this.state;
    if(!reason){
      Noty('warning', '请填写申请理由！');return;
    }else if(!form.isMobile(applicant_mobile)){
      this.setState({applicant_mobile_error: true});
      Noty('warning', '申请人手机错误！');return;
    }else if(!form.isMobile(director_mobile)){
      this.setState({director_mobile_error: true});
      Noty('warning', '主管手机错误！');return;
    }
    this.props.applyPrint({reason, applicant_mobile, director_mobile, order_id: this.state.order_id})
      .done(function(){
        this.refs.modal.hide();
        this.props.callback();
      }.bind(this))
      .fail(function(msg, code){
        Noty('error', msg || '网络繁忙，请稍后再试')
      })
  },
  hideApplicantMobileError: function(){
    this.setState({ applicant_mobile_error: false });
  },
  hideDirectorMobileError: function(){
    this.setState({ director_mobile_error: false })
  },
  show: function(order_id){
    this.setState({order_id}, function(){
      this.refs.modal.show();
    });
  },
  hideCallback: function(){
    // this.setState(this.getInitialState());
  },
})

//再次打印，输入验证码的弹窗
var RePrintModal = React.createClass({
  propTypes: {
    rePrint: PropTypes.func.isRequired,
  },
  getInitialState: function() {
    return {
      order_id: '',
      validate_code: ''
    };
  },
  render: function(){
    return (
      <div>
        <StdModal onConfirm={this.saveHandler} onCancel={this.hideCallback} submitting={this.props.submitting} ref="modal" size="sm" title="打印">
          <div className="pl-50">
            <div className="form-group form-inline">
              <label>{'订单编号：'}</label>
              <span>{` ${this.state.order_id}`}</span>
            </div>
            <div className="form-group form-inline">
              <label>{'　验证码：'}</label>
              <input valueLink={this.linkState('validate_code')} type="text" className="form-control input-xs" />
            </div>
          </div>
        </StdModal>
        <StdModal ref="tipsModal" onConfirm={this.hideTipsModal} title="提示">
          <div style={{maxHeight: 500, overflow: 'auto'}}>
            <div className="form-group text-warning">
              当前检测到，打印页面已被拦截，请按如下操作方式执行打印：
            </div>
            <div className="form-group">
              <div><label>第1步</label></div>
              <center><img style={{width: '80%'}} src="/images/print_tips_1.png" alt=""/></center>
            </div>
            <hr />
            <div className="form-group">
              <div><label>第2步</label></div>
              <center><img style={{width: '80%'}}  src="/images/print_tips_2.png" alt=""/></center>
            </div>
            <hr />
            <div className="form-group">
              <div><label>第3步</label></div>
              <center><img style={{width: '80%'}}  src="/images/print_tips_3.png" alt=""/></center>
            </div>
            <hr />
            <div className="form-group">
              <div><label>第4步</label></div>
              {'　　　　重新打印'}
            </div>
          </div>
        </StdModal>
      </div>
    )
  },
  saveHandler: function(){
    var { order_id } = this.state;
    this.props.validatePrintCode(order_id, this.state.validate_code)
      .done(function(){
        this.props.rePrint(order_id)
          .done(function(){
            this.refs.modal.hide();
            setTimeout(this.props.callback, 1000);
          }.bind(this))
          .fail(function(){
            this.refs.modal.hide();
            this.refs.tipsModal.show();
          }.bind(this))
      }.bind(this))
      .fail(function(msg){
        Noty('error', msg || '网络繁忙，请稍后再试')
      })
  },
  mixins: [LinkedStateMixin],
  show: function(order_id){
    this.setState({order_id}, function(){
      this.refs.modal.show();
    })
  },
  hideCallback: function(){
    this.setState(this.getInitialState());
  },
  hideTipsModal: function(){
    this.refs.tipsModal.hide();
  }
});


export default connect(
  ({deliveryManage}) => deliveryManage,
  dispatch =>  bindActionCreators({
    ...OrderActions,
    ...AreaActions(),
    ...OrderSupportActions,
    ...DeliverymanActions(),
    ...DeliveryManageActions,
    triggerFormUpdate,
    getStationListByScopeSignal,
    resetStationListWhenScopeChange
  }, dispatch)
)(DeliveryManagePannel);