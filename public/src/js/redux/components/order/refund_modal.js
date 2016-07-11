import React from 'react';
import StdModal from 'common/std_modal.js';
import Select from 'common/select';

var RefundModal = React.createClass({
  getInitialState:function(){
    return {
      relate_order_id:false,
      other_reason:false,
      initiator_active: true,
      refund_type: 1,
      refund_way: 1,
      is_alipay: true,

      refund_amount:0,
      total_discount_price: 0,
      recipient_name: '',
      recipient_mobile: '',
      owner_name: '',
      owner_mobile: '',
    }
  },
  render(){
    var reasonOptions = [{id:1,text:'客户要求取消订单'},
                          {id:2,text: '用户地址不配送'},
                          {id:3, text: '客户更改产品(款式或磅数)'},
                          {id:4, text: '用户取消蛋糕配件'},
                          {id:5, text: '其他'},
                         ]
    var {relate_order_id, other_reason, initiator_active, refund_type, refund_way, is_alipay,
          refund_amount, total_discount_price, recipient_mobile, recipient_name, owner_mobile,
          owner_name,
          } = this.state;
    return(
      <StdModal ref='modal' title='退款申请页面'>
        <div className='form-group form-inline'>
          <label>退款类型：</label>
          <input type='radio' value={1} checked={ refund_type == 1} onClick={this.refundTypeChange}/>
          <label>{'全额退款　　'}</label>
          <input type='radio' value={2} className='space-left' checked={refund_type == 2} onClick={this.refundTypeChange}/>
          <label>{'部分退款　　'}</label>
          <input type='radio' value={3} className='space-left' checked={refund_type ==3} onClick={this.refundTypeChange}/>
          <label>{'超额退款'}</label>
        </div>
        <div className='form-group form-inline'>
          <label>退款金额：</label>
          <span>￥</span><input value={refund_amount / 100} ref='amount' type='text' readOnly className='form-control input-xs short-input'/>          
        </div>
        <div className='form-group form-inline'>
          <label>退款原因：</label>
          <Select default-text='请选择退款原因' options={reasonOptions} onChange={this.reasonChange}/>
          {
            (relate_order_id || other_reason )&& 
            [<label key='relate_order_id_lbl'>{'　关联订单号：'}</label>,
            <input key='relate_order_id_txt' type='text' className='form-control input-xs' />]
          }

        </div>
        {
          other_reason &&
          <div className='form-group form-inline'>
          <label key='other_reason_lbl'>{'其他原因：'}</label>
          <input key='other_reason_txt' type='text' className='form-control' style={{width: 390}} />
          </div>
        }
        <div className = 'form-group form-inline'>
          <label>{'　联系人：'}</label>
          <input value={1} type='radio' checked={initiator_active} onClick={this.contactChange}/>{'　'}
          <label className='bordered bg-warning'>下单人</label>
          {'　'}
          姓名：<input value={owner_name} ref='owner_name' type='text' className='form-control input-xs'/>{'　'}
          电话：<input value={owner_mobile} ref='owner_mobile' type='text' className='form-control input-xs'/>
        </div>
        <div className= 'form-group form-inline'>
          {'　　　　　'}
          <input value={2} type='radio' checked={!initiator_active} onClick={this.contactChange}/>{'　'}
          <label className='bordered bg-warning'>{'收货人'}</label>
          {'　'}
          姓名：<input value={recipient_name} ref='recipient_name' readOnly type='text' className='form-control input-xs'/>{'　'}
          电话：<input value={recipient_mobile} ref='recipient_mobile' readOnly type='text' className='form-control input-xs'/>          
        </div>
        <div className='form-group form-inline'>
          <label>退款方式：</label>
          <input value={1} type='radio' checked={refund_way == 1} onClick={this.refundwayChange}/>{'第三方平台原返'}{'　'}
          <input value={2} type='radio' checked = {refund_way == 2} onClick={this.refundwayChange}/>{'财务部退款'}{'　'}
          <input value={3} type='radio' checked = {refund_way == 3} onClick={this.refundwayChange}/>{'客服部退款'}
        </div>
        {
          refund_way == 2 &&
          <div className='form-group form-inline'>
          <label>退款渠道：</label>
          <input type='radio' checked={is_alipay} />{'　支付宝　'}
          <input type='radio' checked={!is_alipay}/>{'　微信'}
        </div>}
        {
          refund_way == 3 &&
          <div className='form-group form-inline'>
            <label>退款渠道：</label>
            <input type='radio' checked={is_alipay} onClick={this.channelChange}/>{'　'}
            <label>{'支付宝'}</label>
            {'　'}
            <input type='radio' checked={!is_alipay} onClick={this.channelChange}/>{'　'}
            <label>{'银行卡'}</label>
            <div className='form-group form-inline'>
            {
              is_alipay?
              <label>{'　　　　　绑定姓名：'}</label>
              :
              <label>{'　　　　　账户名：'}</label>
            }
            <input className='form-control input-xs' type='text' style={{width:310, marginBottom:5}} /><br />
            {
              is_alipay?
              <label>{'　　　　　　　账号：'}</label>
              :
              <label>{'　　　　　　卡号：'}</label>
            }
            <input className='form-control input-xs' type='text' style={{width:310}}/>
            </div>
          </div>
        }
        <div className='form-group form-inline'>
          <label>加急处理：</label>
          <input type='checkbox' />
        </div>
      </StdModal>
      )
  },
  show(order){
    this.setState({
      total_discount_price: order.total_discount_price,
      refund_amount: order.total_discount_price,
      recipient_name: order.recipient_name,
      recipient_mobile: order.recipient_mobile,
      owner_name: order.owner_name,
      owner_mobile: order.owner_mobile,
    });
    this.refs.modal.show();
  },
  refundTypeChange(e){
    var {value} = e.target;
    this.setState({refund_type:value});
    var amount_input = this.refs.amount;
    if(value == 1){
      amount_input.setAttribute('readOnly', 'true');
    }else{
      amount_input.removeAttribute('readOnly');
    }
  },
  contactChange(e){
    var {value} = e.target;
    var flag = value == 1 ? true:false;
    this.setState({initiator_active: flag});
    var owner_name = this.refs.owner_name;
    var owner_mobile = this.refs.owner_mobile; 
    var recipient_name = this.refs.recipient_name;
    var recipient_mobile = this.refs.recipient_mobile;   
    if(!flag){
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
  },
  refundwayChange(e){
    var {value} = e.target;
    this.setState({refund_way: value});
  },
  channelChange(){
    this.setState({is_alipay : !this.state.is_alipay});
  },
  reasonChange(e){
    var {value} = e.target;
    if(value == 5){
      this.setState({other_reason:true, relate_order_id: false});
    }else if(value == 3){
      this.setState({ other_reason: false, relate_order_id: true});
    }else{
      this.setState({ other_reason: false, relate_order_id: false});
    }
  }
});

export default RefundModal;