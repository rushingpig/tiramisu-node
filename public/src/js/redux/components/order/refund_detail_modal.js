import React,{Component} from 'react';
import {findDOMNode} from 'react-dom';
import {connect} from 'react-redux';
import { bindActionCreators } from 'redux';

import RefundApply from './refund_apply_modal';
import StdModal from 'common/std_modal.js';

class RefundModal extends Component{
  render(){
    var { editable, refund_data, refundApply, refundEdit, editRefundChangeStatus} = this.props;  
    var { refund_apply_data, all_refund_reasons } = refund_data
    var { bind_order_id, order_id, id } = refund_apply_data;
    return(
      <StdModal ref = 'modal' title = '退款申请页面' footer = {false}>
          <RefundApply 
            bind_order_id = { bind_order_id }
            order_id = {order_id}
            id = {id}
            cancel = {this.cancel.bind(this)}  
            editable = {editable}
            refundApply = { refundApply }
            all_refund_reasons = {all_refund_reasons}
            editRefundChangeStatus = {editRefundChangeStatus}
            refundEdit = { refundEdit }
            onCancel = {this.cancel.bind(this)}
            /> 
      </StdModal>
      )
  }
  show(){
    this.props.getRefundReasons();
    this.refs.modal.show();
  }
  cancel(){
    this.refs.modal.hide();
  }
}

export default RefundModal;