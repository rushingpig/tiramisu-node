import React, { Component, PropTypes } from 'react';
import DatePicker from 'common/datepicker';
import Select from 'common/select';

export default class AlterStationModal extends Component {
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
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <button onClick={this.hide} aria-hidden="true" data-dismiss="modal" className="close" type="button">×</button>
            <h4 className="modal-title">修改配送</h4>
          </div>
          <div className="modal-body strong-label">
            <div className="form-group form-inline">
              <span className="gray">订单尚未生产，可直接更改！</span>
            </div>
            <div className="form-group form-inline">
              <label>{'　　配送方式：'}</label>
              <label><input type="radio" checked={true} name="delivery_type" /> 配送上门</label>{'　'}
              <label><input type="radio" checked={false} name="delivery_type" /> 门店自提</label>
            </div>
            <div className="form-group form-inline">
              <label>{'　　配送时间：'}</label>
              <DatePicker />{' '}
              <Select options={[]} className="input-xs" />
            </div>
            <div className="form-group form-inline">
              <label>{'修改配送地址：'}</label>
              <Select options={[]} className="input-xs" />{' '}
              <input className="form-control input-xs" />
            </div>
            <div className="form-group form-inline">
              <label>{'修改配送时间：'}</label>
              <Select options={[]} className="input-xs" />
            </div>
          </div>
          <div className="modal-footer">
            <button onClick={this.onCancel} type="button" className="btn btn-sm btn-default" data-dismiss="modal">取消</button>
            <button onClick={this.onConfirm} type="button" className="btn btn-sm btn-theme">确定</button>
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