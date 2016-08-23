import React, { PropTypes } from 'react';
const DropDown = React.createClass({
  getDefaultProps: function () {
    return {
      btnSize: 'btn-xs',
      btnColor: 'btn-info',
      frontBtnClass: '',
      frontBtnStyle: undefined,
      noText: false,
      noCaret: false,
      dropdownStyle: null,
      options: [],  //--> list<obj:{id, text}>
      active: false, //为true时,一旦下拉选项被选中，则将拥有激活背景色（表示状态用）
      active_id: -9888,
      onChoose: function(){ console.warn('请给DropDown控件添加onChoose处理回调函数') },
      onClick: null //点击dropdown的button时的事件
    }
  },
  _defaultOnClick: function(){
    $(this.refs.dropDownMenu).show();
    $('body').on('click', this._hideDropDownMenu);
  },
  _onClick: function (item) {
    if(this.props.active){
      this.setState({active_id: item.id});
    }
    if(item.onClick){
      item.onClick();
    }else{
      this.props.onChoose(item);
    }
  },
  _hideDropDownMenu: function(){
    $(this.refs.dropDownMenu).hide();
    $('body').off('click', this._hideDropDownMenu);
  },
  render: function () {
    var active_id = this.props.active_id;
    var list = this.props.options.map( (n, i) => {
      //n.rebuild : 重新自定义结构
      //n.hide    : 是否隐藏
      if(n.hide){ return null; }
      return (
        <li key={'drop_down'+i} onClick={this._onClick.bind(this, n)} style={{'display': n.hide ? 'none' : 'block'}}>{
          n.rebuild
            ? n.text
            : <a className={active_id == n.id ? 'active' : ''} href="javascript:void(0)" >{n.text}</a>
        }</li>
      );
    });
    var { btnSize, btnColor, frontBtnClass, frontBtnStyle, noText, noCaret } = this.props;
    return (
      <div className="btn-group" style={this.props.style}>
        <button
          onClick={this.props.onClick || this._defaultOnClick}
          className={'btn dropdown-toggle '+ btnSize+ ' ' + btnColor + ' ' + frontBtnClass}
          style={frontBtnStyle}
          >
          {this.props.children}
          { noCaret ? null : <span className="caret" style={{marginLeft: noText ? 0 : 8}}></span>}
        </button>
        <ul ref="dropDownMenu" className="dropdown-menu" style={ this.props.dropdownStyle } >
          {list}
        </ul>
      </div>
    )
  }
});

DropDown.propTypes = {
  options: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string,
    text: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
    onClick: PropTypes.func,
  }))
}
export default DropDown;
