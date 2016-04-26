import React, {Component, PropTypes} from 'react';
import { render, findDOMNode } from 'react-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import LinkedStateMixin from 'react-addons-linked-state-mixin';

import { Noty } from 'utils/index';
import V from 'utils/acl';

import StdModal from 'common/std_modal';
import LineRouter from 'common/line_router';
import Select from 'common/select';

import AuthorityFormEdit from './authority_form_edit';

import * as AuthManageActions from 'actions/authority_role_manage';
import * as AuthSystemActions from 'actions/authority_system_manage';


class TopHeader extends Component {
  render(){
    return (
        <div className="clearfix top-header">
          <LineRouter
              routes={[{name: '权限管理', link: '/am/user'}, {name: '系统权限管理', link: '/am/roleauthority'}]} />
        </div>
    )
  }
}

class TableRow extends Component{
  render(){
    const { props } = this;
    return (
        <tr className={props.module_name}>
          <td style={{textAlign:'left',color:props.type == 'LIST'?'#4f9fcf':''}}>{props.type == 'LIST' ?  props.name: `　　`+props.name}</td>
          <td style={{color:props.type == 'LIST'?'#4f9fcf':''}}>{props.module_name}</td>
          <td style={{color:props.type == 'LIST'?'#4f9fcf':''}}>{props.description}</td>
          <td style={{color:props.type == 'LIST'?'#4f9fcf':''}}>{props.code}</td>
          <td style={{color:props.type == 'LIST'?'#4f9fcf':''}}>
            {
              V('SystemAuthorityManageAuthEdit')
                  ?
                  <a onClick={this.viewEditAuthorityModal.bind(this)} href="javascript:;">[ 编辑 ] </a>
                  :
                  null
            }
            {
              V('SystemAuthorityManageAuthRemove')
                  ?
                  <a onClick={this.viewDeleteAuthorityModal.bind(this)} href="javascript:;"> [ 删除 ]</a>
                  :
                  null
            }

          </td>
        </tr>
    )
  }
  viewEditAuthorityModal(){
    let { activeAtuthority, viewEditAuthorityModal, id } = this.props;
    activeAtuthority(id);
    viewEditAuthorityModal(id);
  }
  viewDeleteAuthorityModal(){
    let authorize_id = this.props.id;
    this.props.viewDeleteAuthorityModal(authorize_id);
  }
}

class FilterHeader extends Component{
  constructor(props){
    super(props);
    this.onSelectModule = this.onSelectModule.bind(this);
  }
  render(){
    return (
        <div className="panel search">
          <div className="panel-body form-inline">
            {
              V('SystemAuthorityManageModuleFilter')
                  ?
                  <Select ref="modules" options={this.props.options} onChange={this.onSelectModule} default-text="--请选择所属模块--" className="space-right"/>
                  :
                  null
            }
            {
              V('SystemAuthorityManageAddDialog')
                  ?
                  <button onClick={this.viewAdd.bind(this)} className="btn btn-theme btn-xs pull-right">添加</button>
                  :
                  null
            }

          </div>
        </div>
    )
  }
  viewAdd(){
    this.props.ViewAddModal();
  }
  onSelectModule(e){
    let {value} = e.target;
    if(value != this.refs.modules.props['default-value']){
      let selected = $(findDOMNode(this.refs.modules)).find(':selected').text();
      this.props.gotAuthorityListByModuleName(selected);
      this.props.scrollTop(selected);
    }else{
      this.props.gotAuthorityListByModuleName('');
    }
  }
}

