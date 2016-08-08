import React,{Component,PropTypes} from 'react';
import { render, findDOMNode } from 'react-dom';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import { bindActionCreators } from 'redux'

import { AreaActionTypes1 } from 'actions/action_types';

import AreaActions from 'actions/area';
import * as UserManageActions from 'actions/user_manage';
import DeptRoleActions from 'actions/dept_role';

import LazyLoad from 'utils/lazy_load';
import V from 'utils/acl';

import StdModal from 'common/std_modal';
import TreeNav from 'common/tree_nav';
import Pagination from 'common/pagination';
import Select from 'common/select';
import AddressSelector from 'common/address_selector';

import { tableLoader, get_table_empty } from 'common/loading';
import history from 'history_instance';
import { SELECT_DEFAULT_VALUE} from 'config/app.config';

class FilterHeader extends Component {
  constructor(props){
    super(props);
    this.state = {search_ing:false}
    this.AddressSelectorHook = this.AddressSelectorHook.bind(this);
  }
  render(){
    var {search_ing} = this.state;
    var {
      fields: {
        province_id,
        city_id,
        district_id,
        uname_or_name,
      },
      area,
      actions,
    } = this.props;
    var {provinces, cities, districts} = area;
    return (
        <div className="panel search">
          <div className="panel-body form-inline">
         {
            [
              V('UserManageUnameOrNameFilter')
              &&
              <input {...uname_or_name} ref='name' key='input-username'  className="form-control input-xs v-mg space-right" placeholder='用戶名/姓名'/>,
              V('UserManageAddressFilter')
              &&
              <AddressSelector key='address-selector'
                                {...{ province_id, city_id, district_id, provinces, cities, districts, actions, AddressSelectorHook:this.AddressSelectorHook }} />,
              V('UserManageHeadquarterFilter')
              &&
              <label>
                <input ref='is_headquarters' type='checkbox' />
                <label style={{fontWeight:'normal', fontSize: '12px', marginRight: '5px'}}>{'不包括总部'}</label>
              </label>,
              V('UserManageUnameOrNameFilter') && V('UserManageAddressFilter') && 
              <button key='searchBtn' disabled={search_ing} data-submitting={search_ing}  className="btn btn-theme btn-xs space-left " onClick={this.search.bind(this)}>
                <i className="fa fa-search"></i>{' 查詢'}
              </button>            
            ]
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
  AddressSelectorHook(e, data){}
  search(){
    this.setState({search_ing: true});
    var data = this.props.filterdata;
    data.page_no = 0;
/*    if(this.refs.name){
      var name = this.refs.name.value;
      if (name != '')
        data.uname_or_name = name;
    }
    if(this.refs.province != undefined)
    {
      var $province = $(findDOMNode(this.refs.province));
      if($province[0].value != SELECT_DEFAULT_VALUE){
        data.province_id = $province[0].value;
      }
    }
    if(this.refs.city != undefined){
      var $city = $(findDOMNode(this.refs.city));
      if($city[0].value != SELECT_DEFAULT_VALUE){
        data.city_id = $city[0].value;
      }
    }*/
    var {fields: {uname_or_name, province_id, city_id, district_id}} = this.props;
    data.uname_or_name = uname_or_name.value;
    if(district_id && district_id.value && district_id.value != SELECT_DEFAULT_VALUE){
      data.city_id = district_id.value;
      delete data.is_standard_area;
    }else if(city_id && city_id.value && city_id.value != SELECT_DEFAULT_VALUE){
      data.city_id = city_id.value;
      data.is_standard_area = 1;
    }
    if(province_id && province_id.value && province_id.value != SELECT_DEFAULT_VALUE){
      data.province_id = province_id.value;
    }
    if(this.refs.is_headquarters){
      if(this.refs.is_headquarters.checked){
        data.is_headquarters = 0;
      }else{
        data.is_headquarters = 1;
      }
    }else{
      data.is_headquarters = 0;
    }
    this.props.actions.getUserList(data)
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
    'province_id',
    'city_id',
    'district_id',
    'uname_or_name',
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
                  <a className="space-right"  key="UserManageUserEdit" href="javascript:;" onClick={this.editHandler}>[编辑]</a>
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
    var {filterdata,dept_id,uname_or_name,total,loading,refresh,list}= this.props.UserListManage;
    var page_no = filterdata == undefined ? 0 : filterdata.page_no;
    var {userDelete,usableAlter, getUserList, dispatch, dept_role, area} = this.props;
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
          <FilterHeader area = {area} page_size={this.state.page_size} filterdata = {filterdata}
            actions = {{...bindActionCreators({...AreaActions()}, dispatch), getUserList}} 
            />

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
    var {filterdata} = this.props.UserListManage;
    var {page_no} = filterdata;
    page = typeof page == 'undefined' ? page_no : page;
    filterdata.page_no = page;
    this.props.getUserList(filterdata);
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
      var {getUserList,getDeptsSignal} = this.props;
      var {filterdata} = this.props.UserListManage;
      filterdata.page_no = 0;
      filterdata.page_size = this.state.page_size;
      var dept_id=0;
      getDeptsSignal('authority');
      getUserList(filterdata);
      //this.search();
    },0)
  }

  onToggleDept(dept_id){
    //this.props.actions.getDepts(dept_id);
    var {filterdata} = this.props.UserListManage;
    filterdata.page_no = 0;
    filterdata.org_id = dept_id;
    filterdata.page_size = this.state.page_size;
    this.props.getUserList(filterdata);
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
  var actions =  bindActionCreators({
      ...UserManageActions,
      ...DeptRoleActions(),
      ...AreaActions(AreaActionTypes1)
    },dispatch);
  actions.dispatch = dispatch;
  return actions;
}

export default connect(mapStateToProps, mapDispatchToProps)(UserManagePannel);