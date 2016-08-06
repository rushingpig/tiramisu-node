import React from 'react';
import { core } from 'utils/index';

function TreeLeaf( props ) {
  var { data, onChoose } = props;
  return (
    <div className="tree-item">
      <i className="tree-dot"></i>
      <input type="checkbox" checked={data.checked} onChange={onChoose} />
      <div className="tree-item-name">{data.name}</div>
    </div>
  )
}

function TreeNode( props ) {
  var { data, onChoose, children } = props;
  return (
    <div className="tree-folder">
      <div className="tree-folder-header">
        <i className="fa fa-minus-square-o"></i>
        <input type="checkbox" checked={data.checked} onChange={onChoose} />
        <div className="tree-folder-name">{data.name}</div>
      </div>
      <div className="tree-folder-content">
        { children }
      </div>
    </div>
  )
}

export default class TreeView extends React.Component {
  constructor(props){
    super(props);
    this.build = this.build.bind(this);
    this.state = {
      data: [{
        id: 100,
        name: 'Test-1',
        checked: false,
        children: [{
          id: 101,
          name: 'Test-1.1',
          checked: false,
          children: null
        }]
      }, {
        id: 200,
        name: 'Test-2',
        checked: false,
        children: null
      }]
    }
  }
  render(){
    return (
      <div className="panel">
        <header className="panel-heading">Test Tree</header>
        <div className="panel-body">
          <div className="tree">
            {
              this.state.data.map( d => this.build( d ) )
            }
          </div>
        </div>
      </div>
    )
  }
  build(data){
    if(core.isArray(data.children)){
      return (
        <TreeNode key={data.id} data={data} >
          {
            data.children.reduce( (pre, cur) => {
              pre.push( this.build( cur ) );
              return pre;
            }, [])
          }
        </TreeNode>
      )
    }else{
      return <TreeLeaf key={data.id} data={data} />
    }
  }
}