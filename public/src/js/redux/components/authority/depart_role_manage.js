import React,{Component,PropTypes} from 'react';
import { render } from 'react-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { map } from 'utils/index';

import {reset} from 'redux-form';

import {Noty} from 'utils/index';
import V from 'utils/acl';

import * as DeptRoleManageActions from 'actions/depart_role_manage';
import DeptRoleActions from 'actions/dept_role';
import { ORG_ID_HAS_CHANNELS} from 'config/app.config';

import {triggerFormUpdate} from 'actions/form';

import StdModal from 'common/std_modal';
import TreeNav from 'common/tree_nav';


import RoleFormEdit from './role_form_edit';
import RoleFormAdd from './role_form_add';


class DeptHeader extends Component{
  render(){
    return(
      <div className="panel search">
        <div className="panel-body form-inline">
              {
                V('DeptRoleManageAddDept')
                ?
                <button onClick={this.ViewAddDept.bind(this)} className="btn btn-sm btn-theme" style={{marginLeft:'20'}}>
                  <i className=""></i>{'添加部门'}
                </button>
                :
                null
              }
              {
                V('DeptRoleManageAddRole')
                ?
                <button onClick={this.ViewAddRole.bind(this)} className="btn btn-sm btn-theme" style={{marginLeft:'20'}}>
                  <i className=""></i>{'添加角色'}
                </button>
                :
                null
              }


        </div>
      </div>
      )
  }

  ViewAddDept(){
    /*history.push('/am/dept/addDept');*/
    //this.props.;
    this.props.viewAddDeptModal();
  }

  ViewAddRole(){
    /*history.push('/am/dept/addRole');*/
    this.props.viewAddRoleModal();
  }
}

class RoleInfoRow extends Component{
  render(){
    const { props } = this;
    return(
        <tr>
          <td>{props.name}</td>
          <td>{props.description}</td>
          <td>
            {
              V('DeptRoleManageRoleDetail')
              ?
              <a onClick={this.viewRoleDetailModal.bind(this)} href="javascript:;">[ 查看 ]</a>
              :null
            }
            {
              V('DeptRoleManageRoleEdit')
              ?
              <a onClick={this.viewEditRoleModal.bind(this)} href="javascript:;">[ 编辑 ]</a>
              :
              null
            }
            {
              V('DeptRoleManageRoleRemove')
              ?
              <a onClick={this.viewDeleteRoleModal.bind(this)} href="javascript:;">[ 删除 ]</a>
              :
              null
            }
            
          </td>
        </tr>
      )
  }

  viewEditRoleModal(){
    let {viewEditRoleModal,id} = this.props;
    //getRoleDetail(this.props.id);
    viewEditRoleModal(id);
  }

  viewDeleteRoleModal(){
    this.props.viewDeleteRoleModal(this.props.id);
  }
  viewRoleDetailModal(){
    this.props.viewRoleDetailModal(this.props.id);
  }
}


