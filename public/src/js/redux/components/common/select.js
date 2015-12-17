var React = require('react');
var Select = React.createClass({
  getDefaultProps: function() {
    return {
      "default-text": '--请选择--',
      "default-value": -1,
      "options": [],
      "no-default": false,
    }
  },
  render: function() {
    var list = this.props.options.map(function(n) {
      return (
        <option value={n.id} key={n.id}>{n.text}</option>
      );
    });
    var className = "form-control input-sm " + (this.props.className || '');
    this.props = {...this.props, ...{className: className}};
    return (
      <select {...this.props}>
        { this.props['no-default'] 
          ? null 
          : <option value={this.props['default-value']}>{this.props['default-text']}</option> }
        { list }
      </select>
    );
  }
});
module.exports = Select;
