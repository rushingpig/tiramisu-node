import React, {Component, PropTypes} from 'react';
import { render } from 'react-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import LinkedStateMixin from 'react-addons-linked-state-mixin';

import DatePicker from 'common/datepicker';
import Select from 'common/select';
import Pagination from 'common/pagination';
import StdModal from 'common/std_modal';
import LineRouter from 'common/line_router';
import { tableLoader } from 'common/loading';

import { order_status } from 'config/app.config';
import history from 'history_instance';
import LazyLoad from 'utils/lazy_load';
import { Noty } from 'utils/index';

import * as OrderActions from 'actions/orders';
import * as DeliverymanActions from 'actions/deliveryman';
import * as DeliveryManageActions from 'actions/delivery_manage';

import OrderProductsDetail from 'common/order_products_detail';
import OrderDetailModal from 'common/order_detail_modal';

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
            <button onClick={this.printHandler.bind(this)} className="btn btn-theme btn-xs">批量打印</button>
          </div>
          <div className="form-group form-inline">
            <button className="btn btn-default btn-xs space-right">扫描前请点击</button>
            <button className="btn btn-theme btn-xs space-right">扫描完成</button>
            <button onClick={this.batchEdit.bind(this)} className="btn btn-theme btn-xs">批量编辑配送员</button>
          </div>
        </div>
      </div>
    )
  }
  printHandler(){
    this.props.showBatchPrintModal();
  }
  batchEdit(){
    this.props.showBatchEditModal();
  }
}
FilterHeader.propTypes = {
  showBatchPrintModal: PropTypes.func.isRequired,
  showBatchEditModal: PropTypes.func.isRequired,
}

class OrderRow extends Component {
  render(){
    var { props } = this;
    var { order_status = {} } = props;
    return (
      <tr onClick={this.clickHandler.bind(this)} className={props.active_order_id == props.order_id ? 'active' : ''}>
        <td>
          <input onChange={this.checkOrderHandler.bind(this)} checked={props.checked} type="checkbox" />
        </td>
        <td>
          <a onClick={this.showEditModal.bind(this)} href="javascript:;" className="nowrap">[编辑配送员]</a><br/>
          <a onClick={this.printHandler.bind(this)} href="javascript:;">[打印]</a>
        </td>
        <td>{props.is_print == '1' ? '是' : '否'}</td>
        <td>{props.deliveryman_name || 'todo'}<br />{props.deliveryman_name_mobile || 'todo'}</td>
        <td>{props.delivery_time}</td>
        <td>{props.owner_name}<br />{props.owner_mobile}</td>
        <td className="text-left">
          姓名：{props.recipient_name}<br />
          电话：{props.recipient_mobile}<br />
          <div className="address-detail-td">
            <span className="inline-block">地址：</span><span className="address-all">{props.recipient_address}</span>
          </div>
          建筑：{props.recipient_landmark}
        </td>
        <td>todo</td>
        <td>todo</td>
        <td><div className="order-status" style={{background: order_status.bg}}>{order_status.value}</div></td>
        <td><a onClick={props.viewOrderDetail} href="javascript:;">{props.order_id}</a></td>
        <td>{props.remarks}</td>
      </tr>
    )
  }
  showEditModal(){
    this.props.showEditModal(this.props);
  }
  printHandler(){
    this.props.printHandler(this.props);
  }
  checkOrderHandler(e){
    var { order_id, checkOrderHandler } = this.props;
    checkOrderHandler(order_id, e.target.checked);
  }
  clickHandler(){
    this.props.activeOrderHandler(this.props.order_id);
  }
}

