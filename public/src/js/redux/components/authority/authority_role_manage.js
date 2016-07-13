import React, {Component, PropTypes} from 'react';
import { render, findDOMNode } from 'react-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import LineRouter from 'common/line_router';
import Select from 'common/select';
import TreeNav from 'common/tree_nav';

import LazyLoad from 'utils/lazy_load';
import { Noty } from 'utils/index';
import V from 'utils/acl';

import * as AuthManageActions from 'actions/authority_role_manage';


class TopHeader extends Component {
  render(){
    return (
        <div className="clearfix top-header">
          <LineRouter
              routes={[{name: '权限管理', link: '/am/user'}, {name: '角色权限管理', link: '/am/roleauthority'}]} />
        </div>
    )
  }
}

class NavBar extends Component{
  constructor(props){
    super(props);
    this.onToggleDept = this.onToggleDept.bind(this);
    this.onChooseRole = this.onChooseRole.bind(this);
  }
  render(){
    return (
        <div className="panel pull-left navbar">
          <header className="panel-heading">
            请选择部门
          </header>
          <div className="panel-body">
            <TreeNav ref="navbar" data={this.props.department_list} onToggle={this.onToggleDept} onChoose={this.onChooseRole}/>
          </div>
        </div>
    )
  }
  onToggleDept(dept_id){
    this.props.gotRoletList(dept_id);
    this.props.toggleDept(dept_id);
  }
  onChooseRole(role_id){
    this.props.onChooseRole(role_id);
  }
}

class TableRow extends Component{
  constructor(props){
    super(props);
    this.state = {
      editable: false,
    }
  }
  render(){
    const { props } = this;
    return (
        props.first_module ?
        <tr>
          <td></td>
          <td></td>
          <td style={{fontSize:16,color:'#9C6B21'}}>{props.module_name}</td>
          <td></td>
        </tr>
        :
        <tr className={props.module_name}>
          <td><input disabled={props.editable ? '' : 'disabled'} checked={this.props.checked_authority_ids.indexOf(props.id) !== -1} onChange={this.clickHandler.bind(this)} type="checkbox"/></td>
          <td style={{textAlign:'left',color:props.type == 'LIST'?'#4f9fcf':''}}>{props.type == 'LIST' ?  props.name:`　　`+ props.name}</td>
          <td style={{color:props.type == 'LIST'?'#4f9fcf':''}}>{props.module_name}</td>
          <td style={{color:props.type == 'LIST'?'#4f9fcf':''}}>{props.description}</td>
        </tr>
    )
  }
  clickHandler(){
    const { id, checked_authority_ids } = this.props;
    let checked = checked_authority_ids.indexOf(id) !== -1;
    this.props.authorityYesNo(id, !checked);
  }
}

class FilterHeader extends Component{
  constructor(props){
    super(props);
    this.state = {
      editable: false,
      submitting: false,
      pri_module_id:-1
    };
    this.submitHanler = this.submitHanler.bind(this);
    this.toggleEditHandler = this.toggleEditHandler.bind(this);
  }
  render(){
    let { editable,module_srcs } = this.props;
    var {pri_module_id} = this.state;
    var pri_module_srcs = module_srcs.filter( m => m.level == 1);
    var sec_module_srcs = module_srcs.filter( m => m.level == 2 && m.parent_id == pri_module_id); 
    return (
        <div className="panel search">
          <div className="panel-body form-inline">
            {
              V('RoleAuthorityManageModuleFilter')
                  ?
                  [<Select ref="primodules" options={pri_module_srcs} onChange={this.onSelectPriModule.bind(this)} default-text="--请选择一级模块--" className="space-right"/>,
                  <Select ref="secmodules" options={sec_module_srcs} onChange={this.onSelectSecModule.bind(this)} default-text="--请选择二级模块--" className="space-right"/>]
                  :
                  null
            }
            {
              V('RoleAuthorityManageAuthEdit')
                  ?
                  <span>
            <button onClick={this.toggleEditHandler} className="btn btn-theme btn-xs space-right">{this.state.editable ? '取消修改' :'编辑'}</button>
            <button data-submitting={this.state.submitting} onClick={this.submitHanler.bind(this)} className="btn btn-theme btn-xs space-left">提交</button>
            </span>
                  :null

            }

          </div>
        </div>
    )
  }
  submitHanler(){
    const { checked_authority_ids, role_id, toggleEdit } = this.props
    this.setState({
      submitting: true
    })
    this.props.putRoleAuthority(role_id, checked_authority_ids)
        .done(function(){
          Noty('success', '保存成功');
          toggleEdit(this.state.editable);
          this.setState({
            editable: !this.state.editable
          });
        }.bind(this))
        .fail(function(msg, code){
          Noty('error', msg || '保存异常');
        })
        .always(() => {
          this.setState({
            submitting: false
          })
        })
  }
  onSelectPriModule(e){
    let {value} = e.target;
    if( value != this.refs.primodules.props['default-value']){
      this.setState({pri_module_id:value});
    }
  }
  onSelectSecModule(e){
    let {value} = e.target;
    if(value != this.refs.secmodules.props['default-value']){
      let selected = $(findDOMNode(this.refs.secmodules)).find(':selected').text();
      this.props.gotRoleListByModuleName(selected);
      //this.props.scrollTop(selected);
    }else{
      this.props.gotRoleListByModuleName('');
    }
  }
  toggleEditHandler(){
    const { toggleEdit, gotRoleAuthorities, role_id } = this.props;
    toggleEdit(this.state.editable);
    if(this.state.editable){
      role_id?gotRoleAuthorities(role_id): '';
    }
    this.setState({
      editable: !this.state.editable
    });
  }
}

