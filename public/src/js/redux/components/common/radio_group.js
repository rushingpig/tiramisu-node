import React, { Component, PropTypes } from 'react';

export default class RadioGroup extends Component {
  constructor(props){
    super(props);
    this.onCheck = this.onCheck.bind(this);
  }
  render(){
    var { radios, space, value, vertical, name } = this.props;

    var content = radios.map((n, i) => {
      var item = (
        <label style={{ marginRight: space }} key={n.value}>
          <input value={n.value} checked={this.props.value == n.value} name={name} onChange={this.onCheck} type="radio" />
          {' ' + n.text}
        </label>
      );
      return vertical ? <div key={n.value}>{item}</div> : item;
    })

    //onChange少不了，有bug
    return (
      <div {...this.props} onChange={function(){}}>
        { content }
      </div>
    )
  }
  onCheck(e){
    this.props.onChange(e.target.value);
  }
}

RadioGroup.defaultProps = {
  space: 16,
  vertical: false,
}

RadioGroup.PropTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  radios: PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.string.isRequired,
        text: PropTypes.string.isRequired,
      })
    ).isRequired,  //得按顺序，所以得用数组
  onChange: PropTypes.func.isRequired,
}