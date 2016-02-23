import React, {Component, PropTypes} from 'react';
import { render, findDOMNode } from 'react-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import LinkedStateMixin from 'react-addons-linked-state-mixin';
import { reduxForm } from 'redux-form';

import DatePicker from 'common/datepicker';
import Select from 'common/select';
import Pagination from 'common/pagination';
import StdModal from 'common/std_modal';
import LineRouter from 'common/line_router';
import { tableLoader } from 'common/loading';
import RecipientInfo from 'common/recipient_info';

import { order_status, YES_OR_NO, DELIVERY_MAP, PRINT_STATUS } from 'config/app.config';
import history from 'history_instance';
import LazyLoad from 'utils/lazy_load';
import { Noty, map, reactReplace, form, parseTime, dateFormat } from 'utils/index';

import * as OrderActions from 'actions/orders';
import AreaActions from 'actions/area';
import * as DeliverymanActions from 'actions/deliveryman';
import * as DeliveryManageActions from 'actions/delivery_manage';

import OrderProductsDetail from 'common/order_products_detail';
import OrderDetailModal from 'common/order_detail_modal';
import ScanModal from 'common/scan_modal';
import OperationRecordModal from 'common/operation_record_modal.js';

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
  constructor(props){
    super(props);
    this.state = {
      search_ing: false,
      all_print_status: YES_OR_NO,
      delivery_types: map(DELIVERY_MAP, (text, id) => ({id, text})),
    }
  }
  render(){
    var { 
      fields: {
        keywords,
        begin_time,
        end_time,
        delivery_type,
        print_status,
        province_id,
        city_id,
      },
      provinces,
      cities,
      delivery_stations,
      change_submitting,
    } = this.props;
    var { search_ing, delivery_types, all_print_status } = this.state;
    return (
      <div className="panel search">
        <div className="panel-body">
          <div className="form-group form-inline">
            <input {...keywords} className="form-control input-xs v-mg" placeholder="关键字" />
            {' 开始时间'}
            <DatePicker editable redux-form={begin_time} className="short-input" />
            {' 配送时间'}
            <DatePicker editable redux-form={end_time} className="short-input space-right" />
            <Select {...delivery_type} options={delivery_types} default-text="选择配送方式" className="space-right"/>
            <Select {...print_status} options={all_print_status} default-text="是否打印" className="space-right"/>
            <Select default-text="是否有祝福贺卡" className="space-right"/>
            <Select {...province_id} onChange={this.onProvinceChange.bind(this, province_id.onChange)} options={provinces} ref="province" default-text="选择省份" className="space-right"/>
            <Select {...city_id} options={cities} default-text="选择城市" ref="city" className="space-right"/>
            <button disabled={search_ing} data-submitting={search_ing} onClick={this.search.bind(this)} className="btn btn-theme btn-xs">
            <i className="fa fa-search" style={{'padding': '0 3px'}}></i>
          </button>
          </div>
          <div className="form-group form-inline">
            <button onClick={this.printHandler.bind(this)} className="btn btn-theme space-right btn-xs">批量打印</button>
            <button onClick={this.onScanHandler.bind(this)} className="btn btn-theme btn-xs space-right">扫描</button>
            <button onClick={this.batchEdit.bind(this)} className="btn btn-theme btn-xs">批量编辑配送员</button>
          </div>
        </div>
      </div>
    )
  }
  componentDidMount(){
    setTimeout(function(){
      var { getProvinces } = this.props;
      getProvinces();
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
    this.props.getOrderDeliveryList({page_no: 0, page_size: this.props.page_size})
      .always(()=>{
        this.setState({search_ing: false});
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
FilterHeader.propTypes = {
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
    'province_id',
    'city_id',
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
    var delivery_time = props.delivery_time.split(' ');
    var _order_status = order_status[props.status] || {};
    return (
      <tr onClick={this.clickHandler.bind(this)} className={props.active_order_id == props.order_id ? 'active' : ''}>
        <td>
          <input onChange={this.checkOrderHandler.bind(this)} checked={props.checked} type="checkbox" />
        </td>
        <td>
          <a onClick={this.showEditModal.bind(this)} href="javascript:;" className="nowrap">[编辑配送员]</a><br/>
          {
            props.print_status == 'AUDITING'
              ? '[正在审核]'
              : <a onClick={this.printHandler.bind(this)} href="javascript:;">
                  {props.print_status == 'REPRINTABLE' ? '[重新打印]' : '[打印]'}
                </a>
          }
        </td>
        <td>{PRINT_STATUS[props.print_status]}</td>
        <td>{props.deliveryman_name}<br />{props.deliveryman_mobile}</td>
        <td><div className="time">{delivery_time[0]}<br/>{delivery_time[1]}</div></td>
        <td>{props.owner_name}<br />{props.owner_mobile}</td>
        <RecipientInfo data={props} />
        <td className="text-left">{reactReplace(props.greeting_card, '|', <br />)}</td>
        <td>{props.exchange_time}</td>
        <td><div className="order-status" style={{color: _order_status.color}}>{_order_status.value}</div></td>
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
}

class DeliveryManagePannel extends Component {
  constructor(props){
    super(props);
    this.state = {
      page_size: 5,
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
    this.showScanModal = this.showScanModal.bind(this);
  }
  render(){
    var { filter, area, deliveryman, main, getAllDeliveryman, applyDeliveryman, startPrint, applyPrint, validatePrintCode, rePrint, searchByScan,
    getOrderOptRecord, resetOrderOptRecord, operationRecord } = this.props;
    var { loading, page_no, total, list, checked_orders, check_order_info, active_order_id } = this.props.orders;
    var { showBatchPrintModal, printHandler, showEditModal, showScanModal, showBatchEditModal,
       checkOrderHandler, viewOrderDetail, activeOrderHandler, viewOrderOperationRecord } = this;

    var {scan, scan_list} = main; //扫描
    if(scan){
      list = scan_list;
    }
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
            <div className="table-responsive">
              <table className="table table-hover text-center">
                <thead>
                <tr>
                  <th><input onChange={this.checkAll.bind(this)} type="checkbox" /></th>
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
                  <th>操作人</th>
                  <th>操作时间</th>
                </tr>
                </thead>
                <tbody>
                  { tableLoader( loading, content ) }
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
                    onPageChange={this.onPageChange}
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

        <EditModal ref="EditModal" {...{getAllDeliveryman, applyDeliveryman, deliveryman, submitting: main.submitting }} callback={this.search} />
        <OrderDetailModal ref="detail_modal" data={check_order_info || {}} />
        <PrintModal ref="PrintModal" {...{checked_orders, startPrint, callback: this.search}} />
        <ApplyPrintModal ref="ApplyPrintModal" {...{applyPrint, submitting: main.submitting}} callback={this.search} />
        <RePrintModal ref="RePrintModal" {...{validatePrintCode, rePrint, submitting: main.submitting}} callback={this.search} />
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
        .done(function(){
          this.search(); //重新请求，刷新数据
        })
        .fail(function(){
          Noty('error', '异常错误');
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
    this.search(page);
  }
  componentDidMount() {
    this.search();

    LazyLoad('noty');
    LazyLoad('chinese_py');
  }
  search(page){
    page = typeof page == 'undefined' ? this.props.orders.page_no : page;
    this.props.getOrderDeliveryList({page_no: page, page_size: this.state.page_size});
  }
}

function mapStateToProps({deliveryManage}){
  return deliveryManage;
}

/* 这里可以使用 bindActionCreators , 也可以直接写在 connect 的第二个参数里面（一个对象) */
function mapDispatchToProps(dispatch){
  return bindActionCreators({...OrderActions, ...AreaActions(), ...DeliverymanActions, ...DeliveryManageActions}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(DeliveryManagePannel);

/***************   *******   *****************/
/***************   子模态框   *****************/
/***************   *******   *****************/

var PrintModal = React.createClass({
  render: function(){
    var { checked_orders } = this.props;
    return (
      <StdModal ref="modal" title="批量打印订单" onConfirm={this.printHandler}>
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
    this.props.startPrint(this.props.checked_orders.map(n => n.order_id))
      .done(function(){
        Noty('success', '操作成功');
        this.props.callback();
      }.bind(this))
      .fail(function(e){
        Noty('error', e || '异常错误');
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
    'applyDeliveryman': PropTypes.func.isRequired,
  },
  getInitialState: function() {
    return {
      all_deliveryman: [],
      filter_results: [],
      selected_deliveryman_id: undefined,
      orders: [],
    };
  },
  componentWillReceiveProps: function(nextProps){
    var { deliveryman } = nextProps;
    //只需要初始化一次
    if(deliveryman.load_success && !this._hasInitial){
      this._hasInitial = true;
      var { list } = deliveryman;
      var build = function(){
        var new_data = list.map(function(n){
          n.py = window.makePy(n.deliveryman_name);
          return n;
        })
        this.setState({
          all_deliveryman: list, filter_results: new_data, selected_deliveryman_id: list.length && list[0].deliveryman_id
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
  render: function(){
    var { filter_results, selected_deliveryman_id, orders } = this.state;
    var { batch_edit, submitting } = this.props;
    var content = filter_results.map( n => {
      return <option key={n.deliveryman_id} value={n.deliveryman_id}>{n.deliveryman_name + ' ' + n.deliveryman_mobile}</option>
    });
    return (
      <StdModal onConfirm={this.saveHandler} onCancel={this.hideCallback} submitting={submitting} ref="modal" title="编辑配送人员">
        <div className="form-group form-inline mg-15">
          <div className="input-group input-group-sm">
            <span className="input-group-addon"><i className="fa fa-filter"></i></span>
            <input onChange={this.filterHandler} type="text" 
              className="form-control" style={{'width': '200'}} placeholder="配送员拼音首字母 或 手机号码" />
          </div>
        </div>
        <center className="form-inline mg-15" style={{'padding': '33px 0', 'textIndent': -15}}>
          {
            orders.length > 1
            ? <div>
                <h5 style={{'marginTop': 0}}>
                  您已同时勾选
                  <span className="strong font-lg">{' ' + orders.length + ' '}</span>
                  个订单
                </h5>
                <h5 style={{'marginBottom': 30}}>来编辑配送人员</h5>
              </div>
            : null
          }
          <div style={{'textIndent': -38}}>
            <label>{'配送人员　'}</label>
            <select onChange={this.onSelectDeliveryman} value={selected_deliveryman_id} className="form-control input-sm" style={{'minWidth': '145px'}}>
              {
                content.length
                ? content
                : <option>无</option>
              }
            </select>
          </div>
        </center>
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
      results = all_deliveryman.filter(n => n.phone.indexOf(value) == 0)
    }else if(/^\w+$/i.test(value)){ //首字母
      results = all_deliveryman.filter(n => {
        return n.py.some(m => m.indexOf(value) == 0)
      })
    }else{ //中文全称
      results = all_deliveryman.filter(n => n.text.indexOf(value) != -1)
    }
    this.setState({ filter_results: results, selected_deliveryman_id: results.length && results[0].deliveryman_id });
  },
  onSelectDeliveryman: function(e){
    this.setState({ selected_deliveryman_id: e.target.value});
  },
  saveHandler: function(){
    var { selected_deliveryman_id, orders } = this.state;
    var selected_deliveryman = this.state.filter_results.filter(n => n.deliveryman_id == selected_deliveryman_id);
    this.props.applyDeliveryman({
      deliveryman_id: selected_deliveryman_id,
      deliveryman_name: selected_deliveryman.length && selected_deliveryman[0].deliveryman_name,
      deliveryman_mobile: selected_deliveryman.length && selected_deliveryman[0].deliveryman_mobile,
      order_ids: orders.map(n => n.order_id)
    }).done(function(json){
      Noty('success', '操作成功！');
      this.props.callback();
      this.refs.modal.hide();
    }.bind(this)).fail(function(json){
      console.error(json);
      Noty('error', '操作失败！');
    })
  },
  componentDidMount: function(){
    //稍微延时一下，
    setTimeout(() => {
      this.props.getAllDeliveryman();
    }, 200);
  },
  show: function(orders){
    this.setState({orders})
    this.refs.modal.show();
  },
  hideCallback: function(){
    this.setState(this.getInitialState());
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
      director_mobile: ''
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
            <textarea valueLink={this.linkState('reason')} cols="18" rows="2" className="form-control input-xs"></textarea>
          </div>
          <div className="form-group form-inline">
            <label>{'申请人手机：'}</label>
            <input valueLink={this.linkState('applicant_mobile')} type="text" className="form-control input-xs" />
          </div>
          <div className="form-group form-inline">
            <label>{'　主管手机：'}</label>
            <input valueLink={this.linkState('director_mobile')} type="text" className="form-control input-xs" />
          </div>
        </div>
      </StdModal>
    )
  },
  saveHandler: function(){
    var { applicant_mobile } = this.state;
    if(!form.isMobile(applicant_mobile)){
      Noty('warning', '错误的电话号！');return;
    }
    this.props.applyPrint({...this.state, order_id: this.state.order_id})
      .done(function(){
        this.props.callback();
        this.refs.modal.hide();
      }.bind(this))
      .fail(function(msg, code){
        Noty('error', msg || '服务器异常')
      })
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
    )
  },
  saveHandler: function(){
    var { order_id } = this.state;
    this.props.validatePrintCode(order_id, this.state.validate_code)
      .done(function(){
        this.props.rePrint(order_id).done(function(){
          this.refs.modal.hide();
          setTimeout(this.props.callback, 1000);
        }.bind(this));
        this.refs.modal.hide();
      }.bind(this))
      .fail(function(){
        Noty('error', '服务器异常')
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
})
