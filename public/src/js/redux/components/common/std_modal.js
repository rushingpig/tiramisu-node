import React, { Component, PropTypes } from 'react';

export default class StdModal extends Component {
  constructor(props){
    super(props);
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
  }
  render(){
    var { size, title, submitting, loading, disabled, onConfirm, footer } = this.props;
    return (
    <div ref="__modal" className="modal" >
      <div onClick={this.smartHide.bind(this)} className="modal-backdrop"></div>
      <div className={`modal-dialog modal-${size}`}>
        <div className="modal-content">
          <div className="modal-header">
            <button aria-hidden="true" onClick={this.hide} data-dismiss="modal" className="close" type="button">×</button>
            <h4 className="modal-title">{title}</h4>
          </div>
          <div className="modal-body">
            {loading && <div className="loading-wrap text-center"><i className="fa fa-spin fa-lg fa-spinner"></i></div>}
            {this.props.children}
          </div>
          {
            footer
            ? <div className="modal-footer">
                <button onClick={this.hide} type="button" className="btn btn-sm btn-default" data-dismiss="modal">取消</button>
                <button 
                  onClick={onConfirm} 
                  disabled={submitting || loading || disabled} 
                  data-submitting={submitting} type="button" className="btn btn-sm btn-theme">确定</button>
              </div>
            : null
          }
        </div>
      </div>
    </div>
    )
  }
  show(callback){
    //去掉了modal显示动画
    // $(this.refs.__modal).modal('show').on('shown.bs.modal', callback);
    $(this.refs.__modal).show();
    callback && callback();
  }
  hide(){
    if(this.props.submitting){
      return;
    }
    this.props.onCancel();
    // $(this.refs.__modal).modal('hide');
    $(this.refs.__modal).hide();
  }
  smartHide(){
    if( this.props.smartHide ){
      this.hide();
    }
  }
  componentWillUnmount(){
    // $(this.refs.__modal).off('shown.bs.modal');
  }
}

StdModal.propTypess = {
  title: PropTypes.any.isRequired,
}

StdModal.defaultProps = {
  size: '', // lg
  title: 'TODO',
  submitting: false,
  onConfirm: function(){},
  onCancel: function(){},  //modal关闭前需执行的callback
  footer: true, //是否需要 modal-footer
  smartHide: false, //是否点击遮罩层，也能够自动隐藏模态框
}