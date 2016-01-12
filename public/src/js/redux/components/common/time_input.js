import React, { Component } from 'react';
import { form } from 'utils/index';

export default class TimeInput extends Component {
  constructor(props){
    super(props);
    this.state = {
      hour: this.props.hour,
      minute: this.props.minute,
      hour_error: '',
      minute_error: '',
    }
  }
  render(){
    var {hour, minute, hour_error, minute_error} = this.state;
    return (
      <div className="form-inline inline-block">
        <input 
          value={this.state.hour} 
          onChange={this.onHourChange.bind(this)} 
          className={`form-control input-xs time-input ${hour_error}`} />
        <span className="gray">{' : '}</span>
        <input 
          value={this.state.minute} 
          onChange={this.onMinuteChange.bind(this)} 
          className={`form-control input-xs time-input ${minute_error}`} />
      </div>
    )
  }
  val(){
    return this.state.hour + ':' + this.state.minute
  }
  onHourChange(e){
    var {value} = e.target, hour_error;
    if(form.isNumber(value) && value >= 0 && value < 24){
      hour_error = '';
    }else{
      hour_error = 'error';
    }
    this.setState({ hour: value, hour_error });
  }
  onMinuteChange(e){
    var {value} = e.target, minute_error;
    if(form.isNumber(value) && value >= 0 && value < 60){
      minute_error = '';
    }else{
      minute_error = 'error';
    }
    this.setState({ minute: e.target.value, minute_error });
  }
}