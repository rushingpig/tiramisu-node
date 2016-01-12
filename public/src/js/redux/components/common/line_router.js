import React, { PropTypes } from 'react';
import history from 'history_instance';

export default class LineRouter extends React.Component {
  render(){

    var { routes, className } = this.props;
    var content = [];

    for(var i=0,len=routes.length; i<len; i++){
      if(i<len-1){
        content.push(
          <span key={i + routes[i].link} className="node" 
            onClick={this.jumpTo.bind(this, routes[i].link)}>{routes[i].name}</span>,
          <span key={i + 'separator'}>{'　/　'}</span>
        )
      }else{
        content.push(
          <span key={i + routes[i].link} className="node active">{routes[i].name}</span>,
        )
      }
    }

    return (
      <div className={`line-router ${className}`}>
        {content}
      </div>
    )
  }
  jumpTo(link){
    debugger;
    history.push(link);
  }
}

LineRouter.PropTypes = {
  routes: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      link: PropTypes.string.isRequired,
    })
  ),
}