class DeptManagePanel extends Component{
  constructor(props){
    super(props);
    this.viewAddDeptModal = this.viewAddDeptModal.bind(this);
    this.viewAddRoleModal = this.viewAddRoleModal.bind(this);
    this.viewEditRoleModal=this.viewEditRoleModal.bind(this);
    this.viewDeleteRoleModal = this.viewDeleteRoleModal.bind(this);
    this.viewRoleDetailModal = this.viewRoleDetailModal.bind(this);
  }
  render(){
    var {dept_role,filter}=this.props;
    var {all_order_srcs} = filter;
    var {depts,dataaccess} = dept_role;
    const { list,active_org_id } = this.props.RoleInfoListManage;
    var {handle_role_id, role_info} = this.props.RoleManage;
    var depts_active = depts.map(e => {
      e.id == active_org_id ? e.chosen = true :e.chosen = false;
      return e;
    });
    const {addDept,addRole,changeRole,deleteRole,reset,getRoleDetail,getOrderSrcs,resetRole} = this.props.actions;
    let content = list.map((n,id) => {
      return <RoleInfoRow key={id} {...n}
      getRoleDetail = {this.props.actions.getRoleDetail}
      role_info = {this.props.RoleInfoListManage}
      viewEditRoleModal = {this.viewEditRoleModal}
      viewDeleteRoleModal = {this.viewDeleteRoleModal}
      viewRoleDetailModal = {this.viewRoleDetailModal}/>;
    })
    return (
        <div className="">
          <DeptHeader viewAddRoleModal={this.viewAddRoleModal} viewAddDeptModal={this.viewAddDeptModal}/>
          <div className="authority-manage">
            <div className="container-fluid" style={{paddingTop:'20',minHeight:'600'}}>
              <div className="panel pull-left navbar" style={{paddingTop:'15px',paddingLeft:'15px',paddingBottom:'15px'}}>
                <span className="font-lg bold">{'请选择部门'}</span>
                <TreeNav data={depts_active} onToggle={this.onToggleDept.bind(this )} />
                {/*<TreeNav data={this.props.accessManage.data} onToggle={this.onToggleDept.bind(this)} />*/}
              </div>
                <div className="panel panel-body" style={{marginLeft: '225px'}}>
                  <div className="main-list">
                    <table className="table table-hover text-center table-bordered"  style={{border:'1px solid #ddd'}}>
                      <thead>
                        <tr>
                          <th>职位(角色名称)</th>
                          <th>职能描述</th>
                          <th>管理操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        { content }
                      </tbody>
                    </table>
                  </div>
                </div>
            </div>
          </div>
          <AddDeptModal ref='addDept' addDept={addDept} reset={reset} getDeptsSignal={this.props.actions.getDeptsSignal}/>
          <AddRoleModal {...{filter}} ref='addRole' depts={depts} dataaccess={dataaccess} 
            getRoleInfoList={this.props.actions.getRoleInfoList} reset = {reset} addRole={addRole}
            getOrderSrcs={getOrderSrcs} triggerFormUpdate={triggerFormUpdate}  resetRole={resetRole}/>
          <EditRoleModal {...{filter}} handle_role_id={handle_role_id} ref='editRole' depts={depts} dataaccess={dataaccess} 
            reset={reset} changeRole = {changeRole} getRoleDetail={getRoleDetail}
            getOrderSrcs={getOrderSrcs} triggerFormUpdate={triggerFormUpdate} />
          <DeleteRoleModal ref='deleteRole' deleteRole = {deleteRole} />
          <RoleDetailModal {...filter} ref='roleDetail' 
            getRoleDetail = {getRoleDetail}
            depts = {depts}
            dataaccess = {dataaccess}
            getOrderSrcs={getOrderSrcs}
            role_info = {role_info} />
        </div>
      )
  }
  onToggleDept(dept_id){
    this.props.actions.toggleDept(dept_id);
  }

  componentDidMount(){
    var {getDeptsSignal,getRoleInfoList,getDataAccess} = this.props.actions;
    getDeptsSignal('authority');
    getRoleInfoList();
    getDataAccess();
  }

  viewAddDeptModal() {
    this.refs.addDept.show();
  }

  viewAddRoleModal() {
    this.refs.addRole.show();
  }

  viewEditRoleModal(id){
    this.refs.editRole.show(id);
  }

  viewDeleteRoleModal(id){
    this.refs.deleteRole.show(id);
  }

  viewRoleDetailModal(id){
    this.refs.roleDetail.show(id);
  }
}

class AddDeptModal extends Component{
  constructor(props){
    super(props);  //this is not allowed before super()
    this.onConfirm = this.onConfirm.bind(this);
    //this.onCancel = this.onCancel.bind(this);
    //this.saveDept = this.saveDept.bind(this);
    this.state={name:'',description:'',error:false};
    this.onNameChange=this.onNameChange.bind(this);
    this.hide = this.hide.bind(this);
    this.show = this.show.bind(this);
  }

