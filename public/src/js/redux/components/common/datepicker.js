import React from 'react';
import {dateFormat} from '../../utils/index';

var DatePicker = React.createClass({
  getDefaultProps: function() {
    return {
      date: '',
      className: '',
    };
  },
  getInitialState: function() {
    return {
      date: this.props.date,
    }
  },
  componentWillReceiveProps: function(nextProps) {
    if (nextProps.date != this.props.date) {
      this.setState({
        date: nextProps.date,
      }, function() {
        $(this.refs.date).data('datepicker').update();
      });
    }
  },
  componentDidMount: function() {
    $(function(){
      var $date = $(this.refs.date).datepicker({
        format: 'yyyy-mm-dd',
      }).on('changeDate', function(e) {
        this.props.onChange(e.target.value);
        $date.data('datepicker').hide();
      }.bind(this));
    }.bind(this));
  },
  onChange: function() {}, //占位
  render: function(){
    var classnames = "form-control input-sm input-date" + this.props.className;
    return (
      <div style={{'display': 'inline-block'}}>
        <input ref="date" value={this.props.date} onChange={this.onChange} className={classnames} />
      </div>
    );
  }
});

export default DatePicker;