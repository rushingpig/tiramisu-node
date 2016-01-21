/**
 *  2级Select，采用optgroup，一级不可选
 */
import React, { PropTypes } from 'react';
import { SELECT_DEFAULT_VALUE } from 'config/app.config';

function createOptGroup(data){
  var options = data.slice(1).map( ({id, name}) => <option value={id} key={id}>{name}</option> );
  return (
    <optgroup key={data[0].id} label={data[0].name}>
      {options}
    </optgroup>
  )
}

var Select2 = React.createClass({
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
    var list = first_level.map( f => {
      return createOptGroup([f].concat(second_level.filter( s => s.parent_id == f.id )))
    });
    var className = "form-control text-left input-xs " + (this.props.className || '');
    this.props = {...this.props, className};
    return (
      <select {...this.props} onChange={this.onChange}>
        { this.props['no-default'] 
          ? null 
          : <option value={this.props['default-value']}>{this.props['default-text']}</option> }
        { list }
      </select>
    );
  },
  onChange(e){
    if($(e.target).find('option:selected').data('parent-id') != this.props.parentId){
      this.props.onChange(e);
    }
  }
});

module.exports = Select2;
