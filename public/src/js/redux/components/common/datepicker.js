import React, {PropTypes} from 'react';
import {dateFormat, form } from 'utils/index';

var DatePicker = React.createClass({
  getDefaultProps: function() {
    return {
      className: '',
      'redux-form': null,
      editable: false,
      upperLimit: undefined,
      lowerLimit: undefined,
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

    } else if (nextProps.value != this.props.value){
      this.setState({ date: nextProps.value })
    }
  },
  componentDidUpdate: function(prevProps) {
    if (
      'upperLimit' in prevProps && this.props.upperLimit !== prevProps.upperLimit
      || 'lowerLimit' in prevProps && this.props.lowerLimit !== prevProps.lowerLimit
    ) {
      $(this.refs.date).data('datepicker').destroy();
      this.initDatePicker();
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
    var {lowerLimit, upperLimit} = this.props;
    lowerLimit = new Date(lowerLimit + ' 00:00:00');
    upperLimit = new Date(upperLimit + ' 00:00:00');

    if(!$date){
      $date = $dom_date.datepicker({
        format: 'yyyy-mm-dd',
        onRender: (lowerLimit || upperLimit) && function(date){
          if(date < lowerLimit || date > upperLimit){
            return 'disabled'
          }
        }
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
      }.bind(this))
      .on('click', function(){
        $date.data('datepicker').show();
      });
    }
    return $date;
  },
  render: function(){
    var redux_form = this.props['redux-form'];
    var editable = this.props.editable;
    var spreadProps;
    if(redux_form){
      spreadProps = editable ? redux_form : { ...redux_form, onChange: function(){} };
    }else{
      spreadProps = { onChange: editable ? this.props.onChange : function(){} };
    }
    //redux-from 中包含value
    return (
      <div style={{'display': 'inline-block'}}>
        <input ref="date" {...spreadProps}
           value={this.state.date} 
           className={`form-control input-xs ${this.props.className}`} />
      </div>
    );
  },
  componentWillUnmount() {
    var $dom_date = $(this.refs.date);
    var $date = $dom_date.data('datepicker');
    $date.destroy();
  }
});

export default DatePicker;