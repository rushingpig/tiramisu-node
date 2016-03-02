import React, {Component, PropTypes} from 'react';
import { render, findDOMNode } from 'react-dom';

export default class Autocomplete extends Component {
	constructor(props){
    super(props);
    this.searchHandler = this.searchHandler.bind(this);
    this.focusHandler = this.focusHandler.bind(this);
  }
  render(){
    var { className, searching, size, placeholder, searchHandler, focusHandler } = this.props;
    var i_className = searching ? 'fa fa-spinner fa-spin disabled' : 'fa fa-search';
    return (
      <div className={`search-input ${className}`}>
        <input ref="input" 
          className={`form-control ${size}`} 
          placeholder={placeholder} 
          onFocus={this.focusHandler.bind(this)}
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
      var station_name = this.refs.input.value;
      if(station_name !== ''){
        this.props.searchHandler({station_name: this.refs.input.value});
      }
    }
  }
  focusHandler(){
  	var { options } = this.props;
  	var $inp = $(findDOMNode(this.refs.input));
    var stations = [];
    options.forEach(function(n){
      stations.push(n['text']);
    });
    LazyLoad('autocomplete', () => {
      $inp.autocomplete({
        source: stations
      });
    });
  }
}

Autocomplete.defaultProps = {
  className: '',
  searching: false,
  size: 'input-xs',
  placeholder: '',
  searchHandler: function(){}
}