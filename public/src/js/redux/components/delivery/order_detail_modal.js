import React, { Component, PropTypes } from 'react';
import { DELIVERY_MAP, DELIVERY_TO_HOME, pay_status, order_status as ORDER_STATUS } from 'config/app.config';
import { get_table_empty } from 'common/loading';
import { findDOMNode } from 'react-dom';
import { form } from 'utils/index';

const Info = props => (
    <div className="mg-4">
        <label>{props.label}</label>
        <span className="theme">{props.children}</span>
    </div>
)

export default class DetailModal extends Component {
  constructor(props){
    super(props);
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
  }
  render(){
    var { data, data: {products = []}, all_order_srcs, all_pay_modes } = this.props;
    var { isNumber } = form;
    var _order_status = ORDER_STATUS[data.status] || {};
    var products = products.map( n => {
      return (
        <tr key={n.sku_id}>
          <td>{n.name}</td>
          <td className="text-left">规格：{n.size}<br/>数量：{n.num}</td>
          <td className="text-left">原价：￥{n.original_price / 100}<br/>实际售价：￥{n.discount_price/100}</td>
          <td>{n.choco_board}</td>
          <td>{n.greeting_card}</td>
          <td><input checked={n.atlas} disabled type="checkbox" /></td>
          <td>{n.custom_name}</td>
          <td>{n.custom_desc}</td>
        </tr>
      )
    });

    /**
     * 这里就不要使用封装更好的StdModal了
     */
    return (
      <div ref="modal" aria-hidden="false" aria-labelledby="myModalLabel" role="dialog" className="modal fade" >
        <div ref="modal-backdrop" className="modal-backdrop fade"></div>
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <button aria-hidden="true" data-dismiss="modal" className="close" type="button">×</button>
              <h4 className="modal-title">查看订单详情</h4>
            </div>
            <div className="modal-body strong-label">
              <div className="form-group form-inline">
                <div className="row">
                  <div className="col-xs-6" style={{paddingLeft: 25}}>
                    <Info label="订单来源：">{ all_order_srcs[data.src_id] }</Info>
                    <Info label="支付方式：">{ all_pay_modes[data.pay_modes_id] }</Info>
                    <Info label="支付状态：">{ pay_status[data.pay_status] }</Info>
                    <Info label="　验证码：">{ data.coupon || ' -' }</Info>
                    <Info label="配送方式：">{ DELIVERY_MAP[data.delivery_type] }</Info>
                    {
                      data.invoice && (
                        <Info label="发票内容：">{ data.invoice }</Info>
                      )
                    }
                    <Info label="所属城市：">{data.city_name}</Info>
                    {
                      data.delivery_name && (
                        <Info label="　配送站：">{data.delivery_name}</Info>
                      )
                    }
                  </div>
                  <div className="col-xs-6">
                    <Info label="　总金额：">
                      {
                        isNumber( data.total_original_price )
                          ? '￥' + data.total_original_price / 100
                          : ' - '
                      }
                    </Info>
                    <div className="">
                      <label>{'实际金额：'}</label>
                      <span className="theme">
                        {
                          isNumber( data.total_discount_price )
                            ? '￥' + data.total_discount_price / 100
                            : ' - '
                        }
                      </span>
                    </div>
                    <div className="">
                      <label>{'应收金额：'}</label>
                      <span className="theme">
                        {
                          isNumber( data.total_amount )
                            ? '￥' + data.total_amount / 100
                            : ' - '
                        }
                      </span>
                    </div>
                  </div>
                </div>
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
          </div>
        </div>
      </div>
    )
  }
  componentDidMount(){
    $(this.refs['modal-backdrop']).on('click', this.hide);
  }
  componentWillUnmount(){
    $(this.refs['modal-backdrop']).off('click', this.hide);
  }
  show(){
    $(this.refs.modal).modal('show');
  }
  hide(){
    $(this.refs.modal).modal('hide');
  }
}

DetailModal.PropTypes = {
  data: PropTypes.object.isRequired,
}