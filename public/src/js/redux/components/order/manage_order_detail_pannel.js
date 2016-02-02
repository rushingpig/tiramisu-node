import React, {Component, PropTypes} from 'react';
import {findDOMNode} from 'react-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import AreaActions from 'actions/area';
import * as OrderFormActions from 'actions/order_manage_form';

import DatePicker from 'common/datepicker';
import Alert from 'common/alert';
import LineRouter from 'common/line_router';

import ManageOrderFormCreate from './manage_order_form_create';
import ManageOrderFormEdit from './manage_order_form_edit';
import ManageOrderProducts from './manage_order_products';

class TopHeader extends Component {
  render(){
    return (
      <div className="clearfix top-header">
        <LineRouter 
          routes={[{name: '总订单页面', link: '/om/index'}, {name: '编辑订单', link: ''}]}
          className="pull-right" />
      </div>
    )
  }
}

class ManageOrderDetailPannel extends Component {
  render(){
    var { mainForm, delivery_stations, history_orders, area, dispatch, products, params } = this.props;
    var editable = !!(params && params.id);

    var actions = {...bindActionCreators(AreaActions(), dispatch), ...bindActionCreators(OrderFormActions, dispatch)};

    mainForm = {...mainForm, ...delivery_stations};
    return (
      <div className="order-manage">
        <TopHeader />
        <div className="panel">
          <header className="panel-heading">订单详情</header>
          <div className="panel-body">
            {
              !editable
                ? <ManageOrderFormCreate
                    form-data={mainForm}
                    history_orders={history_orders}
                    area={area} 
                    editable={editable}
                    order_id={params.id}
                    actions={actions}>
                      <ManageOrderProducts dispatch={dispatch} {...products} />
                  </ManageOrderFormCreate>
                : <ManageOrderFormEdit
                    form-data={mainForm}
                    history_orders={history_orders}
                    area={area} 
                    editable={editable}
                    order_id={params.id}
                    actions={actions}>
                      <ManageOrderProducts dispatch={dispatch} {...products} />
                  </ManageOrderFormEdit>
            }
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
