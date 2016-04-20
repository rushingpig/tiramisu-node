import React, {Component, PropTypes} from 'react';
import { render, findDOMNode } from 'react-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import TreeNav from 'common/tree_nav';

import * as AuthManageActions from 'actions/role_authority_manage'; 

class RoleAuthorityPannel extends Component{
  render(){
    return(
      <div>
        <TreeNav data={this.props.data} onToggle={this.onToggleDept.bind(this)} />
      </div>
    )
  }
  onToggleDept(dept_id){
    this.props.toggleDept(dept_id);
  }
}

function mapStateToProps(state){
  return state.RoleAuthorityManage;
}


function mapDispatchToProps(dispatch){
  return bindActionCreators(AuthManageActions, dispatch);
}

// export default connect(mapStateToProps, mapDispatchToProps)(RoleAuthorityPannel);
export default connect(mapStateToProps, mapDispatchToProps)(RoleAuthorityPannel);
// export default connect()(RoleAuthorityPannel);