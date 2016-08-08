import React, { PropTypes } from 'react';

export default class Breadcrumb extends React.Component {
  render(){

    var { data, className, separator, onClick } = this.props;
    var content = [];

    for(var i=0,len=data.length; i<len; i++){
      if(i<len-1){
        content.push([
          <span key={i} className="node" onClick={onClick.bind(this, data[i])}>{data[i].name}</span>,
          <span key={i + 'separator'}>{' ' + separator + ' '}</span>
        ])
      }else{
        content.push(
          <span key={i} className="node active">{data[i].name}</span>,
        )
      }
      if(content.length > 3){
        content.splice(1, content.length - 3, [<span key="ellipsis">...</span>, <span key='e-separator'>{' ' + separator + ' '}</span>]);
      }
    }

    return (
      <div className={`line-router ${className}`}>
        {content}
      </div>
    )
  }
}

Breadcrumb.defaultProps = {
  separator: '>',
}

Breadcrumb.propTypes = {
  separator: PropTypes.string,
  onClick: PropTypes.func.isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired
  })).isRequired,
}