class DeliveryManagePannel extends Component {
  constructor(props){
    super(props);
    this.state = {
      page_size: 8,
      batch_edit: false,
      edit_orders: [],
    }
    this.showEditModal = this.showEditModal.bind(this);
    this.showBatchEditModal = this.showBatchEditModal.bind(this);
    this.showBatchPrintModal = this.showBatchPrintModal.bind(this);
    this.checkOrderHandler = this.checkOrderHandler.bind(this);
    this.activeOrderHandler = this.activeOrderHandler.bind(this);
    this.viewOrderDetail = this.viewOrderDetail.bind(this);
    this.printHandler = this.printHandler.bind(this);
  }
  render(){
    var { filter, getAllDeliveryman, applyDeliveryman, applyPrint, rePrint, deliveryman, main } = this.props;
    var { loading, page_no, total, list, checked_order_ids, check_order_info, active_order_id } = this.props.orders;
    var { showBatchPrintModal, printHandler, showEditModal, showBatchEditModal, checkOrderHandler, viewOrderDetail, activeOrderHandler } = this;

    var content = list.map((n, i) => {
      return <OrderRow key={n.order_id} {...{...n, active_order_id, showEditModal, printHandler, checkOrderHandler, viewOrderDetail, activeOrderHandler}} />;
    })
    return (
      <div className="order-manage">

        <TopHeader />
        <FilterHeader {...{...filter, showBatchPrintModal, showBatchEditModal}} />

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
                </tr>
                </thead>
                <tbody>
                  { tableLoader( loading, content ) }
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
                <div>订单产品详情</div>
                <OrderProductsDetail products={check_order_info.products} />
              </div>
            </div>
          : null }

        <EditModal ref="EditModal" {...{
          getAllDeliveryman, applyDeliveryman, orders: this.state.edit_orders, 
          deliveryman, batch_edit: this.state.batch_edit, submitting: main.submitting }}
        />
        <OrderDetailModal ref="detail_modal" data={check_order_info || {}} />
        <PrintModal ref="PrintModal" checked_order_ids={checked_order_ids} />
        <ApplyPrintModal ref="ApplyPrintModal" {...{applyPrint, submitting: main.submitting}} data={check_order_info || {}} />
        <RePrintModal ref="RePrintModal" {...{rePrint, submitting: main.submitting}} data={check_order_info || {}} />
      </div>
    )
  }
  showEditModal(n){
    this.setState({ batch_edit: false, edit_orders: [n]}, function(){
      this.refs.EditModal.show();
    })
  }
  showBatchEditModal(){
    var { list, checked_order_ids } = this.props.orders;
    if(checked_order_ids.length){
      var edit_orders = list.filter( n => {
        return checked_order_ids.some( m => m == n.order_id);
      })
      this.setState({ batch_edit: true, edit_orders }, function(){
        this.refs.EditModal.show();
      })
    }else{
      Noty('warning', '请先勾选订单！');
    }
  }
  showBatchPrintModal(n){
    var { checked_order_ids } = this.props.orders;
    if(checked_order_ids.length){
      this.refs.PrintModal.show();
    }else{
      Noty('warning', '请先勾选订单！');
    }
  }
  printHandler(n){
    //模拟轮换
    if(!this._print_flag){
      this._print_flag = 0;
    }
    var a = this._print_flag % 3;
    if(a == 0){
      Noty('success', '模拟打印已完成');
    }else if(a == 1){
      this.refs.ApplyPrintModal.show();
    }else if(a == 2){
      this.refs.RePrintModal.show(); //再次打印，输入验证码
    }
    ++this._print_flag;
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

  onPageChange(page){
    this.setState({page_no: page});
  }
  componentDidMount() {
    var { getOrderList, orders } = this.props;
    getOrderList({page_no: orders.page_no, page_size: this.state.page_size});

    LazyLoad('noty');
    LazyLoad('chinese_py');
  }
}

function mapStateToProps({deliveryManage}){
  return deliveryManage;
}

