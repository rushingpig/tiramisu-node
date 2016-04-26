import React,{Component,PropTypes} from 'react';
import { render } from 'react-dom';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import { bindActionCreators } from 'redux'

import { AreaActionTypes2 } from 'actions/action_types';

import AreaActions from 'actions/area';
import * as UserManageActions from 'actions/user_manage';
import DeptRoleActions from 'actions/dept_role';

import LazyLoad from 'utils/lazy_load';
import V from 'utils/acl';

import StdModal from 'common/std_modal';
import TreeNav from 'common/tree_nav';
import Pagination from 'common/pagination';
import { tableLoader, get_table_empty } from 'common/loading';
import history from 'history_instance';

class FilterHeader extends Component {
  constructor(props){
    super(props);
    this.state = {search_ing:false}
  }
  render(){
    var {search_ing} = this.state;

    return (
        <div className="panel search">
          <div className="panel-body form-inline">
            {
              V('UserManageUnameOrNameFilter')
                  ?
                  <div  style={{float:'left',}}>
                    <span className="">{' 用戶名/姓名:'}</span>
                    <input ref='name'  className="form-control input-xs v-mg" />
                    <button disabled={search_ing} data-submitting={search_ing}  className="btn btn-theme btn-xs space-left" onClick={this.search.bind(this)}>
                      <i className="fa fa-search"></i>{' 查詢'}
                    </button>
                  </div>
                  :
                  null
            }
            {
              V('UserManageAddUser')
                  ?
                  <div style={{float:'right',}}>
                    <button onClick={this.addUser.bind(this)} className="btn btn-sm btn-theme pull-right">
                      <i className=""></i>{' 添加用戶'}
                    </button>
                  </div>
                  :
                  null
            }
          </div>
        </div>
    )
  }

  addUser(){
    //console.log("hahahah");
    history.push('/am/user/add');
  }

  search(){
    this.setState({search_ing: true});
    var name = this.refs.name.value;
    this.props.getUserList(0,name,0, this.props.page_size)
        .always(()=>{
          this.setState({search_ing: false});
        });
  }
}

FilterHeader.propTypes = {
  // actions: PropTypes.object.isRequired,
}
FilterHeader = reduxForm({
  form: 'user_manage_filter',
  fields: [
    'name'
  ],
  destroyOnUnmount: false,
})( FilterHeader );

var UserRow = React.createClass({
  render(){
    var { props } = this;
    return (
        <tr>
          <td>
            {props.role_names}
          </td>
          <td>
            {props.username}
          </td>
          <td>
            {props.name}
          </td>
          <td>
            {props.mobile}
          </td>
          <td>
            {props.city_names}
          </td>
          <td>
            {props.is_usable == true ? '是':'否'}
          </td>
          <td>
            {
              V('UserManageUserEdit')
                  ?
                  <a className="space-right"  key="UserManageUserEdit" href="javascript:;" onClick={this.editHandler.bind(this)}>[编辑]</a>
                  :
                  null
            }
            {
              V('UserManageUserStatusModify')
                  ?
                  <a className="space-right" onClick={this.viewUsableAlterModal} key="UserManageUserStatusModify" href="javascript:;">{props.is_usable==true?'[禁用]':'[启用]'}</a>
                  :
                  null
            }
            {
              V('UserManageUserRemove')
                  ?
                  <a onClick={this.viewDeleteUserModal} key="UserManageDelete" href="javascript:;">[删除]</a>
                  :null
            }

          </td>
        </tr>
    )
  },

  viewDeleteUserModal(){
    this.props.viewDeleteUserModal(this.props.id);
  },

  viewUsableAlterModal() {
    this.props.viewUsableAlterModal(this.props.id,this.props.is_usable);
  },

  editHandler(){
    history.push('/am/user/' + this.props.id);
  }

})

