import React, {Component, PropTypes} from 'react';
import { render, findDOMNode } from 'react-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as StationsAction from 'actions/station_manage';

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
  componentDidMount() {
    setTimeout(function(){
      var { list } = this.props; 
      var $inp = $(findDOMNode(this.refs.input));
      LazyLoad('autocomplete', function(){
        var stations = [];
        list.forEach(function(n){
          if(n.text){
            stations.push(n.text);
          }
        });
        $inp.autocomplete({
          source: stations
        });
      });
    }.bind(this), 0)

  }
  componentWillUnmount() {
    var inp = $(findDOMNode(this.refs.input));
    try{
      inp.autocomplete('destroy');
    }catch(e){
      console.log(e);
    }
  }
  keyDownHandler(e){
    //enter键
    if(!this.props.searching && e.which == 13){
      this.searchHandler();
    }
  }
  searchHandler(){
    if(!this.props.searching){
      var station_name = this.refs.input.value;
      if(station_name !== ''){
        this.props.searchHandler({station_name: this.refs.input.value,page_no: 0,page_size: 1});
      }
    }
  }
  focusHandler(){
    
  }
}

Autocomplete.defaultProps = {
  className: '',
  searching: false,
  size: 'input-xs',
  placeholder: '',
  searchHandler: function(){}
}