class SystemAuthorityPannel extends Component{
  constructor(props){
    super(props);
    this.ViewAddModal = this.ViewAddModal.bind(this);
    this.viewAddAuthority = this.viewAddAuthority.bind(this);
    this.viewAddModule = this.viewAddModule.bind(this);
    this.viewEditAuthorityModal = this.viewEditAuthorityModal.bind(this);
    this.viewDeleteAuthorityModal = this.viewDeleteAuthorityModal.bind(this);
  }
  render(){
    const { data, list, module_list ,module_name} = this.props.roleAccessManage;
    const { active_authority_id } = this.props.systemAccessManage;
    const { addAuthority, changeAuthority, deleteAuthority, addModule, gotAuthorityList, gotModuleList, resetAuthorityForm,
        getAuthorityDetail, authorityYesNo, activeAtuthority ,gotAuthorityListByModuleName} = this.props;
    let fliterList = list;   
    if(module_name != ''){
      fliterList = list.filter(function(e){
        return e.module_name == module_name;
      })
    }

    let content = fliterList.map((n, id) => {
      return <TableRow key={id} {...n}
                       activeAtuthority = {activeAtuthority}
                       authorityYesNo={authorityYesNo}
                       viewDeleteAuthorityModal={this.viewDeleteAuthorityModal}
                       viewEditAuthorityModal={this.viewEditAuthorityModal}/>;
    })
    return (
        <div className="authority-manage">
          <TopHeader className="pull-right"/>
          <FilterHeader list={list}
                        scrollTop = {this.scrollTop.bind(this)}
                        options={module_list} ViewAddModal={this.ViewAddModal}
                        gotAuthorityListByModuleName = {gotAuthorityListByModuleName}/>
          <div className="panel">
            <div className="panel-body">
              <div className="table-responsive authority-list" ref="authoritys_container">
                <table className="table table-hover text-center">
                  <thead>
                  <tr>
                    <th>动作名称</th>
                    <th>所属模块名称</th>
                    <th>动作描述</th>
                    <th>code</th>
                    <th>管理操作</th>
                  </tr>
                  </thead>
                  <tbody className="authority_tbody" ref="authoritys">
                  { content }
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <AddModal ref="viewAdd" viewAddAuthority={this.viewAddAuthority} viewAddModule={this.viewAddModule}/>
          <AddAuthorityModal ref="viewAddAuthority" options={module_list} addAuthority={addAuthority} gotAuthorityList={gotAuthorityList} resetAuthorityForm={resetAuthorityForm}/>
          <EditAuthorityModal ref="editAuthority" active_authority_id={active_authority_id} gotAuthorityList={gotAuthorityList} options={module_list} getAuthorityDetail={getAuthorityDetail} changeAuthority={changeAuthority}/>
          <AddModuleModal ref="viewAddModule" options={module_list} addModule={addModule} gotModuleList={gotModuleList}/>
          <DeleteAuthorityModal ref="deleteAuthority" deleteAuthority={deleteAuthority}/>
        </div>
    )
  }
  componentWillMount() {
    const { gotAuthorityList, gotModuleList } = this.props;
    gotAuthorityList();
    gotModuleList();
  }
  scrollTop(selected){
    let container = $(findDOMNode(this.refs.authoritys_container));
    let onSelected = $(findDOMNode(this.refs.authoritys)).find('.' + selected).first();
    var top = onSelected.position().top;
    container.scrollTop(top);
  }
  ViewAddModal(){
    this.refs.viewAdd.show();
  }
  viewAddAuthority(){
    this.refs.viewAddAuthority.show();
  }
  viewAddModule(){
    this.refs.viewAddModule.show();
  }
  viewEditAuthorityModal(id){
    this.refs.editAuthority.show(id);
  }
  viewDeleteAuthorityModal(authorize_id){
    this.refs.deleteAuthority.show(authorize_id);
  }
}

class AddModal extends Component{
  constructor(props){
    super(props);
    this.openAddAuthority = this.openAddAuthority.bind(this);
    this.openAddModule = this.openAddModule.bind(this);
  }
  render(){
    return (
        <StdModal footer={false} title="添加内容" ref="viewAdd">
          <div style={{'padding': '30px 50px 60px'}} className="clearfix">
            {
              V('SystemAuthorityManageAddAuth')
                  ?
                  <button onClick={this.openAddAuthority} className="btn btn-theme btn-md pull-left">添加权限</button>
                  :null
            }
            {
              V('SystemAuthorityManageAddModule')
                  ?
                  <button onClick={this.openAddModule} className="btn btn-theme btn-md pull-right">添加模块</button>
                  :null
            }

          </div>
        </StdModal>
    )
  }
  show(){
    this.refs.viewAdd.show();
  }
  openAddAuthority(){
    this.props.viewAddAuthority();
  }
  openAddModule(){
    this.props.viewAddModule();
  }
}

