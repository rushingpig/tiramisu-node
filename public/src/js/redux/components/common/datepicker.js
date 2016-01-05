import React, {PropTypes} from 'react';
import {dateFormat} from 'utils/index';

var DatePicker = React.createClass({
  getDefaultProps: function() {
    return {
      className: '',
      'redux-form': {},
    };
  },
  getInitialState: function() {
    return {
      date: this.props['redux-form'].value,
    }
  },
  componentWillReceiveProps: function(nextProps) {
    if (nextProps['redux-form'].value && (nextProps['redux-form'].value != this.props['redux-form'].value)) {
      $(function(){
        this.setState({
          date: nextProps['redux-form'].value,
        }, function() {
          this.initDatePicker().update();
        });
      }.bind(this))
    }
  },
  componentDidMount: function() {
    // $(function(){
    //   var dom_date = this.refs.date,
    //     $date = $(dom_date).datepicker({
    //       format: 'yyyy-mm-dd',
    //     }).on('changeDate', function(e) {
    //       setTimeout(function(){
    //         dom_date.value = e.target.value;
    //         dom_date.focus();
    //       })
    //       $date.data('datepicker').hide();
    //     });
    // }.bind(this));
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
        this.setState({date: e.target.value}, function(){
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
    //redux-from 中包含value
    return (
      <div style={{'display': 'inline-block'}}>
        <input ref="date" {...this.props['redux-form']}
           value={this.state.date} 
           className={`form-control input-sm ${this.props.className}`} />
      </div>
    );
  }
});

DatePicker.propTypes = {
  'redux-form': PropTypes.object.isRequired
};

export default DatePicker;