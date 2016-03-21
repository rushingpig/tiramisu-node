import React, { Component, PropTypes } from 'react';
import StdModal from 'common/std_modal';
import { Noty } from 'utils/index';
/**
 * 扫描窗口
 */
class RotateLoading extends Component {
  render(){
    return (
      <div className="inline-block" {...this.props}>
        <span className="rotate-loading-1"></span>
        <span className="rotate-loading-2"></span>
        <span className="rotate-loading-3"></span>
      </div>
    )
  }
}
class ScanModal extends Component {
  constructor(props){
    super(props);
    this.state = {
      scanable: true,
      value: '',
      order_ids: [],
    }
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
  }
  render(){
    var content = this.state.order_ids.map( (n, i) => {
      return (
        <div key={n} className="mg-15 inline-block deleteable-row">
          <span className="strong">{n}</span>
          <span onClick={this.delete.bind(this, i)} className="del-btn space">×</span>
        </div>
      )
    })
    return (
      <StdModal onConfirm={this.onConfirm.bind(this)} onCancel={this.hide} ref="modal" title="批量扫描">
        <center>
          {
            this.state.scanable
            ? <h5 className="strong font-lg">
                可以扫描
                <RotateLoading style={{'marginLeft': 5}} />
              </h5>
            : <h5 className="text-danger font-lg">
                非扫描状态，请点击以下输入框
              </h5>
          }
        </center>
        <center>
          <div className="form-group mg-15 form-inline">
            <input 
              ref="scan_input" 
              value={this.state.value} 
              onChange={this.onInput.bind(this)} 
              type="text" 
              className="form-control input-xs long-input text-center"
              placeholder=""
            />
          </div>
        </center>
        <center>
          {content}
        </center>
      </StdModal>
    )
  }
  onInput(e){
    var { value } = e.target;
    var { order_ids } = this.state;
    if(value.length == 16){
      if(!order_ids.some(n => n == value)){
        this.setState({value: '', order_ids: order_ids.concat(value)});
      }else{
        this.setState({value: ''});
      }
    }else{
      this.setState({value})
    }
  }
  delete(i){
    this.state.order_ids.splice(i, 1);
    this.setState({order_ids: this.state.order_ids})
  }
  show(){
    this.refs.modal.show(function(){
      this.refs.scan_input.focus();
    }.bind(this));
  }
  hide(){
    $(this.refs.input).off();
    this.setState({value: '', order_ids: []});
  }
  componentDidMount(){
    $(this.refs.scan_input)
      .on('focus', function(){
        this.setState({scanable: true, value: ''})
      }.bind(this))
      .on('blur', function(){
        this.setState({scanable: false, value: ''})
      }.bind(this))
  }
  onConfirm(){
    var { order_ids } = this.state;
    if(order_ids.length){
      this.props.search(order_ids).done(this.refs.modal.hide);
    }else{
      Noty('warning', '没有订单')
    }
  }
};

ScanModal.propTypess = {
  search: PropTypes.func.isRequired,
}

export default ScanModal;