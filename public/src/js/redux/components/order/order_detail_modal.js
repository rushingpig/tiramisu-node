import React, { Component, PropTypes } from 'react';
import { DELIVERY_MAP, DELIVERY_TO_HOME, pay_status } from 'config/app.config';
import { get_table_empty } from 'common/loading';
import { findDOMNode } from 'react-dom';
import StdModal from 'common/std_modal';

export default class DetailModal extends Component {
  constructor(props){
    super(props);
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
  }
  render(){
    var { data, data: {products = []} } = this.props;
    var products = products.map( (n, i) => {
      return (
        <tr key={n.sku_id + '' + i}>
          <td>{n.name}</td>
          <td className="text-left">规格：{n.size}<br/>数量：{n.num}</td>
          <td className="text-left">
            <span className="nowrap">原价：￥{n.original_price / 100}</span><br/>
            <span className="nowrap">实际售价：￥{n.discount_price/100}</span>
          </td>
          <td>￥{n.amount/100}</td>
          <td>{n.choco_board}</td>
          <td>{n.greeting_card}</td>
          <td><input checked={n.atlas} disabled type="checkbox" /></td>
          <td>{n.custom_name}</td>
          <td>{n.custom_desc}</td>
        </tr>
      )
    })
    return (
    <StdModal ref="modal" title="查看订单信息" size="lg" footer={false} smartHide>
      <div className="strong-label">
        <div className="form-group form-inline">
          <label>{'　配送方式：'}</label>
          <span className="gray">{ DELIVERY_MAP[data.delivery_type] }</span>
        </div>
        <div className="form-group form-inline">
          <label>{'下单人信息：'}</label>
          <span className="gray">{`${data.owner_name}　${data.owner_mobile}`}</span>
        </div>
        <div className="form-group form-inline">
          <label>{'收货人信息：'}</label>
          <span className="gray">{`${data.recipient_name}　${data.recipient_mobile}`}</span>
        </div>
        <div className="form-group form-inline">
          <label>{'收货人地址：'}</label>
          <span className="gray">{
            (data.province_name || '') + ' ' +
            (data.city_name || '') + ' ' +
            (data.regionalism_name || '') + ' ' +
            (data.recipient_address || '')
          }</span>
        </div>
        {
          data.delivery_type == DELIVERY_TO_HOME //送货上门
            ? <div className="form-group form-inline">
                <label>{'标志性建筑：'}</label>
                <span className="gray">{data.recipient_landmark}</span>
              </div>
            : null
        }
        <div className="form-group form-inline">
          <label>{'　配送中心：'}</label>
          <span className="gray">{data.delivery_name}</span>
        </div>
        <div className="form-group form-inline">
          <label className="inline-block v-top">{'　支付方式：'}</label>
          <span className="inline-block gray">
            {data.pay_name ? [ data.pay_name, <br key="br1" /> ] : null}
            {data.src_name ? [ data.src_name + '　' + (data.coupon || ''), <br key="br2" /> ] : null}
            {pay_status[data.pay_status]}
          </span>
        </div>

        <div className="form-group form-inline">
          <label>{'　配送时间：'}</label>
          <span className="gray">{data.delivery_time}</span>
        </div>
        <div className="form-group form-inline">
          <label>{'　　　备注：'}</label>
          <span className="gray">{data.remarks}</span>
        </div>
        <div className="form-group form-inline">
          <label>{'　发票备注：'}</label>
          <span className="gray">{data.invoice}</span>
        </div>
        <hr className="dotted" />
        <div className="form-group form-inline">
          <label>{'　产品信息：'}</label>
        </div>
        <div className="table-responsive">
          <table className="table table-hover table-click text-center">
            <thead>
            <tr>
              <th>产品名称</th>
              <th>货品数量信息</th>
              <th>金额</th>
              <th>应收金额</th>
              <th>巧克力牌</th>
              <th>祝福贺卡</th>
              <th>产品图册</th>
              <th>自定义名称</th>
              <th>自定义描述</th>
            </tr>
            </thead>
            <tbody>
              { products.length ? products : get_table_empty() }
            </tbody>
          </table>
        </div>
      </div>
    </StdModal>
    )
  }
  show(){
    this.refs.modal.show();
  }
  hide(){
    this.refs.modal.hide();
  }
}

DetailModal.propTypess = {
  data: PropTypes.object.isRequired,
}