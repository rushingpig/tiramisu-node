import React, { Component, PropTypes } from 'react';

export default class StdModal extends Component {
  constructor(props){
    super(props);
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
  }
  render(){
    var { size, title, submitting, loading, onConfirm, footer } = this.props;
    return (
    <div ref="__modal" aria-hidden="false" aria-labelledby="myModalLabel" role="dialog" className={`modal ${loading ? 'loading' : ''} fade`} >
      <div className="modal-backdrop fade"></div>
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
                  disabled={submitting || loading} 
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
    $(this.refs.__modal).modal('show').on('shown.bs.modal', callback);
  }
  hide(){
    if(this.props.submitting){
      return;
    }
    this.props.onCancel();
    $(this.refs.__modal).modal('hide');
  }
  componentWillUnmount(){
    $(this.refs.__modal).off('shown.bs.modal');
  }
}

StdModal.PropTypes = {
  title: PropTypes.any.isRequired,
}

StdModal.defaultProps = {
  size: '', // lg
  title: 'TODO',
  submitting: false,
  onConfirm: function(){},
  onCancel: function(){},  //modal关闭前需执行的callback
  footer: true, //是否需要 modal-footer
}