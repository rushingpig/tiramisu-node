import React from 'react';
import {dateFormat} from '../../utils/index';

var DateRangePicker = React.createClass({
  getDefaultProps: function() {
    return {
      begin: '',
      end: '',
      className: '',
    };
  },
  getInitialState: function() {
    return {
      begin: this.props.begin,
      end: this.props.end,
    }
  },
  componentWillReceiveProps: function(nextProps) {
    if (nextProps.begin != this.props.begin || nextProps.end != this.props.end) {
      this.setState({
        begin: nextProps.begin || this.state.begin,
        end: nextProps.end || this.state.end
      }, function() {
        $([this.refs.begin, this.refs.end]).each(function() {
          $(this).data('datepicker').update();
        });
      }.bind(this));
    }
  },
  componentDidMount: function() {
    $(window).load(function(){
      var $begin = $(this.refs.begin).datepicker({
        format: 'yyyy-mm-dd',
      }).on('changeDate', function(e) {
        this.props.onChange(e.target.value, $end.val());
        $begin.data('datepicker').hide();
        $end.focus();
      }.bind(this));
      var $end = $(this.refs.end).datepicker({
        format: 'yyyy-mm-dd',
      }).on('changeDate', function(e) {
        this.props.onChange($begin.val(), e.target.value);
        $end.data('datepicker').hide();
      }.bind(this));
    }.bind(this))
  },
  onChange: function() {}, //占位
  render: function(){
    var classnames = "form-control input-sm input-nm-w " + this.props.className;
    return (
      <div style={{'display': 'inline-block'}}>
        <input ref="begin" value={this.props.begin} onChange={this.onChange} className={classnames} />{' ~ '}
        <input ref="end" value={this.props.end} onChange={this.onChange} className={classnames} />
      </div>
    );
  }
});

export default DateRangePicker;