/* 这里可以使用 bindActionCreators , 也可以直接写在 connect 的第二个参数里面（一个对象) */
function mapDispatchToProps(dispatch){
  return bindActionCreators({...OrderActions, ...DeliverymanActions, ...DeliveryManageActions}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(DeliveryManagePannel);

/***************   *******   *****************/
/***************   子模态框   *****************/
/***************   *******   *****************/

var PrintModal = React.createClass({
  render: function(){
    var { checked_order_ids } = this.props;
    return (
      <StdModal ref="modal" title="批量打印订单">
        <center>
          <h5>
            您已同时勾选
            <span className="strong font-lg">{' ' + checked_order_ids.length + ' '}</span>
            个订单
          </h5>
        </center>
        <center><h5>进行打印</h5></center>
      </StdModal>
    )
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
    'orders': PropTypes.array.isRequired,
    'getAllDeliveryman': PropTypes.func.isRequired,
    'applyDeliveryman': PropTypes.func.isRequired,
  },
  getInitialState: function() {
    return {
      all_deliveryman: [],
      filter_results: [],
      selected_delivery_man: undefined,
    };
  },
  componentWillReceiveProps: function(nextProps){
    var { deliveryman } = nextProps;
    //只需要初始化一次
    if(deliveryman.load_success && !this._hasInitial){
      this._hasInitial = true;
      var { list } = deliveryman;
      var { makePy } = window;
      var new_data = list.map(function(n){
        if(makePy)
          n.py = makePy(n.deliveryman_name);
        else
          n.py = [];
        return n;
      })
      this.setState({
        all_deliveryman: list, filter_results: new_data, selected_delivery_man: list.length && list[0].deliveryman_id
      })
    }
  },
  render: function(){
    var { filter_results, selected_delivery_man } = this.state;
    var { orders, batch_edit, submitting } = this.props;
    var content = filter_results.map( n => {
      return <option key={n.deliveryman_id} value={n.deliveryman_id}>{n.deliveryman_name + ' ' + n.deliveryman_mobile}</option>
    });
    return (
      <StdModal onConfirm={this.saveHandler} submitting={submitting} ref="modal" title="编辑配送人员">
        <div className="form-group form-inline mg-15">
          <div className="input-group input-group-sm">
            <span className="input-group-addon"><i className="fa fa-filter"></i></span>
            <input onChange={this.filterHandler} type="text" 
              className="form-control" style={{'width': '200'}} placeholder="输入配送员姓名或手机号码检索" />
          </div>
        </div>
        <center className="form-inline mg-15" style={{'padding': '33px 0', 'textIndent': -15}}>
          {
            batch_edit
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
            <select onChange={this.onSelectDeliveryman} value={selected_delivery_man} className="form-control input-sm" style={{'minWidth': '145px'}}>
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
    this.setState({ filter_results: results, selected_delivery_man: results.length && results[0].deliveryman_id });
  },
  onSelectDeliveryman: function(e){
    this.setState({ selected_delivery_man: e.target.value});
  },
  saveHandler: function(){
    this.props.applyDeliveryman({
      deliveryman_id: this.state.selected_delivery_man,
      order_ids: this.props.orders.map(n => n.order_id)
    }).done(function(json){
      Noty('success', '操作成功！');
      this.hide();
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
  show: function(){
    this.refs.modal.show();
  },
  hide: function(){
    this.refs.modal.hide();
  },
});

var ApplyPrintModal = React.createClass({
  propTypes: {
    applyPrint: PropTypes.func.isRequired,
  },
  getInitialState: function() {
    return {
      reason: '',
      applicant_mobile: '',
      director_mobile: ''
    };
  },
  mixins: [LinkedStateMixin],
  render: function(){
    return (
      <StdModal onConfirm={this.saveHandler} submitting={this.props.submitting} ref="modal" size="sm" title="重新申请打印">
        <div className="pl-50">
          <div className="form-group form-inline">
            <label>{'　订单编号：'}</label>
            <span>{` ${this.props.data.order_id}`}</span>
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
    this.props.applyPrint({...this.state, order_id: this.props.data.order_id}).done(function(){
      this.hide();
    }.bind(this))
    .fail(function(){
      Noty('error', '服务器异常')
    })
  },
  show: function(){
    this.refs.modal.show();
  },
  hide: function(){
    this.refs.modal.hide();
  },
})

//再次打印，输入验证码的弹窗
var RePrintModal = React.createClass({
  propTypes: {
    rePrint: PropTypes.func.isRequired,
  },
  getInitialState: function() {
    return {
      validate_code: ''
    };
  },
  render: function(){
    return (
      <StdModal onConfirm={this.saveHandler} submitting={this.props.submitting} ref="modal" size="sm" title="打印">
        <div className="pl-50">
          <div className="form-group form-inline">
            <label>{'订单编号：'}</label>
            <span>{` ${this.props.data.order_id}`}</span>
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
    this.props.rePrint({validate_code: this.state.validate_code, order_id: this.props.data.order_id}).done(function(){
      Noty('success', '验证通过，可以打印了，todo')
      this.hide();
    }.bind(this))
    .fail(function(){
      Noty('error', '服务器异常')
    })
  },
  mixins: [LinkedStateMixin],
  show: function(){
    this.refs.modal.show();
  },
  hide: function(){
    this.refs.modal.hide();
  },
})
