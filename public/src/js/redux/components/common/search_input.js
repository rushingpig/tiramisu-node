import React from 'react';

export default class SearchInput extends React.Component {
  constructor(props){
    super(props);
    this.searchHandler = this.searchHandler.bind(this);
  }
  render(){
    var { className, searching, size, placeholder, searchHandler } = this.props;
    var i_className = searching ? 'fa fa-spinner fa-spin disabled' : 'fa fa-search';
    return (
      <div className={`search-input ${className}`}>
        <input ref="input" 
          className={`form-control ${size}`} 
          placeholder={placeholder} 
          onKeyDown={this.keyDownHandler.bind(this)} />
        <i className={i_className} onClick={this.searchHandler}></i>
      </div>
    )
  }
  keyDownHandler(e){
    //enter键
    if(!this.props.searching && e.which == 13){
      this.searchHandler();
    }
  }
  searchHandler(){
    if(!this.props.searching){
      console.log('search: ' + this.refs.input.value);
      this.props.searchHandler(this.refs.input.value);
    }
  }
}

SearchInput.defaultProps = {
  className: '',
  searching: false,
  size: 'input-sm',
  placeholder: '',
  searchHandler: function(){}
}