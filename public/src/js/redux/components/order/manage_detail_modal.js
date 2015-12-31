import React, { Component, PropTypes } from 'react';

export default class DetailModal extends Component {
  constructor(props){
    super(props);
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
  }
  componentWillReceiveProps(nextProps){
    if(nextProps['data-id'] != this.props['data-id']){
      this.show();
    }
  }
  render(){
    return (
    <div ref="modal" aria-hidden="false" aria-labelledby="myModalLabel" role="dialog" className="modal fade" >
      <div className="modal-backdrop fade"></div>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <button onClick={this.onCancel} aria-hidden="true" data-dismiss="modal" className="close" type="button">×</button>
            <h4 className="modal-title">查看订单信息</h4>
          </div>
          <div className="modal-body strong-label">
            <div className="form-group form-inline">
              <label>{'　配送方式：'}</label>
              <span className="gray">配送上门</span>
            </div>
            <div className="form-group form-inline">
              <label>{'下单人信息：'}</label>
              <span className="gray">{'蝴蝶　　15299998888'}</span>
            </div>
            <div className="form-group form-inline">
              <label>{'收货人信息：'}</label>
              <span className="gray">{'蝴蝶　　15299998888'}</span>
            </div>
            <div className="form-group form-inline">
              <label>{'收货人地址：'}</label>
              <span className="gray">广东省深圳市南山区xxxxx</span>
            </div>
            <div className="form-group form-inline">
              <label>{'标志性建筑：'}</label>
              <span className="gray">中兴通讯</span>
            </div>
            <div className="form-group form-inline">
              <label className="inline-block">{'　支付方式：'}<br/>{' '}<br/>{' '}<br/></label>
              <span className="inline-block gray">第三方支付<br/>团购密码 xxxxxx<br/>已付款</span>
            </div>
            <div className="form-group form-inline">
              <label>{'　配送时间：'}</label>
              <span className="gray">中兴通讯</span>
            </div>
            <div className="form-group form-inline">
              <label>{'　　　备注：'}</label>
              <span className="gray">中兴通讯</span>
            </div>
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
                  <td>自由拼</td>
                  <td className="text-left">规格：约2磅<br/>数量：1</td>
                  <td className="text-left">原价：￥138<br/>实际售价：￥69</td>
                  <td>￥0</td>
                  <td>妈妈生日快乐</td>
                  <td>生日快乐</td>
                  <td><input checked={true} disabled type="checkbox" /></td>
                  <td>单恋黑森林，榴莲香雪</td>
                  <td>2磅1/4，方形</td>
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
    this.show();
  }
  show(){
    $(this.refs.modal).modal('show');
  }
  hide(){
    $(this.refs.modal).modal('hide');
  }
}

// DetailModal.PropTypes = {
//   dispatch: PropTypes.func.isRequired,
// }