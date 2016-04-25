import React from 'react';
import ReactDOM from 'react-dom';

/***
 *
 * 用法:
 *  <Modal title='modal'>
 *      Hello, World!
 *  </Modal>
 *
 * 参数:
 *  title     {String}   标题
 *  size      {String}   sm 或 lg
 *  disabled  {Bool}     禁用关闭与确定按钮
 *  show      {Bool}     是否显示，默认为false
 *  onConfrim {Function} 确定句柄
 *  onCancel  {Function} 取消句柄
 *
***/

const Modal = React.createClass({
  getDefaultProps() {
    return {
      size: '',
      title: '',
      show: true,
      disabled: false,
      onConfirm: false,
      onClose: false
    }
  },
  componentWillMount() {
    this.wrap = document.createElement('div');
    this.backDrop = document.createElement('div');
    this.backDrop.className = 'modal-backdrop fade in';
  },
  render() {
    return null;
  },
  componentDidMount() {
    this.renderChild();
  },
  componentDidUpdate() {
    this.renderChild();
  },
  renderChild() {

    let thisProps = this.props;
    let size = '';

    if (thisProps.size === 'lg' || (thisProps.size === 'sm')) {
      size = 'modal-' + thisProps.size;
    }

    const modalNode = (
      <div className="modal" role="dialog" style={{display: thisProps.show ? 'block' : 'none'}}>
        <div className={"modal-dialog " + size}>
          <div className="modal-content">
            <div className="modal-header">
              {thisProps.title}
              <button type="button" className="close" onClick={thisProps.onClose}>
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              {thisProps.children}
            </div>
            <div className="modal-footer">
              <button className="btn btn-sm btn-default" onClick={thisProps.onClose}>关闭</button>
              {
                typeof thisProps.onConfirm === 'function' ? (
                  <button className="btn btn-sm btn-theme" onClick={thisProps.onConfirm} disabled={thisProps.disabled}>确定</button>
                ) : undefined
              }
            </div>
          </div>
        </div>
      </div>
    );

    if (this.props.show) {
      if (this.backDrop.parentNode === null)
        document.body.appendChild(this.backDrop);
      if (this.wrap.parentNode === null)
        document.body.appendChild(this.wrap);
    } else {
      if (this.backDrop.parentNode !== null)
        document.body.removeChild(this.backDrop);
      if (this.wrap.parentNode !== null)
        document.body.removeChild(this.wrap);
    }

    ReactDOM.render(modalNode, this.wrap);
  },
  componentWillUnmount() {
    ReactDOM.unmountComponentAtNode(this.wrap);

    if (this.backDrop.parentNode !== null)
      document.body.removeChild(this.backDrop);

    if (this.wrap.parentNode !== null)
      document.body.removeChild(this.wrap);
  }
});

export default Modal;