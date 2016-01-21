/**
 *  2级Select(缩进的方式，一级select模拟而来, 因此也可以被选)
 */
import React, { PropTypes } from 'react';
import { SELECT_DEFAULT_VALUE } from 'config/app.config';

var SelectGroup = React.createClass({
  propTypes: {
    options: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      parent_id: PropTypes.number.isRequired, //0为1最上级，其他的为下级
    })),
  },
  getDefaultProps: function() {
    return {
      "default-text": '--请选择--',
      "default-value": SELECT_DEFAULT_VALUE,
      "options": [],
      "no-default": false,
      "parentId": 0,
      "onChange": function(){},
    }
  },
  render: function() {
    var { options, parentId } = this.props;
    var first_level = [], second_level = [];
    options.forEach(n => {
      n.parent_id == parentId ? first_level.push(n) : second_level.push(n);
    })
    var list = [];
    var createOption = function(id, p_id, text){
      return <option value={id} data-parent-id={p_id} key={id}>{text}</option>;
    };
    first_level.forEach( f => {
      list.push(createOption(f.id, f.parent_id, f.name));
      second_level.forEach( s => {
        if(f.id == s.parent_id)
          list.push(createOption(s.id, s.parent_id, '　' + s.name))
      })
    });
    var className = "form-control text-left input-xs " + (this.props.className || '');
    this.props = {...this.props, className};
    return (
      <select {...this.props}>
        { this.props['no-default'] 
          ? null 
          : <option value={this.props['default-value']}>{this.props['default-text']}</option> }
        { list }
      </select>
    );
  },
});

module.exports = SelectGroup;
