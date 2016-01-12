import React, {PropTypes} from 'react';

var NumberPicker = React.createClass({
  getDefaultProps: function() {
    return {
      step: 1,
      value: 1,
      'lower_limit': 1,
      'upper_limit': 100000
    };
  },
  getInitialState: function() {
    return {
      value: this.props.value
    }
  },
  componentDidMount: function() {
    
  },
  render: function(){
    return (
      <div className="number-picker form-inline">
        <a onClick={this.minus} href="javascript:;"><i className="fa fa-minus"></i></a>
        <input value={this.state.value} onChange={this.input} className="form-control input-xs" />
        <a onClick={this.add} href="javascript:;"><i className="fa fa-plus"></i></a>
      </div>
    );
  },
  minus: function(){
    var value = parseInt(this.state.value) || this.props.lower_limit;
    var { step, lower_limit } = this.props;
    value = value - step >= lower_limit ? value - step : value;
    this.setState({value: value}, function(){
      this.props.onChange(value);
    });
  },
  add: function(){
    var value = parseInt(this.state.value) || this.props.lower_limit;
    var { step, upper_limit } = this.props;
    value = value + step <= upper_limit ? value + step : value;
    this.setState({value: value}, function(){
      this.props.onChange(value);
    });
  },
  input: function(e){
    var v = e.target.value.replace(/[^\d]/g, '');
    console.log(v);
    if(v > this.props.upper_limit){
      v = v.substring(0, v.length - 1);
    }
    this.setState({value: v});
  }
});

export default NumberPicker;