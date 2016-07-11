import React, {Component, PropTypes} from 'react';
import {findDOMNode} from 'react-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import AreaActions from 'actions/area';
import * as OrderFormActions from 'actions/order_manage_form';
import * as FormActions from 'actions/form';
import { ProductsModalActionTypes } from 'actions/action_types';
import { resetOrderStore } from 'actions/orders';

import DatePicker from 'common/datepicker';
import Alert from 'common/alert';
import LineRouter from 'common/line_router';

import { Noty } from 'utils/index';

import ManageOrderFormCreate from './manage_order_form_create';
import ManageOrderFormEdit from './manage_order_form_edit';
import ManageOrderProducts from './manage_order_products';

class TopHeader extends Component {
  render(){
    return (
      <div className="clearfix top-header">
        <LineRouter 
          routes={[{name: '总订单页面', link: '/om/index'}, {name: (this.props.editable ? '编辑' : '添加') + '订单', link: ''}]}
          className="pull-right" />
      </div>
    )
  }
}

class ManageOrderDetailPannel extends Component {
  render(){
    var { mainForm, add_form, delivery_stations, history_orders, area, dispatch, products, products_area_filter, params } = this.props;
    var editable = !!(params && params.id);
    var actions = bindActionCreators(
      {...AreaActions(), ...OrderFormActions, ...FormActions, resetOrderStore}, dispatch
    );

    mainForm = {...mainForm, ...delivery_stations};
    var manageOrderProducts = (
      <ManageOrderProducts
        dispatch={dispatch}
        {...products}
        add_form={add_form} //为了传入province_id, city_id
        area={area} //传入provinces, cities（默认）
        actions={{...bindActionCreators(AreaActions(ProductsModalActionTypes), dispatch)}}
        cities={products_area_filter.cities}
        districts={products_area_filter.districts}
      />
    );
    return (
      <div className="order-manage">
        <TopHeader editable={editable} />
        <div className="panel">
          <header className="panel-heading">订单详情</header>
          <div ref="content" className="panel-body">
            {
              !editable
                ? <ManageOrderFormCreate
                    form-data={mainForm}
                    history_orders={history_orders}
                    area={area} 
                    editable={editable}
                    order_id={params.id}
                    actions={actions}>  
                      {manageOrderProducts}
                  </ManageOrderFormCreate>
                : <ManageOrderFormEdit
                    form-data={mainForm}
                    history_orders={history_orders}
                    area={area} 
                    editable={editable}
                    order_id={params.id}
                    actions={actions}>
                      {manageOrderProducts}
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

ManageOrderDetailPannel.propTypess = {
  createOrder: PropTypes.func.isRequired
};

function mapStateToProps({orderManageForm, form}){
  return {...orderManageForm, add_form: form.add_order}; //add_form是给products_modal用的，传给其省市信息
}
function mapDispatchToProps(dispatch){
  var actions = bindActionCreators(OrderFormActions, dispatch);
  actions.dispatch = dispatch;  //不绑定的话，dispatch传不到 ManageOrderDetailPannel了，(￣◇￣;)
  return actions;
}

//bindActionCreators: dispatch(action) --> 自动加上dispatch --> reducer
//redux-thunk       : dispatch(action) --> reducer         --> 异步代码执行，thunk 提供dispatch

export default connect(mapStateToProps, mapDispatchToProps)(ManageOrderDetailPannel);
