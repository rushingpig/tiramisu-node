import React,{Component} from 'react';
import {findDOMNode} from 'react-dom';
import {connect} from 'react-redux';
import { bindActionCreators } from 'redux';

import { AreaActionTypes1 } from 'actions/action_types';

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
    var {editable} = this.props;
    var titleStr = editable ? '编辑用户' : '添加用户';
    return (
      <div className="clearfix top-header">
        <LineRouter 
          routes={[{name:'用户页面',link:'/am/user'},{name: titleStr, link: ''}]} 
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
            editable={editable}
            area = {area}
            {...this.props} />
          :<ManageUserFormEdit 
            form-data = {mainForm}
            user_id={params.id}
            editable={editable}
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
    var _this = this;
    this.props.actions.getStationsByCityIdsSignal({signal: 'authority', is_national: 1});
    if(params && params.id){
      this.props.actions.getUserById(params.id)
        .done(function(){
          var {city_ids} = _this.props.mainForm.data;
          var city_ids_str = city_ids.join(',');
          if(city_ids_str != '')
            _this.props.actions.getStationsByCityIdsSignal({city_ids:city_ids_str, signal:'authority', is_national:0});
        })
    }else{
      _this.props.actions.resetStations();
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
      ...AreaActions(AreaActionTypes1),
      ...FormActions,
      ...UserFormActions
    }, dispatch)
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(ManageUserDetailPannel)
/*export default ManageUserDetailPannel*/
