import React, { Component, PropTypes } from 'react';

export default class RadioGroup extends Component {
  constructor(props){
    super(props);
    this.onCheck = this.onCheck.bind(this);
  }
  render(){
    var { radios, space, value } = this.props;
    var content = radios.map((n, i) => {
      return (
        <label style={{marginRight: space}} key={n.value}>
          <input value={n.value} checked={this.props.value == n.value} onChange={this.onCheck} type="radio" />
          {' ' + n.text}
        </label>
      )
    })
    return (
      <div className="inline-block" style={this.props.style}>
        { content }
      </div>
    )
  }
  onCheck(e){
    this.props.onChange(e.target.value);
  }
}

RadioGroup.defaultProps = {
  space: 16
}

RadioGroup.PropTypes = {
  value: PropTypes.string.isRequired,
  radios: PropTypes.array.isRequired,  //得按顺序，所以得用数组
  onChange: PropTypes.func.isRequired,
}