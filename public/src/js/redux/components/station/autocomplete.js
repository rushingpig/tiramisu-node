import React, {Component, PropTypes} from 'react';
import { render, findDOMNode } from 'react-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as StationsAction from 'actions/station_manage';

export default class Autocomplete extends Component {
  constructor(props){
    super(props);
  }
  render(){
    var { value, className, searching, size, placeholder } = this.props;
    var i_className = searching ? 'fa fa-spinner fa-spin disabled' : 'fa fa-search';
    return (
      <div className={`search-input ${className}`}>
        <input ref="input" 
          value={value}
          className={`form-control ${size}`} 
          placeholder={placeholder} 
          onChange={this.onChange.bind(this)}
        />
      </div>
    )
  }
  componentWillReceiveProps(nextProps){
    if( nextProps.list.length && nextProps.list != this.props.list ){
      var self = this;
      LazyLoad('autocomplete', () => {
        $(this.refs.input).autocomplete({
          source: nextProps.list,
          change: function( event, ui ) {
            self.props.searchHandler(event.target.value);
          }
        });
      })
    }
  }
  componentDidMount() {

  }
  componentWillUnmount() {
    var inp = $(findDOMNode(this.refs.input));
    try{
      inp.autocomplete('destroy');
    }catch(e){
      console.log(e);
    }
  }
  onChange(e){
    this.props.onChange(e.target.value);
  }
}

Autocomplete.defaultProps = {
  className: '',
  searching: false,
  size: 'input-xs',
  placeholder: '',
  searchHandler: function(){}
}