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
  componentWillReceiveProps(nextProps){
    if( nextProps.value != this.props.value ){
      this.setState({ value: nextProps.value })
    }
  },
  componentDidMount: function() {
    
  },
  render: function(){
    return (
      <div className="number-picker form-inline">
        <a onClick={this.minus} href="javascript:;"><i className="fa fa-minus"></i></a>
        <input value={this.state.value} onChange={this.input} onBlur={this.check} className="form-control input-xs" />
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
    if(v > this.props.upper_limit){
      v = v.substring(0, v.length - 1);
    }
    this.setState({value: v}, function(){
      this.props.onChange(v);
    });
  },
  check: function(){
    if(!this.state.value || this.state.value == 0){
      this.setState({ value: 1}, function(){
        this.props.onChange(1);
      });
    }
  }
});

export default NumberPicker;