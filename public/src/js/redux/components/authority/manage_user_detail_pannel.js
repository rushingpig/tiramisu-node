import React,{Component} from 'react';
import {findDOMNode} from 'react-dom';
import {connect} from 'react-redux';
import { bindActionCreators } from 'redux';

import { AreaActionType2 } from 'actions/action_types';

import DeptRoleActions from 'actions/dept_role';
import * as FormActions from 'actions/form';
/*import * as UserManageActions from 'actions/user_manage';*/
import * as UserFormActions from 'actions/user_manage_form';
import * as UserManageActions from 'actions/user_manage';
import AreaActions from 'actions/area';

import LineRouter from 'common/line_router';

import ManageUserFormCreate from './manage_user_form_create';
import ManageUserFormEdit from './manage_user_form_edit';

class TopHeader extends Component{
  render(){
    return (
      <div className="clearfix top-header">
        <LineRouter 
          routes={[{name:'用户页面',link:'/am/user'},{name: '添加用户', link: ''}]} 
          className="pull-right"/>
      </div>
      )
  }
}

/*class ManageUserRole extends Component{

}*/
class ManageUserDetailPannel extends Component{

  render(){ 
    var {params,mainForm,add_form,area } = this.props; 
    var editable = !!(params && params.id);
    return (
      <div className="user-manage">
      <TopHeader editable={editable}/>
      <div className="panel">
        <header className="panel-heading">用户详情</header>
        <div className="panel-body">
        {
          !editable
            ?
          <ManageUserFormCreate 
            form-data={mainForm}
            user_id={params.id}
            area = {area}
            {...this.props} />
          :<ManageUserFormEdit 
            form-data = {mainForm}
            user_id={params.id}
            area = {area}
            {...this.props}/>
            /*<ManageUserFormEdit 
                        form-data = {mainForm}
                        user_id={params.id}
                        {...this.props}/>*/
        }
        </div>
      </div>
    </div>
    )
  }

  componentDidMount(){
    var {params}=this.props;
    if(params && params.id){
      this.props.actions.getUserById(params.id);
    }
  }

}

/*function mapStateToProps({orderManageForm, form}){
  return {...orderManageForm, add_form: form.add_order}; //add_form是给products_modal用的，传给其省市信息
}*/


function mapStateToProps({UserManageForm,form}){
  return {...UserManageForm,add_form:form.add_user};
}


function mapStateToProps(state){
  return state.UserManageForm;
}
function mapDispatchToProps(dispatch){
   return {
    actions: bindActionCreators({
      ...DeptRoleActions(),
      ...AreaActions(AreaActionType2),
      ...FormActions,
      ...UserFormActions
    }, dispatch)
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(ManageUserDetailPannel)
/*export default ManageUserDetailPannel*/
