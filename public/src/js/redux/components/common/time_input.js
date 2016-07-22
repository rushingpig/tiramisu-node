import React, { Component } from 'react';
import { form } from 'utils/index';

export default class TimeInput extends Component {
  constructor(props){
    super(props);
    this.state = {
      hour: '',
      minute: '',
      hour_error: '',
      minute_error: '',
    };
    this.preventNotNumInput = this.preventNotNumInput.bind(this);
  }
  render(){
    var {hour, minute, hour_error, minute_error} = this.state;
    return (
      <div className="form-inline inline-block">
        <input 
          value={this.state.hour} 
          onKeyDown={this.preventNotNumInput}
          onChange={this.onHourChange.bind(this)} 
          className={`form-control input-xs time-input ${hour_error}`} />
        <span className="gray">{' : '}</span>
        <input 
          ref="minute"
          value={this.state.minute} 
          onKeyDown={this.preventNotNumInput}
          onChange={this.onMinuteChange.bind(this)} 
          className={`form-control input-xs time-input ${minute_error}`} />
      </div>
    )
  }
  val(){
    var { hour, minute, hour_error, minute_error } = this.state;
    return !hour || !minute ||  hour_error || minute_error 
        ? '' 
        : (hour > 9 ? hour : '0' + hour) + ':' + (minute > 9 ? minute : '0' + minute);
  }
  reset(){
    this.setState({
      hour: '',
      minute: '',
      hour_error: '',
      minute_error: '',
    })
  }
  onHourChange(e){
    var {value} = e.target, hour_error;
    if(form.isNumber(value) && value >= 0 && value < 24 && value.length <= 2){
      hour_error = '';
    }else{
      hour_error = 'error';
    }
    this.setState({ hour: value, hour_error }, this.checkTime.bind(this));
    if( !hour_error && value.length == 2){
      $(this.refs.minute).get(0).focus();
    }
  }
  onMinuteChange(e){
    var {value} = e.target, minute_error;
    if(form.isNumber(value) && value >= 0 && value < 60 && value.length <= 2){
      minute_error = '';
    }else{
      minute_error = 'error';
    }
    this.setState({ minute: e.target.value, minute_error }, this.checkTime.bind(this));
  }
  preventNotNumInput(e){
    if(form.isNotNumberInput(e.which)){
      e.preventDefault();
    }
  }
  checkTime(){
    var time = this.val();
    if(/\d{2}:\d{2}$/.test(time)){
      this.props.onOK( time );
    }
  }
}