  render() {
    const {addDept} = this.props;

    return (
      <StdModal footer={false} title='添加部门' ref='viewDeptAdd'>
        <div className='form-group form-inline'>
          <label>{'　　部门名称：'}</label>
          <input ref='name' type="text" onChange={this.onNameChange} className={`form-control input-xs ${this.state.error?'error':''}`}/>
        </div>
        <div className='form-group form-inline'>
          <label>{'部门职能描述：'}</label>
          <input ref='description' type="text" onChange={this.onDescChange} className="form-control input-xs"/>
        </div>
        <div className='clearfix'>
          <div className='form-group pull-right'>
            <button className="btn btn-default btn-sm space-right" onClick={this.hide}>取消</button>
            <button ref='submit_btn' className="btn btn-theme btn-sm space-left" onClick={this.onConfirm}>提交</button>           
          </div>
        </div> 
      </StdModal>
      )
  }
  show(){
    this.refs.name.value = '';
    this.refs.description.value = '';
    this.refs.viewDeptAdd.show();
  }
  hide(){
    this.refs.viewDeptAdd.hide();
  }

  onNameChange(e){
    this.setState({
      name:e.target.value,
      error:false
    })
  }
  onDescChange(e){
    this.setState({
      name:e.target.value,
      error:false
    })
  }
  onConfirm(){
    this.refs.submit_btn.disabled = true;
    var  name = this.state.name;
    var description = this.state.description;
    if(name){
      this.props.addDept(name,description)
        .done(function(){
          Noty('success', '保存成功');
          setTimeout(()=>{
            this.refs.viewDeptAdd.hide();
            this.props.getDeptsSignal('authority');
            this.refs.submit_btn.disabled = false;
          },500);
        }.bind(this))
        .fail(function(msg, code){
          Noty('error', msg || '保存异常');
          this.refs.submit_btn.disabled = false;
        });
    }else{
      this.setState({
        error: true
      });
      Noty('warning', '请填写完整');
      this.refs.submit_btn.disabled = false;
    }
  }
/*  saveDept(form_data){
    const {addDept} = this.props;
    addDept(form_data);
  }*/
}

class AddRoleModal extends Component{
  constructor(props){
    super(props);
    this.onConfirm = this.onConfirm.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.saveRole = this.saveRole.bind(this);
    this.hide = this.hide.bind(this); 
  }

  render(){
    const {addRole,depts,dataaccess,filter,getOrderSrcs} = this.props;
    var {all_order_srcs} = filter;

    return (
      <StdModal footer={false} title='添加角色' ref='viewRoleAdd' onConfirm={this.onConfirm} onCancel={this.onCancel}>
        <RoleFormAdd {...{all_order_srcs}} ref='roleFormAdd' hide={this.hide} depts={depts} dataaccess={dataaccess} addRole={addRole} 
        getOrderSrcs={getOrderSrcs} triggerFormUpdate={triggerFormUpdate}/>
      </StdModal>
      )
  }
  show(){
    this.props.resetRole();
    this.refs.viewRoleAdd.show();
  }
  hide(){
    this.refs.viewRoleAdd.hide();
  }
  onConfirm(){
    this.refs.roleFormAdd.submit();
  }
  onCancel(){
    this.props.reset('RoleForm');
  }
  saveRole(form_data){
    const {addRole} = this.props;
    addRole(form_data);
  }
}

class EditRoleModal extends Component{
  constructor(props){
    super(props);
    this.hide = this.hide.bind(this);

  }
  render(){
    const {changeRole,depts,dataaccess,handle_role_id,filter,getOrderSrcs} = this.props;
    var {all_order_srcs} = filter;

    return (
      <StdModal footer={false} title='编辑角色' ref = 'viewRoleEdit' onConfirm={this.onConfirm} >
        <RoleFormEdit {...{all_order_srcs}} handle_role_id={handle_role_id} hide={this.hide} editable={true} 
          ref='roleFormEdit' depts={depts} dataaccess={dataaccess} changeRole={changeRole} 
          getOrderSrcs={getOrderSrcs} triggerFormUpdate={triggerFormUpdate}/>
      </StdModal>
      )
  }
  show(id){
    var {getRoleDetail} = this.props;
    getRoleDetail(id);
    this.refs.viewRoleEdit.show();
  }
  hide(){
    this.refs.viewRoleEdit.hide();
  }

