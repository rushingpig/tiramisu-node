import React, { PropTypes } from 'react';
import history from 'history_instance';

export default class Linkers extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      active: this.props.active,
    }
  }
  render(){

    var { data, className } = this.props;
    var { active } = this.state;
    var content = [];

    for(var i=0,len=data.length; i<len; i++){
      if(data[i] == active){
        content.push(
          <span key={i} className="node active">{data[i]}</span>,
        )
      }else{
        content.push(
          <span key={i} className="node"
            onClick={this.onClick.bind(this, data[i])}>{data[i]}</span>
        )
      }
      if(i != len - 1){
        content.push(
          <span key={i + 'separator'}>{'　/　'}</span>
        )
      }
    }

    return (
      <div className={`line-router ${className}`}>
        {content}
      </div>
    )
  }
  onClick(name){
    this.setState({active: name}, function(){
      this.props.onChange(name);
    })
  }
}

Linkers.PropTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      active: PropTypes.string.isRequired,
    })
  ),
}