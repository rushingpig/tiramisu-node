import React, { Component, PropTypes } from 'react';

export default class CheckBoxGroup extends Component {
  constructor(props){
    super(props);
    //this.onCheck = this.onCheck.bind(this);
  }

  render(){
    var { checkboxs, space, value=[], vertical, name} = this.props;
    var content = checkboxs.map((n, i) => {
      var item = (
        <label style={{ marginRight: space }} key={n.id}>
          <input checked={value.some( m => m.id== n.id )} value={n.id} onClick={this.onCheck.bind(this,n.text)} type="checkbox" />
          {' ' + n.text}
        </label>
      );
      return vertical ? <div key={n.value}>{item}</div> : item;
    })

    return (
      <div>
        { content }
      </div>
    )
  }
  onCheck(text,e){
    //console.warn(e.target._text);
    var new_value;
    if(e.target.checked){
      new_value = [...this.props.value, {id:e.target.value,text:text}];
    }else{
      new_value = [...this.props.value];
      new_value.forEach( (n, i) => {
        if( n.id == e.target.value ){
          new_value.splice(i, 1);
        }
      })
    }
    this.props.onChange(new_value);
  }
}

CheckBoxGroup.defaultProps = {
  space: 16,
  vertical: false,
  //role_ids: [],
}

CheckBoxGroup.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.array.isRequired,
  checkboxs: PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.object.isRequired,
        text: PropTypes.string.isRequired,
      })
    ).isRequired,  //得按顺序，所以得用数组
  onChange: PropTypes.func.isRequired,
}