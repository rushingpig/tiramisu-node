import React from 'react';
import ReactDOM from 'react-dom';

/***
 *
 * react版 Tooltip控件
 * 
 * 用法:
 * <Tooltip msg="工具提示">
 *     <button>按钮</button>
 * </Tooltip>
 * 
 * 参数:
 * msg {String} 提示文本
 * 
 * 其它:
 * 只允许有一个子节点
 *
***/

const triangle = document.createElement('div');

Object.assign(triangle.style, {
  position: 'absolute',
  width: '0',
  height: '0',
  borderStyle: 'solid',
  borderWidth: '7px 8px 0 8px',
  borderColor: 'rgba(0, 0, 0, 0)',
  borderTopColor: '#333',
  left: '50%',
  top: '100%',
  transform: 'translateX(-50%)'
});

const Tooltip = React.createClass({
  getDefaultProps() {
    return {
      msg: ''
    }
  },
  componentWillMount() {
    const childrenCount = React.Children.count(this.props.children);
    if (childrenCount !== 1) {
      throw new RangeError("Tooltip Component can only accept one children Element");
    }
  },
  render() {
    return this.props.children;
  },
  componentWillReceiveProps(nextProps) {
    this.wrap.innerText = nextProps.msg;
    this.wrap.appendChild(triangle);
  },
  componentDidMount() {

    if (!this.props.msg) {
      return;
    }

    this.target = ReactDOM.findDOMNode(this);
    this.wrap = document.createElement('div');

    this.wrap.innerText = this.props.msg;
    this.wrap.appendChild(triangle);

    window.addEventListener('mousewheel', this.handleMouseWheel);
    this.target.addEventListener('mouseenter', this.handleMouseEnter);
    this.target.addEventListener('mouseleave', this.handleMouseLeave);
  },
  componentWillUnmount() {

    if (this.wrap.parentNode)
      document.body.removeChild(this.wrap);

    window.removeEventListener('mousewheel', this.handleMouseWheel);
    this.target.removeEventListener('mouseenter', this.handleMouseEnter);
    this.target.removeEventListener('mouseleave', this.handleMouseLeave);
  },
  calcStyle() {
    const targetBCR = this.target.getBoundingClientRect()

    const style = {
      position: 'absolute',
      top: targetBCR.top + 'px',
      left: (targetBCR.left + Math.trunc(targetBCR.width/2)) + 'px',
      backgroundColor: '#333',
      color: '#fff',
      borderRadius: '5px',
      padding: '5px',
      transform: 'translate(-50%, -100%)',
      marginTop: '-10px',
      zIndex: 10000,
      fontSize: '10px'
    }

    Object.assign(this.wrap.style, style);
  },
  handleMouseEnter(event) {
    this.calcStyle();
    document.body.appendChild(this.wrap);
  },
  handleMouseWheel(event) {
    this.calcStyle();
  },
  handleMouseLeave(event) {
    document.body.removeChild(this.wrap);
  }
});

export default Tooltip;