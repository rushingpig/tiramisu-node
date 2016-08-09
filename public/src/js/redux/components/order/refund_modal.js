import React, {Component, PropTypes} from 'react';
import Select from 'common/select';
import { SELECT_DEFAULT_VALUE} from 'config/app.config';
import { reduxForm } from 'redux-form';
import { Noty, form as uForm } from 'utils/index';

import RadioGroup from 'common/radio_group';

import FormFields from 'config/form.fields';

const validate = (values, props) => {
  const errors = {};
  var msg = 'error'
  var {form} = props;

  function _v_amount(key){
    if(form[key] && form[key].touched ){
      if(!uForm.isNumber(values[key]) || values[key] <= 0 ){
        errors[key] = msg ;
      }else{
        if(values['type'] == 'PART' && values[key] >= values['payment_amount'] / 100){
          errors[key] = msg;
        }else if( values['type'] == 'OVERFULL' && values[key] <= values['payment_amount'] / 100){
          errors[key] = msg;
        }        
      }
    }
  }

  function _v_select(key){
    if(form[key] && form[key].touched && (!values[key] || values[key] == SELECT_DEFAULT_VALUE))
      errors[key] = msg;
  }

  _v_amount('amount');

  _v_select('reason_type')

  return errors;
}

class RefundPannel extends Component{
  render(){
    var { 
      editable,
      handleSubmit,
      fields: {
        type,
        amount,
        reason_type,
        linkman,
        owner_name,
        owner_mobile,
        recipient_name,
        recipient_mobile,
        reason,
        way,
        account_type,
        account,
        account_name,
        is_urgent, 
        payment_amount,       
      },
      bind_order_id,
      all_refund_reasons,
    } = this.props;
    var symbolflag = '<';
    switch (type.value){
      case 'PART':
        symbolflag = '<';break;
      case 'FULL':
        symbolflag = '=';break;
      case 'OVERFULL':
        symbolflag = '>';break;
      default:;
    }
    return(
      <div>
        <div className='form-group form-inline'>
          <label>退款类型：</label>
          <RadioGroup
            {...type} 
            vertical = {false}
            className='inline-block'
            radios ={[
                { value: 'PART', text: '部分退款　　'},
                { value: 'FULL', text: '全额退款　　'},
                { value: 'OVERFULL', text: '超额退款'}
              ]}/>

        </div>
        <div className='form-group form-inline'>
          <label>退款金额：</label>
          <span>￥</span>
          {
            type.value == 'FULL'?
            <input {...amount} value = { payment_amount.value / 100} readOnly ref='amount' type='text' className='form-control input-xs short-input'/> 
            :
            <input {...amount} ref='amount' type='text' className={`form-control input-xs short-input ${amount.error}`}/> 
          }
          <label {...payment_amount} style={{color: 'grey'}}>{'　　' + symbolflag + payment_amount.value / 100}</label>         
        </div>
        <div className='form-group form-inline'>
          <label>退款原因：</label>
          <Select {...reason_type} options={all_refund_reasons || []} className={` ${reason_type.error}`}/>
          {
            (reason_type.value == 0 || reason_type.value == 3 )&& 
            [<label key='relate_order_id_lbl'>{'　关联订单号：'}</label>,
            <input value = {bind_order_id} readOnly key='relate_order_id_txt' type='text' className='form-control input-xs' />]
          }

        </div>
        {
          reason_type.value == 0 &&
          <div className='form-group form-inline'>
          <label key='reason_lbl'>{'其他原因：'}</label>
          <input {...reason} key='reason_txt' type='text' className='form-control' style={{width: 390}} />
          </div>
        }
        <div className = 'form-group form-inline'>
          <label>{'　联系人：'}</label>
          <input {...linkman} value={0} type='radio' checked={linkman.value == 0} />{'　'}
          <label className='bordered bg-warning'>下单人</label>
          {'　'}
          姓名：<input {...owner_name} disabled = {linkman.value == 1} ref='owner_name' type='text' className='form-control input-xs' />{'　'}
          电话：<input {...owner_mobile} disabled = {linkman.value == 1} ref='owner_mobile' type='text' className='form-control input-xs'/>
        </div>
        <div className= 'form-group form-inline'>
          {'　　　　　'}
          <input {...linkman} value={1} type='radio' checked={linkman.value == 1} />{'　'}
          <label className='bordered bg-warning'>{'收货人'}</label>
          {'　'}
          姓名：<input {...recipient_name} ref='recipient_name' disabled = {linkman.value == 0} type='text' className='form-control input-xs'/>{'　'}
          电话：<input {...recipient_mobile} ref='recipient_mobile' disabled = {linkman.value == 0} type='text' className='form-control input-xs'/>          
        </div>
        <div className='form-group form-inline'>
          <label>退款方式：</label>
          <RadioGroup
            {...way}
            vertical = {false}
            className = 'inline-block'
            radios = {[
                { value: 'THIRD_PARTY', text: '第三方平台原返　'},
                { value: 'FINANCE', text: '财务部退款　'},
                { value: 'CS', text: '客服部退款'}
              ]} />
        </div>
        {
          way.value == 'FINANCE' &&
          <div className='form-group form-inline'>
          <label>退款渠道：</label>
          <input {...account_type} value={'ALIPAY'} type='radio' checked={account_type.value == 'ALIPAY'} />{'　支付宝　'}
          <input {...account_type} value = {'WECHAT'} type='radio' checked={account_type.value != 'ALIPAY'}/>{'　微信'}
        </div>}
        {
          way.value == 'CS' &&
          <div className='form-group form-inline'>
            <label>退款渠道：</label>
            <input {...account_type} value={'ALIPAY'} type='radio' checked={ account_type.value == 'ALIPAY'} onClick={this.channelChange}/>{'　'}
            <label>{'支付宝'}</label>
            {'　'}
            <input {...account_type} value = {'BANK_CARD'} type='radio' checked={ account_type.value != 'ALIPAY'} onClick={this.channelChange}/>{'　'}
            <label>{'银行卡'}</label>
            <div className='form-group form-inline'>
            {
              account_type.value == 'ALIPAY'?
              <label>{'　　　　　账户名：'}</label>
              :
              <label>{'　　　　绑定姓名：'}</label>
            }
            <input {...account_name} className='form-control input-xs' type='text' style={{width:310, marginBottom:5}} /><br />
            {
              account_type.value == 'ALIPAY'?
              <label>{'　　　　　　账号：'}</label>
              :
              <label>{'　　　　　　卡号：'}</label>
            }
            <input {...account} className='form-control input-xs' type='text' style={{width:310}}/>
            </div>
          </div>
        }
        <div className='form-group form-inline'>
          <label>加急处理：</label>
          <input {...is_urgent} type='checkbox' checked = {is_urgent.value == 1}/>
        </div>
        <div className="form-group" >
        {'　　　　　　　　　'}

          {
            editable?
            <button 
              onClick = {handleSubmit(this._check.bind(this, this.handleRefundEdit))}
              className="btn btn-theme btn-xs space-left pull-right"
              >提交</button>
            :
            <button 
            className="btn btn-theme btn-xs space-left pull-right"
            onClick = {handleSubmit(this._check.bind(this, this.handleRefundApply))}
            >提交</button>
          }      
          <button
              onClick = {this.cancel.bind(this)}
              key="cancelBtn"
              className="btn btn-default btn-xs space-right pull-right">取消</button>          
        </div>
      </div>
      )
  }
  _check(callback,form_data){
    setTimeout(()=>{
        var {errors} = this.props;
        if(!Object.keys(errors).length){
          callback.call(this,form_data);  //以callback来代替this 调用
        }else{
          Noty('warning','请填写完整');
        }
    },0);
  }
  contactChange(){
    var owner_name = this.refs.owner_name;
    var owner_mobile = this.refs.owner_mobile; 
    var recipient_name = this.refs.recipient_name;
    var recipient_mobile = this.refs.recipient_mobile;
    var { fields: {linkman }} = this.props;   
    if(linkman.value == 1){
      owner_name.setAttribute('readOnly','true');
      owner_mobile.setAttribute('readOnly', 'true');
      recipient_name.removeAttribute('readOnly');
      recipient_mobile.removeAttribute('readOnly');
    }else{
      recipient_name.setAttribute('readOnly','true');
      recipient_mobile.setAttribute('readOnly', 'true');
      owner_name.removeAttribute('readOnly');
      owner_mobile.removeAttribute('readOnly');      
    }
  }
  handleRefundApply(){
    var form_data = {order_id : this.props.order_id}
    this.props.refundApply(form_data)
      .done(function(){
        Noty('success', '保存成功');
        this.props.onCancel();
      }.bind(this))
      .fail(function(msg){
        Noty('error', msg || '操作异常');
      })
  }
  handleRefundEdit(){
    var orderId = this.props.order_id;
    this.props.refundEdit(orderId);
    this.props.editRefundChangeStatus(orderId);
  }
  cancel(){
    this.props.cancel();
  }
};

export default function initRefundPannel(initFunc){
  return reduxForm({
    form:'refund_apply',
    fields:FormFields.refund_apply,
    validate,
    touchOnBlur: true,
  }, initFunc)(RefundPannel)
}