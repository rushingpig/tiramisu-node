import React, { PropTypes } from 'react';
import clone from 'clone';

function TreeLeaf( props ) {
  var { data, onChoose } = props;
  return (
    <div 
      className={"tree-item" + (data.active ? ' active' : '')}
      onClick={ () => onChoose(data.id) }
      style={{backgroundColor:data.chosen?'#FBDCBD':''}}>
      <i className="tree-dot"></i>
      <div className="tree-item-name">
        {data.text}
      </div>
    </div>
  )
}

function TreeNode( props ) {
  var { data, children, onToggle, className } = props;
  return (
    <div className={`tree-folder ${className}`}>
      <div className="tree-folder-header" onClick={ () => onToggle(data.id) } style={{backgroundColor:data.chosen?'#FBDCBD':''}}>
        <i className={`fa fa-${data.active ? 'minus' : 'plus' }-square-o `}></i>
        <div className="tree-folder-name">
            {data.text? data.text: data.name}
          </div>
      </div>
      <div className="tree-folder-content">
        { data.active ? children : null }
      </div>
    </div>
  )
}

export default class TreeNav extends React.Component {
  render(){
    return (
      <div className="tree nav-tree">
        {
          this.props.data.map( (data, i) => {
            if(! ('children' in data) ){
              data.children=[];
              data.active = true;
            }
            return (
              <TreeNode key={data.id} data={data} onToggle={this.props.onToggle} className={this.props.data.length -1 == i ? 'last' : ''} >
                {
                  /*data.children = (data.children == undefined? null:data.children);*/
                  /*let {children} = data*/
                  data.children.reduce( (pre, cur) => {
                    pre.push(
                      <TreeLeaf key={cur.id} data={cur} onChoose={this.props.onChoose} />
                    );
                    return pre;
                  }, [])
                }
              </TreeNode>
            )
          })
        }
      </div>
    )
  }
}

TreeNav.propType = {
  data: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    children: PropTypes.array.isRequired,
  })).isRequired
}