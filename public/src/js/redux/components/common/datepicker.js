import React, {PropTypes} from 'react';
import {dateFormat, form } from 'utils/index';

var DatePicker = React.createClass({
  getDefaultProps: function() {
    return {
      className: '',
      'redux-form': null,
      editable: false,
    };
  },
  getInitialState: function() {
    var redux_form = this.props['redux-form'];
    return {
      date: redux_form ? redux_form.value : this.props.value,
    }
  },
  componentWillReceiveProps: function(nextProps) {
    if (
      nextProps['redux-form']
      && nextProps['redux-form'].value != undefined 
      && (nextProps['redux-form'].value != this.props['redux-form'].value)
    ) {
      $(function(){
        this.setState({
          date: nextProps['redux-form'].value,
        }, function() {
          if(form.isDate(nextProps['redux-form'].value))
            this.initDatePicker().update();
        });
      }.bind(this))

    }else if(nextProps.value != this.props.value){
      this.setState({ date: nextProps.value })
    }
  },
  componentDidMount: function() {
    $(function(){
      this.initDatePicker();
    }.bind(this));
  },
  initDatePicker: function(){
    var $dom_date = $(this.refs.date);
    var $date = $dom_date.data('datepicker');
    if(!$date){
      $date = $dom_date.datepicker({
        format: 'yyyy-mm-dd',
      }).on('changeDate', function(e) {
        var value = e.target.value;
        this.props.onChange && this.props.onChange(value);
        this.setState({date: value}, function(){
          // setTimeout(function(){
            $dom_date.focus();
            $dom_date.blur();
            $date.data('datepicker').hide();
          // }, 0);
        });
      }.bind(this));
    }
    return $date;
  },
  render: function(){
    var spreadProps = {onChange: function(){}};
    if(!this.props.editable && this.props['redux-form']){
      this.props['redux-form'].onChange = function(){};
      spreadProps = this.props['redux-form'];
    }
    //redux-from 中包含value
    return (
      <div style={{'display': 'inline-block'}}>
        <input ref="date" {...spreadProps}
           value={this.state.date} 
           className={`form-control input-xs ${this.props.className}`} />
      </div>
    );
  }
});

export default DatePicker;