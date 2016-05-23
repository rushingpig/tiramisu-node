import React from 'react';

export default class SearchInput extends React.Component {
  constructor(props){
    super(props);
    this.searchHandler = this.searchHandler.bind(this);
  }
  render(){
    var { id, className, searching, size, placeholder, searchHandler, style} = this.props;
    var i_className = searching ? 'fa fa-spinner fa-spin disabled' : 'fa fa-search';
    return (
      <div className={`search-input ${className}`}>
        <input ref="input" 
          {...this.props}
          className={`form-control ${size}`} 
          placeholder={placeholder} 
          onKeyDown={this.keyDownHandler.bind(this)} />
        <i className={i_className} onClick={this.searchHandler}></i>
      </div>
    )
  }
  keyDownHandler(e){
    //enter键
    if(!this.props.searching && e.which == 13 && e.target.value){
      this.searchHandler();
    }
  }
  searchHandler(){
    if(!this.props.searching){
      this.props.searchHandler(this.refs.input.value);
    }
  }
}

SearchInput.defaultProps = {
  className: '',
  searching: false,
  size: 'input-xs',
  placeholder: '',
  searchHandler: function(){}
}