class AddAuthorityModal extends Component{
  constructor(props){
    super(props);
    this.hide = this.hide.bind(this);
  }
  render(){
    const { options, addAuthority, gotAuthorityList } = this.props;
    return (
        <StdModal footer={false} title="添加权限" ref="viewAuthorityAdd" >
          <AuthorityFormEdit editable={false} ref="authorityFormAdd" options={options} gotAuthorityList={gotAuthorityList} addAuthority={addAuthority} hide={this.hide}/>
        </StdModal>
    )
  }
  show(){
    this.props.resetAuthorityForm();
    this.refs.viewAuthorityAdd.show();
  }
  hide(){
    this.refs.viewAuthorityAdd.hide();
  }
}

class EditAuthorityModal extends Component{
  constructor(props){
    super(props);
    this.hide = this.hide.bind(this);
  }
  render(){
    const { options,changeAuthority, gotAuthorityList } = this.props;
    return (
        <StdModal footer={false} title="修改权限" ref="viewAuthorityEdit">
          <AuthorityFormEdit editable={true} ref="authorityFormEdit" gotAuthorityList={gotAuthorityList} active_authority_id={this.props.active_authority_id} options={options} changeAuthority={changeAuthority} hide={this.hide}/>
        </StdModal>
    )
  }
  show(id){
    this.refs.viewAuthorityEdit.show();
    const { getAuthorityDetail } = this.props;
    getAuthorityDetail(id);
  }
  hide(){
    this.refs.viewAuthorityEdit.hide();
  }
}

class AddModuleModal extends Component{
  constructor(props){
    super(props);
    this.state = {module_name: '', error: false};
    this.onChange = this.onChange.bind(this);
  }
  render(){
    const { options } = this.props;
    var content = options.map((n, i) => {
      return <li key={n.id} className="list-group-item" style={{padding: '5px'}}>{n.text}</li>;
    })
    return (
        <StdModal title="添加模块" ref="viewModuleAdd" onConfirm={this.onConfirm.bind(this)}>
          <form>
            <div className="form-group form-inline">
              <label>{'模块名称：'}</label>
              <input value={this.state.module_name} onChange={this.onChange} className={`form-control input-xs ${this.state.error? 'error': ''}`} type="text" placeholder="必填"/>
            </div>
            <div className="form-group form-inline">
              <label className="pull-left">{'已有模块：'}</label>
              <ul style={{marginLeft: '65px', width: '200px',height: '150px', overflow: 'auto'}} className="list-group">
                { content }
              </ul>
            </div>
          </form>
        </StdModal>
    )
  }
  show(){
    this.refs.viewModuleAdd.show();
    this.props.gotModuleList();
  }
  onChange(e){
    this.setState({
      module_name: e.target.value,
      error: false
    })
  }
  onConfirm(){
    let module_name = this.state.module_name;
    if(module_name){
      this.props.addModule(module_name)
          .done(function(){
            Noty('success', '保存成功');
            this.refs.viewModuleAdd.hide();
            this.setState({module_name: ''});
          }.bind(this))
          .fail(function(msg, code){
            Noty('error', msg || '保存异常');
          });
    }else{
      this.setState({
        error: true
      });
      Noty('warning', '请填写模块名');
    }
  }
}

class DeleteAuthorityModal extends Component{
  constructor(props){
    super(props);
    this.state = {authorize_id: undefined};
  }
  render(){
    return (
        <StdModal title="删除" ref="ViewDeleteAuthority" onConfirm={this.onConfirm.bind(this)}>
          <div style={{textIndent: 'center'}}>
            请确认删除
          </div>
        </StdModal>
    )
  }
  show(authorize_id){
    this.setState({
      authorize_id: authorize_id
    });
    this.refs.ViewDeleteAuthority.show();
  }
  onConfirm(){
    let authorize_id = this.state.authorize_id;
    this.props.deleteAuthority(authorize_id)
    setTimeout(() => {
      this.refs.ViewDeleteAuthority.hide();
    },100);
  }
}


function mapStateToProps(state){
  return state.SystemAuthorityManage;
}

function mapDispatchToProps(dispatch){
  return bindActionCreators({...AuthManageActions, ...AuthSystemActions}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(SystemAuthorityPannel);