  onCancel(){
    this.props.actions.reset('RoleForm');
  }
}

class RoleDetailModal extends Component{
  constructor(props){
    super(props);
  }
  render(){
    var {depts, dataaccess, role_info, all_order_srcs} = this.props;
    var {data_scope_id, description, name, org_id, src_id} = role_info;
    var org_name = '';
    var data_scope_name = '';
    var src_name = '';
    var src_parent_name = '';
    depts.forEach( m => {
      if( m.id == org_id){
        org_name = m.text;
      }
    })
    dataaccess.forEach( m => {
      if(m.id == data_scope_id){
        data_scope_name = m.text;
      }
    })
    if(all_order_srcs.length > 0){
      all_order_srcs[1].forEach( 
        m => {
          if(m.id == src_id){
            src_name = m.name;
            all_order_srcs[0].forEach(
              n => {
                if(n.id == m.parent_id){
                  src_parent_name = n.name;
                }
              }
              )
          }else{
            all_order_srcs[0].forEach(
              m => {
                if(m.id == src_id){
                  src_name = m.name;
                }
              }
              )
          };
        }
        )

    }
    return (
      <StdModal footer = {false} title = '查看角色详情' ref = 'viewRoleDetail' >
        <div>
          <div className='form-group form-inline'>
            <label>{'　　角色名称：'}</label>
            <input value={name} readOnly ref='name' type="text" className='form-control input-xs'/>
          </div>
          <div className='form-group form-inline'>
            <label>{'角色职能描述：'}</label>
            <input value={description} readOnly type="text" className="form-control input-xs" style={{width: 240}}/>
          </div>
          <div className='form-group form-inline'>
            <label>{'　　所属部门：'}</label>
            <input value={org_name} readOnly type="text" className="form-control input-xs"/>
             {

                (org_id == ORG_ID_HAS_CHANNELS && src_id)?
                  [src_parent_name &&<input readOnly type='text' value={src_parent_name} className='form-control input-xs'/>,                   
                  <input readOnly type='text' value={src_name} className='form-control input-xs'/>
                  ]              
              :
              null
              }
          </div>
          <div className='form-group form-inline'>
            <label>{'角色数据权限：'}</label>
            <input value={data_scope_name} readOnly type="text" className="form-control input-xs"/>
          </div>
          <div className='clearfix'>
            <div className='form-group pull-right'>
              <button className="btn btn-theme btn-sm space-right" onClick={this.hide.bind(this)}>关闭</button>           
            </div>
          </div> 
        </div>      
      </StdModal>
      )
  }
  show(id){
    var _this = this;
    this.props.getRoleDetail(id)
      .done(function(){
        _this.props.getOrderSrcs()
        .done(function(){
          _this.refs.viewRoleDetail.show();         
        })
      });
  }
  hide(){
    this.refs.viewRoleDetail.hide();
  }
}

class DeleteRoleModal extends Component{
  constructor(props){
    super(props);
    this.state = {role_id:undefined}
  }
    render(){

      return (
        <StdModal title='删除角色' ref='viewDeleteRoleModal' onConfirm={this.onConfirm.bind(this)}>
          <div style={{textIndent:'center'}}>
            确定要删除吗？
          </div>
        </StdModal>
        )
    }
    show(id){
      this.setState({
        role_id:id,
      });
      this.refs.viewDeleteRoleModal.show();
    }
    onConfirm(){
      this.props.deleteRole(this.state.role_id);
      setTimeout(()=>{
        this.refs.viewDeleteRoleModal.hide();
      },500);
    }
}



function mapStateToProps(state){
  return state.DeptRoleManage;
}

function mapDispatchToProps(dispatch){
 return {
    actions:bindActionCreators({
      ...DeptRoleActions(),
      ...DeptRoleManageActions,
      reset,
      dispatch
    },dispatch)
  }

}

export default connect(mapStateToProps,mapDispatchToProps)(DeptManagePanel);


