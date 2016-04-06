import React, {Component,PropTypes} from 'react';

export default class DeptModal extends Component{
  constructor(props){
    super(props);
    this.show=this.show.bind(this);
    this.hide=this.hide.bind(this);
    this.onCancel = this.onCancel.bind(this);
  }
  render(){
    return (
      <div ref="modal" aria-hidden="false" aria-labelledby="myModalLabel" role="dialog" className="modal fade">
        <div className="modal-backdrop fade"></div>
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <button onClick={this.onCancel} aria-hidden="true" data-dismiss="modal" className="close" type="button">×</button>
              <h4 className="modal-title">添加部门</h4>
            </div>
            <div className="modal-body">
              <div className="form-group form-inline">
                <label>{'　　部门名称：'}</label>
                <input type="text" className='form-control input-xs'/>
              </div>
              <div className="form-group form-inline">
                <label>{'部门职能描述：'}</label>
                <input type="text" className='form-control input-xs'/>
              </div>
              <div className="modal-footer">
                <button onClick={this.onCancel} type="button" className="btn btn-sm btn-default" data-dismiss="modal">取消</button>
                <button onClick={this.onConfirm.bind(this)} type="button" className="btn btn-sm btn-theme">确定</button>
              </div>
            </div>
          </div>
        </div>
      </div>      
      )

  }

  onCancel(){
  }
  onConfirm(){
    this.hide();
  }
  show(){
    $(this.refs.modal).modal('show');
  }
  hide(){
    $(this.refs.modal).modal('hide');
  }
}