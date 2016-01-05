import React, {Component, PropTypes} from 'react';
import {findDOMNode} from 'react-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as AreaActions from 'actions/area';
import * as OrderFormActions from 'actions/order_manage_form';

import DatePicker from 'common/datepicker';
import Alert from 'common/alert';

import ManageOrderForm from './manage_order_form';
import ManageOrderProducts from './manage_order_products';

class TopHeader extends Component {
  render(){
    return (
      <div className="clearfix top-header">
        <div className="pull-right line-router">
          <span className="node">总订单页面</span>
          <span>{'　/　'}</span>
          <span className="node active">编辑订单</span>
        </div>
      </div>
    )
  }
}

class ManageOrderDetailPannel extends Component {
  render(){
    var { mainForm, area, dispatch, products, params } = this.props;
    return (
      <div className="order-manage">
        <TopHeader />
        <div className="panel">
          <header className="panel-heading">订单详情</header>
          <div className="panel-body">
            <ManageOrderForm
              form-data={mainForm}
              area={area} 
              editable={!!(params && params.id)}
              order_id={params.id}
              actions={{...bindActionCreators(AreaActions, dispatch), ...bindActionCreators(OrderFormActions, dispatch)}}>
                <ManageOrderProducts dispatch={dispatch} {...products} />
            </ManageOrderForm>
          </div>
        </div>
      </div>
    )
  }
  componentDidMount(){
    //有params则表示是编辑订单
    var { params } = this.props;
    if(params && params.id){
      this.props.getOrderById(params.id);
    }
  }
}

ManageOrderDetailPannel.PropTypes = {
  createOrder: PropTypes.func.isRequired
};

function mapStateToProps({orderManageForm}){
  return orderManageForm;
}
function mapDispatchToProps(dispatch){
  var actions = bindActionCreators(OrderFormActions, dispatch);
  actions.dispatch = dispatch;  //不绑定的话，dispatch传不到 ManageOrderDetailPannel了，(￣◇￣;)
  return actions;
}

//bindActionCreators: dispatch(action) --> 自动加上dispatch --> reducer
//redux-thunk       : dispatch(action) --> reducer         --> 异步代码执行，thunk 提供dispatch

export default connect(mapStateToProps, mapDispatchToProps)(ManageOrderDetailPannel);
