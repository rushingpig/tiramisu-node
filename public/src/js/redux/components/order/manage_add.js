import React, {Component, PropTypes} from 'react';
import {findDOMNode} from 'react-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as AreaActions from '../../actions/area';
import * as OrderAddActions from '../../actions/order_manage_add';

import DatePicker from '../common/datepicker';
import Alert from '../common/alert';

import ManageAddForm from './manage_add_form';
import ManageAddProducts from './manage_add_products';

class TopHeader extends Component {
  render(){
    return (
      <div className="clearfix top-header">
        <div className="pull-right line-router">
          <span className="node">总订单页面</span>
          <span>{'　/　'}</span>
          <span className="node active">添加订单</span>
        </div>
      </div>
    )
  }
}

class ManageAddPannel extends Component {
  render(){
    var { addForm, area, dispatch, save_ing, save_success, submitting, products } = this.props;
    return (
      <div className="order-manage">
        <TopHeader />
        <div className="panel">
          <header className="panel-heading">订单详情</header>
          <div className="panel-body">
            <ManageAddForm
              ref="ManageAddForm"
              form-data={addForm}
              area={area} 
              actions={{...bindActionCreators(AreaActions, dispatch), ...bindActionCreators(OrderAddActions, dispatch)}} />
            <hr className="dotted" />
            <ManageAddProducts dispatch={dispatch} {...products} />
            <div className="form-group">
              {save_success != undefined && !save_success ? <Alert type="danger">保存信息失败</Alert> : null}
              <button 
                  onClick={this.handleSave.bind(this)} 
                  disabled={save_ing} 
                  data-submitting={save_ing} 
                  className="btn btn-theme btn-sm">保存信息</button>
              {'　　'}
              <button disabled={submitting} data-submitting={submitting} className="btn btn-theme btn-sm">保存</button>
            </div>
          </div>
        </div>
      </div>
    )
  }
  handleSave(){
    this.props.foo();
    // this.refs.ManageAddForm.props.handleSubmit(this.mergeState);
  }
  mergeState(data){
    //redux-form的缘故，这里必须异步，否则errors为空对象
    setTimeout(() => {
      var {errors} = this.refs.ManageAddForm.props;
      var { dispatch, saveOrderInfo } = this.props;
      if(!Object.keys(errors).length){
        data.delivery_id = 1;
        data.delivery_time = data.delivery_date + ' ' + data.delivery_hours;
        delete data.delivery_date;
        delete data.delivery_hours;
        dispatch(saveOrderInfo(data));  //这个地方就只能手动dispatch了
      }
    }, 0);
  }
}

ManageAddPannel.PropTypes = {
  saveOrderInfo: PropTypes.func.isRequired
};

function mapStateToProps({orderManageAdd}){
  return orderManageAdd;
}
function mapDispatchToProps(dispatch){
  var actions = bindActionCreators(OrderAddActions, dispatch);
  actions.dispatch = dispatch;  //不绑定的话，dispatch传不到 ManageAddPannel了，(￣◇￣;)
  return actions;
}

//bindActionCreators: dispatch(action) --> 自动加上dispatch --> reducer
//redux-thunk       : dispatch(action) --> reducer         --> 异步代码执行，thunk 提供dispatch

export default connect(mapStateToProps, mapDispatchToProps)(ManageAddPannel);
