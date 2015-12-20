import React, {PropTypes} from 'react';
import {dateFormat} from '../../utils/index';

var DatePicker = React.createClass({
  getDefaultProps: function() {
    return {
      className: '',
      'redux-form': {},
    };
  },
  getInitialState: function() {
    return {
      date: '',
    }
  },
  // componentWillReceiveProps: function(nextProps) {
  //   if (nextProps.date != this.props.date) {
  //     this.setState({
  //       date: nextProps.date,
  //     }, function() {
  //       $(this.refs.date).data('datepicker').update();
  //     });
  //   }
  // },
  componentDidMount: function() {
    $(function(){
      var dom_date = this.refs.date,
        $date = $(dom_date).datepicker({
          format: 'yyyy-mm-dd',
        }).on('changeDate', function(e) {
          this.setState({date: e.target.value}, function(){
            setTimeout(function(){
              dom_date.focus();
              dom_date.blur();
              $date.data('datepicker').hide();
            }, 0);
          });
        }.bind(this));
    }.bind(this));
  },
  render: function(){
    return (
      <div style={{'display': 'inline-block'}}>
        <input ref="date" {...this.props['redux-form']} value={this.state.value} className={`form-control input-sm ${this.props.className}`} />
      </div>
    );
  }
});

DatePicker.propTypes = {
  'redux-form': PropTypes.object.isRequired
};

export default DatePicker;