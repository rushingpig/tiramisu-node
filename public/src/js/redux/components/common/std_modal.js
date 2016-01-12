import React, { Component, PropTypes } from 'react';

export default class StdModal extends Component {
  constructor(props){
    super(props);
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
  }
  render(){
    var { size, title, submitting, onConfirm } = this.props;
    return (
    <div ref="__modal" aria-hidden="false" aria-labelledby="myModalLabel" role="dialog" className="modal fade" >
      <div className="modal-backdrop fade"></div>
      <div className={`modal-dialog modal-${size}`}>
        <div className="modal-content">
          <div className="modal-header">
            <button aria-hidden="true" onClick={this.hide} data-dismiss="modal" className="close" type="button">×</button>
            <h4 className="modal-title">{title}</h4>
          </div>
          <div className="modal-body">
            {this.props.children}
          </div>
          <div className="modal-footer">
            <button onClick={this.hide} type="button" className="btn btn-sm btn-default" data-dismiss="modal">取消</button>
            <button 
              onClick={onConfirm} 
              disabled={submitting} 
              data-submitting={submitting} type="button" className="btn btn-sm btn-theme">确定</button>
          </div>
        </div>
      </div>
    </div>
    )
  }
  show(){
    $(this.refs.__modal).modal('show');
  }
  hide(){
    if(this.props.submitting){
      return;
    }
    this.props.onCancel();
    $(this.refs.__modal).modal('hide');
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
  onCancel: function(){},
}