class RoleAuthorityPannel extends Component{
  render(){
    const { department_list, list, module_srcs, editable, checked_authority_ids, submitting, on_role_id ,module_name} = this.props.roleAccessManage;
    const { toggleEdit, resetRoleAuthority, gotRoleAuthorities, putRoleAuthority, gotRoletList, toggleDept, authorityYesNo , gotRoleListByModuleName} = this.props;
    let fliterList = list;

    if(module_name != ''){
      fliterList = list.filter(function(e){
        return e.module_name == module_name;
      })
    }else{
      fliterList =[];
      var pri_module_srcs = module_srcs.filter( m => m.level == 1);
      pri_module_srcs.forEach( m => {
        fliterList.push({first_module:true, module_name: m.text})
        var sec_module_srcs = module_srcs.filter( n => n.level == 2 && n.parent_id == m.id);
        sec_module_srcs.forEach( j => {
          fliterList =[...fliterList,...list.filter( h => h.module_id == j.id)];
        }) 
      })      
    }
    var department_list_active = department_list.map(e => {
      /*var children = e.children;*/
      e.children.map(m => {
        m.id == on_role_id ? m.chosen = true:m.chosen = false;
        return m;
      });
      return e;
    });
    let content = fliterList.map((n, id) => {
      return <TableRow key={id} {...n}
                       submitting={submitting}
                       editable={editable}
                       authorityYesNo={authorityYesNo}
                       checked_authority_ids={checked_authority_ids}/>;
    })
    return (
        <div className="authority-manage">
          <TopHeader className="pull-right"/>
          <FilterHeader scrollTop = {this.scrollTop.bind(this)}
                        checked_authority_ids={checked_authority_ids}
                        role_id={on_role_id}
                        editable={editable}
                        module_srcs = {module_srcs}
                        toggleEdit={toggleEdit}
                        resetRoleAuthority={resetRoleAuthority}
                        gotRoleAuthorities={gotRoleAuthorities}
                        putRoleAuthority={putRoleAuthority}
                        gotRoleListByModuleName = {gotRoleListByModuleName}/>
          <NavBar
              department_list={department_list_active}
              gotRoletList={gotRoletList}
              toggleDept={toggleDept}
              onChooseRole={gotRoleAuthorities}/>
          <div style={{marginLeft: '225px'}}>
            <div className="panel">
              <div className="panel-body">
                <div className="table-responsive authority-list" ref="authoritys_container" >
                  <table className="table table-hover text-center">
                    <thead>
                    <tr>
                      <th>授权</th>
                      <th>动作名称</th>
                      <th>所属模块名称</th>
                      <th>动作描述</th>
                    </tr>
                    </thead>
                    <tbody className="authority_tbody" ref="authoritys" >
                    { content }
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
    )
  }
  componentWillMount() {
    const { gotDepartmentListSignal, gotModuleSrcs } = this.props;
    gotDepartmentListSignal('authority');
    gotModuleSrcs();
  }
  componentDidMount() {
    LazyLoad('noty');
    this.props.gotAuthorityList();
  }
  scrollTop(selected){
    let container = $(findDOMNode(this.refs.authoritys_container));
    let onSelected = $(findDOMNode(this.refs.authoritys)).find('.' + selected).first();
    let height = onSelected.position().top;
    container.scrollTop(height);
  }
}

const mapStateToProps = (state) => state.RoleAuthorityManage;


const mapDispatchToProps = (dispatch) => bindActionCreators(AuthManageActions, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(RoleAuthorityPannel);
