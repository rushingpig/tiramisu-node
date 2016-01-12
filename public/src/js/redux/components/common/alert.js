import React, { Component, PropTypes } from 'react';

export default class Alert extends Component {
  render(){
    var {type} = this.props;
    return (
      <div className={`alert alert-block alert-${type} fade in`}>
        <button type="button" className="close close-xs" data-dismiss="alert">
            <i className="fa fa-times"></i>
        </button>
        {this.props.children}
      </div>
    )
  }
}

Alert.PropTypes = {
  type: PropTypes.string.isRequired
}