class UserManagePannel extends Component{
  constructor(props){
    super(props);
    this.state={
      page_size:10,
      /*      dept_id:0,
       uname_or_name:'',*/
    }
    this.viewDeleteUserModal = this.viewDeleteUserModal.bind(this);
    this.viewUsableAlterModal = this.viewUsableAlterModal.bind(this);

  }
  render(){
    // var { loading ,refresh } = this.props;
    // console.log(this.props.deptListManage.list);
    var {page_no,dept_id,uname_or_name,total,loading,refresh,list}= this.props.UserListManage;
    var {dept_role} = this.props;
    var {userDelete,usableAlter} = this.props.actions;
    var {depts} = dept_role;

    var depts_active = depts.map(e => {
      e.id == dept_id ? e.chosen = true:e.chosen = false;
      return e;
    })

    var content = list.map((n,i)=>{
      return <UserRow key= {n.id} {...n}
                      viewDeleteUserModal={this.viewDeleteUserModal}
                      viewUsableAlterModal={this.viewUsableAlterModal}/>;
    })
    return (
        <div className="">
          <FilterHeader page_size={this.state.page_size} getUserList={this.props.actions.getUserList}/>

          <div className="authority-manage">
            <div className="panel pull-left navbar" style={{paddingTop:'15px',paddingLeft:'15px',paddingBottom:'15px'}}>
              <span className="font-lg bold">{ '请选择部门' }</span>
              <TreeNav data={depts_active} onToggle={this.onToggleDept.bind(this)} />
            </div>
            <div className="panel panel-body" style={{marginLeft: '225px'}}>
              <div className="table-responsive authority-list">
                <table className="table table-hove text-center table-bordered" style={{border:'1px solid #ddd'}}>
                  <thead>
                  <tr>
                    <th>职位(角色)</th>
                    <th>用户名</th>
                    <th>真实姓名</th>
                    <th>电话号码</th>
                    <th>所属城市</th>
                    <th>是否启用</th>
                    <th>操作</th>
                  </tr>
                  </thead>
                  <tbody>

                  { tableLoader( loading || refresh, content ) }
                  </tbody>
                </table>
              </div>
              <div style={{marginTop:20}}>
                <Pagination
                    page_no={page_no}
                    total_count={total}
                    page_size={this.state.page_size}
                    onPageChange={this.onPageChange.bind(this)}
                /></div>
            </div>

          </div>

          <DeleteUserModal ref='deleteUser' userDelete={userDelete} />
          <UsableAlterModal ref='usableAlter' usableAlter={usableAlter} />
        </div>


    )

  }

  onPageChange(page){
    this.search(page);
  }

  search(page){
    //搜索数据，无需loading图
    var {dept_id,page_no,uname_or_name} = this.props.UserListManage;
    page = typeof page == 'undefined' ? page_no : page;
    this.props.actions.getUserList(dept_id,uname_or_name,page,this.state.page_size);
  }

  viewDeleteUserModal(id){
    this.refs.deleteUser.show(id);
  }

  viewUsableAlterModal(id,is_usable){
    this.refs.usableAlter.show(id,is_usable);
  }

  componentDidMount(){
    LazyLoad('noty');
    setTimeout(()=>{
      var {getUserList,getDepts} = this.props.actions;
      var {page_no,uname_or_name} = this.props.UserListManage;
      var dept_id=0;
      getDepts();
      getUserList(dept_id,uname_or_name,0,this.state.page_size);
      //this.search();
    },0)
  }

  onToggleDept(dept_id){
    //this.props.actions.getDepts(dept_id);
    var {page_no,uname_or_name} = this.props.UserListManage;
    this.props.actions.getUserList(dept_id,uname_or_name,0,this.state.page_size);
  }
}

class DeleteUserModal extends Component{
  constructor(props){
    super(props);
    this.state = {user_id:undefined}
  }
  render(){
    return (
        <StdModal title='删除用户' ref='viewDeleteUserModal' onConfirm={this.onConfirm.bind(this)}>
          <div style={{textIndent:'center'}}>
            确定要删除吗？
          </div>
        </StdModal>
    )
  }
  show(user_id){
    this.setState({
      user_id:user_id
    });
    this.refs.viewDeleteUserModal.show();
  }
  onConfirm(){
    let user_id = this.state.user_id;
    this.props.userDelete(user_id);
    setTimeout(() => {
      this.refs.viewDeleteUserModal.hide();
    },500);
  }
}



class UsableAlterModal extends Component{
  constructor(props){
    super(props);
    this.state={user_id:undefined,is_usable:undefined};
  }
  render(){
    return (
        <StdModal title='修改用户状态' ref='viewUsableAlterModal' onConfirm={this.onConfirm.bind(this)}>
          <div style={{textIndent:'center'}}>
            确定修改用户状态吗?
          </div>
        </StdModal>
    )
  }

  show(user_id,is_usable) {
    this.setState({
      user_id:user_id,
      is_usable:is_usable,
    });
    this.refs.viewUsableAlterModal.show();
  }
  onConfirm(){
    let user_id = this.state.user_id;
    let is_usable = this.state.is_usable;
    this.props.usableAlter(user_id,!is_usable);
    setTimeout(() => {
      this.refs.viewUsableAlterModal.hide();
    },500);
  }
}

function mapStateToProps(state){
  return state.UserManage;
}

function mapDispatchToProps(dispatch){
  return {
    actions:bindActionCreators({
      ...UserManageActions,
      ...DeptRoleActions(),
      ...AreaActions(AreaActionTypes2)
    },dispatch)};
  /*return bindActionCreators({...UserManageActions, ...AreaActions(AreaActionTypes2)},dispatch);*/
}

export default connect(mapStateToProps, mapDispatchToProps)(UserManagePannel);