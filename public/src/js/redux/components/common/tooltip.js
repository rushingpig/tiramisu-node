import React, { PropTypes } from 'react';

var ToolTip = React.createClass({
  propTypes: {
    children: PropTypes.object.isRequired
  },
  getDefaultProps: function() {
    return {
      placement: 'right',
      padding: 7,
    };
  },
  getInitialState: function() {
    return {
      show: false,
      transition: false, //是否过渡中
      style: { padding: this.props.padding }
    };
  },
  render(){
    return (
      <div 
        ref="main"
        className={`${this.state.show ? '' : 'hidden'}`}
        onClick={(e) => e.stopPropagation()}
        onMouseEnter={this.show}
        onMouseLeave={this._hideReal}>
          <div ref="tool-tip" className="tool-tip" style={this.state.style}>
            {/*children只能是单元素*/}
            {this.props.children}
          </div>
      </div>
    )
  },
  show(){
    this.setState({show: true, transition: false}, () => {
      var $parent = $(this.refs.main).parent();
      var base_w = $parent.outerWidth(); //tool-tip父组件的大小
      var base_h = $parent.outerHeight();
      var $children = $(this.refs['tool-tip']);
      var w = $children.outerWidth(); //tool-tip的大小
      var h = $children.outerHeight();
      var style = null;
      switch( this.props.placement ){
        //全都是靠右
        case 'right':
        case 'top':
        case 'bottom':
        case 'left':
          style = { top: Math.ceil((base_h - h) / 2 ), left: base_w + 2}; break; //3 代表间隙
        default:
          console.error('tooltip placement error: ', this.props.placement);
          break;
      }
      style.padding = this.props.padding;
      this.setState({ style });
    });
  },
  hide(){
    //延迟隐藏
    this.setState({transition: true}, () => {
      setTimeout(() => {
        this.state.transition && this._hideReal()
      }, 300);
    })
  },
  _hideReal(){
    this.setState({show: false, transition: false})
  }
})

export default ToolTip;