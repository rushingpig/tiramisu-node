import React, {Component, PropTypes} from 'react';
import { render } from 'react-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import LinkedStateMixin from 'react-addons-linked-state-mixin';

import * as OrderManageActions from 'actions/orders';
import DatePicker from 'common/datepicker';
import Select from 'common/select';
import Pagination from 'common/pagination';

import Config from 'config/app.config';
import history from 'history_instance';
import LineRouter from 'common/line_router';
import OrderProductsDetail from 'common/order_products_detail';
import TimeInput from 'common/time_input';

// import ManageDetailModal from 'common/order_detail_modal';
// import ManageAlterStationModal from './manage_alter_station_modal';

class TopHeader extends Component {
  render(){
    return (
      <div className="clearfix top-header">
        <LineRouter 
          routes={[{name: '送货单管理', link: '/dm/change'}, {name: '配送单列表', link: ''}]} />
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
            <Select default-text="选择支付方式" className="space"/>
            <Select default-text="选择订单状态" className="space"/>
            <Select default-text="选择配送员" className="space"/>
            <Select default-text="选择配送中心" className="space"/>
          </div>
          <div className="form-group form-inline">
            <Select default-text="所属省份" className="space-right"/>
            <Select default-text="所属城市" className="space"/>
            <button className="btn btn-default btn-xs space">扫描前请点击</button>
            <button className="btn btn-theme btn-xs space">扫描完成</button>
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
          <a onClick={this.showSignedModal.bind(this)} href="javascript:;">[签收]</a><br/>
          <a onClick={this.showUnSignedModal.bind(this)} href="javascript:;">[未签收]</a>
        </td>
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
  showSignedModal(){
    this.props.showSignedModal();
  }
  showUnSignedModal(){
    this.props.showUnSignedModal();
  }
  // clickHandler(){
  //   this.props.activeOrder(this.props.order_id);
  // }
}

class DeliveryDistributePannel extends Component {
  constructor(props){
    super(props);
    this.state = {
      page_size: 8,
    }
    this.showSignedModal = this.showSignedModal.bind(this);
    this.showUnSignedModal = this.showUnSignedModal.bind(this);
  }
  render(){
    var { filter } = this.props;
    var { page_no, total, list, check_order_info, active_order_id } = this.props.orders;
    var { viewDetail, showSignedModal, showUnSignedModal } = this;

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
                  <th>送达时间</th>
                  <th>货到付款金额</th>
                  <th>下单人</th>
                  <th>收货人信息</th>
                  <th>订单号</th>
                  <th>配送方式</th>
                  <th>备注</th>
                  <th>订单完成时间</th>
                  <th>订单状态</th>
                </tr>
                </thead>
                <tbody>
                  <OrderRow showSignedModal={this.showSignedModal} showUnSignedModal={this.showUnSignedModal} />
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
    // this.showSignedModal({});
    // var { getOrderList, orders } = this.props;
    // getOrderList({page_no: orders.page_no, page_size: this.state.page_size});
  }
  showSignedModal(n){
    render(<SignedModal data={n} data-id={new Date().getTime()} />, this.refs['modal-wrap']);
  }
  showUnSignedModal(n){
    render(<UnSignedModal data={n} data-id={new Date().getTime()} />, this.refs['modal-wrap']);
  }
}

function mapStateToProps({deliveryDistribute}){
  return deliveryDistribute;
}

/* 这里可以使用 bindActionCreators , 也可以直接写在 connect 的第二个参数里面（一个对象) */
function mapDispatchToProps(dispatch){
  return bindActionCreators(OrderManageActions, dispatch);
}

export default connect(mapStateToProps, OrderManageActions)(DeliveryDistributePannel);

/***************   *******   *****************/
/***************   子模态框   *****************/
/***************   *******   *****************/

var SignedModal = React.createClass({
  getInitialState: function() {
    return {
      CASH: 'CASH', //现金赔偿
      REFUND: 'REFUND', //全额退款

      late_time: '',

      refund_method: '',
      refund_money: '',
      refund_reson: '',
    };
  },
  componentWillReceiveProps: function(nextProps){
    if(nextProps['data-id'] != this.props['data-id']){
      this.show();
    }
  },
  mixins: [ LinkedStateMixin ],
  render: function(){
    var { late_time, refund_method, refund_money, refund_reson} = this.state;
    return (
    <div ref="modal" aria-hidden="false" aria-labelledby="myModalLabel" role="dialog" className="modal fade" >
      <div className="modal-backdrop fade"></div>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <button aria-hidden="true" data-dismiss="modal" className="close" type="button">×</button>
            <h4 className="modal-title">订单完成页面</h4>
          </div>
          <div className="modal-body">
            <div className="form-group mg-15 form-inline">
              <label>签收时间：</label>
              <DatePicker className="short-input" />
              {'　'}
              <TimeInput ref="timeinput" />
            </div>
            <div className="form-group form-inline mg-15">
              <div className="row">
                <div className="col-xs-6">
                  <label>迟到时长：</label>
                  <div className="inline-block input-group input-group-xs">
                    <input value={late_time} onChange={this.onLateTimeChange} type="text" className="form-control" style={{'width': 50}} />
                    <span className="input-group-addon">Min</span>
                  </div>
                </div>
                <div className="col-xs-6">
                  <label>货到付款金额：</label>
                  <input readOnly className="form-control input-xs short-input" style={{'width': 50}} />
                </div>
              </div>
            </div>
            <div className="form-group mg-15">
              <label className="">
                <input value={this.state.CASH} onClick={this.checkMethod} type="radio" name="method" />
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
                <input value={this.state.REFUND} onClick={this.checkMethod} type="radio" name="method" />
                {' 全额退款（迟到时间>=30mins）'}
              </label>
              {
                this.state.refund_method == this.state.REFUND
                ? <div className="form-group pl-20">
                    <label><input value={'XXX1'} onClick={this.checkReason} name="reason" type="radio" />{' 迟到30mins以上'}</label><br/>
                    <label><input value={'XXX2'} onClick={this.checkReason} name="reason" type="radio" />{' 款式不符'}</label><br/>
                    <label><input value={'XXX3'} onClick={this.checkReason} name="reason" type="radio" />{' 尺寸、规格不符'}</label><br/>
                  </div>
                : null
              }
            </div>
          </div>
          <div className="modal-footer">
            <button onClick={this.hide} type="button" className="btn btn-sm btn-default" data-dismiss="modal">取消</button>
            <button onClick={this.onConfirm} type="button" className="btn btn-sm btn-theme">确定</button>
          </div>
        </div>
      </div>
    </div>
    )
  },
  componentDidMount: function(){
    this.show();
  },
  onLateTimeChange: function(e){
    var { value } = e.target;
    this.setState({ late_time: value, refund_money: value <=30 ? value : ''})
  },
  checkMethod: function(e){
    this.setState({ refund_method: e.target.value });
  },
  checkReason: function(e){
    this.setState({ refund_reson: e.target.value });
  },
  show: function(){
    $(this.refs.modal).modal('show');
  },
  hide: function(){
    $(this.refs.modal).modal('hide');
  },
});

var UnSignedModal = React.createClass({
  getInitialState: function() {
    return {
      NOTFOUND: 'NOTFOUND',
      OTHERS: 'OTHERS',

      reason: '',
      other_reasons: '',
      real_pay: '',
      black_list: undefined,
    };
  },
  componentWillReceiveProps: function(nextProps){
    //组建身份证，当它不一样时，证明要重新打开
    if(nextProps['data-id'] != this.props['data-id']){
      this.show();
    }
  },
  mixins: [ LinkedStateMixin ],
  render: function(){
    var { late_time, refund_method, refund_money, refund_reson} = this.state;
    return (
    <div ref="modal" aria-hidden="false" aria-labelledby="myModalLabel" role="dialog" className="modal fade" >
      <div className="modal-backdrop fade"></div>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <button aria-hidden="true" data-dismiss="modal" className="close" type="button">×</button>
            <h4 className="modal-title">订单未完成页面</h4>
          </div>
          <div className="modal-body">
            <div className=" mg-15">
              <label className="strong-label">未签收原因：</label>
              <div className="form-group form-inline">
                <label>
                  <input value={this.state.NOTFOUND} onClick={this.checkReason} type="radio" name="reason" />
                  {' 联系不上用户，无人签收'}
                </label>
              </div>
              <div className="form-group form-inline">
                <label>
                  <input value={this.state.OTHERS} onClick={this.checkReason} type="radio" name="reason" />
                  {' 其他'}
                </label>
                {'　'}
                <input valueLink={this.linkState('other_reasons')} className="form-control input-xs long-input" />
              </div>
            </div>
            <div className="form-inline mg-15">
              <div className="row">
                <div className="col-xs-6">
                  <label>货到付款金额：</label>
                  <input readOnly className="form-control input-xs short-input" style={{'width': 50}} />
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
              <label><input value="1" onClick={this.checkBlackList} name="reason" type="radio" />{' 是'}</label>
              {'　　'}
              <label><input value="0" onClick={this.checkBlackList} name="reason" type="radio" />{' 否'}</label><br/>
              <p className="font-xs gray">（列入黑名单后，此用户ID下单无法再选择货到付款模式）</p>
            </div>
          </div>
          <div className="modal-footer">
            <button onClick={this.hide} type="button" className="btn btn-sm btn-default" data-dismiss="modal">取消</button>
            <button onClick={this.onConfirm} type="button" className="btn btn-sm btn-theme">确定</button>
          </div>
        </div>
      </div>
    </div>
    )
  },
  componentDidMount: function(){
    this.show();
  },
  checkReason: function(e){
    this.setState({ reason: e.target.value });
  },
  checkBlackList: function(e){
    this.setState({ black_list: e.target.value });
  },
  show: function(){
    $(this.refs.modal).modal('show');
  },
  hide: function(){
    $(this.refs.modal).modal('hide');
  },
})

// DetailModal.PropTypes = {
//   dispatch: PropTypes.func.isRequired,
// }