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
        props.first_module?
        <tr>
          <td></td>
          <td></td>
          <td style={{fontSize:16,color:'#9C6B21'}}>{props.module_name}</td>
          <td></td>
          <td></td>
        </tr>:
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
    this.state= {
      pri_module_id:-1,
    }
  }
  render(){
    var {module_srcs}=this.props;
    var {pri_module_id} = this.state;
    var pri_module_srcs = module_srcs.filter( m => m.level == 1);
    var sec_module_srcs = module_srcs.filter( m => m.level == 2 && m.parent_id == pri_module_id);
    return (
        <div className="panel search">
          <div className="panel-body form-inline">
            {
              V('SystemAuthorityManageModuleFilter')
                  ?
                  [<Select ref="primodules" options={pri_module_srcs} onChange={this.onSelectPriModule.bind(this)} default-text="--请选择一级模块--" className="space-right"/>,
                  <Select ref="secmodules" options={sec_module_srcs} onChange={this.onSelectSecModule.bind(this)} default-text="--请选择二级模块--" className="space-right"/>]

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
      this.props.gotAuthorityListByModuleName(selected);
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
    this.viewEditModule = this.viewEditModule.bind(this);
    this.viewEditAuthorityModal = this.viewEditAuthorityModal.bind(this);
    this.viewDeleteAuthorityModal = this.viewDeleteAuthorityModal.bind(this);
  }
  render(){
    const { data, list, module_name, module_srcs} = this.props.roleAccessManage;
    const { active_authority_id } = this.props.systemAccessManage;
    const { addAuthority, changeAuthority, deleteAuthority, addModule, gotAuthorityList, resetAuthorityForm,
        getAuthorityDetail, authorityYesNo, activeAtuthority ,gotAuthorityListByModuleName, gotModuleSrcs, changeModule} = this.props;
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
                        module_srcs={module_srcs} ViewAddModal={this.ViewAddModal}
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

          <AddModal ref="viewAdd" viewAddAuthority={this.viewAddAuthority} viewAddModule={this.viewAddModule} viewEditModule={this.viewEditModule}/>
          <AddAuthorityModal ref="viewAddAuthority" 
             module_srcs = {module_srcs}
             gotModuleSrcs = {gotModuleSrcs}
             addAuthority={addAuthority} gotAuthorityList={gotAuthorityList} resetAuthorityForm={resetAuthorityForm}/>
          <EditAuthorityModal ref="editAuthority" 
            module_srcs = {module_srcs}
            gotModuleSrcs = {gotModuleSrcs}
            active_authority_id={active_authority_id} gotAuthorityList={gotAuthorityList}  getAuthorityDetail={getAuthorityDetail} changeAuthority={changeAuthority}/>
          <AddModuleModal ref="viewAddModule" 
            module_srcs = {module_srcs}
            gotModuleSrcs = {gotModuleSrcs} 
            addModule={addModule}/>
          <EditModuleModal ref='viewEditModule' 
            module_srcs = {module_srcs}
            gotModuleSrcs = {gotModuleSrcs}
            changeModule = {changeModule}/>
          <DeleteAuthorityModal ref="deleteAuthority" deleteAuthority={deleteAuthority}/>
        </div>
    )
  }
  componentWillMount() {
    const { gotAuthorityList } = this.props;
    gotAuthorityList();
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
  viewEditModule(){
    this.refs.viewEditModule.show();
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
    this.openEditModule = this.openEditModule.bind(this);
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
                  <button onClick={this.openAddModule} className="btn btn-theme btn-md" style={{marginLeft:110}}>添加模块</button>
                  :null
            }
            {
              V('SystemAuthorityManageEditModule')
                ?
                <button onClick={this.openEditModule} className='btn btn-theme btn-md pull-right'>编辑模块</button>
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
  openEditModule(){
    this.props.viewEditModule();
  }
}

class AddAuthorityModal extends Component{
  constructor(props){
    super(props);
    this.hide = this.hide.bind(this);
  }
  render(){
    const { options, addAuthority, gotAuthorityList, module_srcs, gotModuleSrcs } = this.props;
    return (
        <StdModal footer={false} title="添加权限" ref="viewAuthorityAdd" >
          <AuthorityFormEdit editable={false} ref="authorityFormAdd" options={options}
            module_srcs = {module_srcs}
            gotModuleSrcs = {gotModuleSrcs} 
            gotAuthorityList={gotAuthorityList} addAuthority={addAuthority} hide={this.hide}/>
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
    const { options,changeAuthority, gotAuthorityList, module_srcs, gotModuleSrcs } = this.props;
    return (
        <StdModal footer={false} title="修改权限" ref="viewAuthorityEdit">
          <AuthorityFormEdit editable={true} ref="authorityFormEdit"
            module_srcs = {module_srcs}
            gotModuleSrcs = {gotModuleSrcs} 
            gotAuthorityList={gotAuthorityList} active_authority_id={this.props.active_authority_id} options={options} changeAuthority={changeAuthority} hide={this.hide}/>
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
    this.state = {
      module_name: '',
      level:1, 
      error: false,
      pri_module_id:-1,
    };
    this.onChange = this.onChange.bind(this);
  }
  render(){
    const { options ,module_srcs } = this.props;
    var pri_module_srcs, sec_module_srcs = [];
    var {pri_module_id } = this.state;
    pri_module_srcs = module_srcs.filter( m => m.level == 1);
    sec_module_srcs = module_srcs.filter( m => m.level == 2 && m.parent_id == pri_module_id);
    return (
        <StdModal title="添加模块" ref="viewModuleAdd" onConfirm={this.onConfirm.bind(this)}>
          <form>
            <div className="form-group form-inline">
              <label>{'模块等级：'}</label>
              <label><input type = 'radio' checked = {this.state.level == 1} onClick={this.onPriLevelCheck.bind(this)}/>一级</label>{'　'}
              <label><input type = 'radio' checked = {this.state.level == 2} onClick={this.onSecLevelCheck.bind(this)}/>二级</label>
            </div>
            <div className="form-group form-inline">
              <label>{'模块名称：'}</label>
              <input value={this.state.module_name} onChange={this.onChange} className={`form-control input-xs ${this.state.error? 'error': ''}`} type="text" placeholder="必填"/>
            </div>
            {
              this.state.level != 1
              ? [<div className="form-group form-inline">
                  <label>{'所属模块：'}</label>
                  <Select ref='pri_module' default-text='--请选择一级模块--' options = {pri_module_srcs} onChange={this.onPriLevelSelect.bind(this)}/>
                </div>,
                <div className="form-group form-inline" style={{paddingBottom:10}}>
                  <label className="pull-left">{'已有模块：'}</label>
                  {
                    sec_module_srcs.map( m => {
                      return (
                        <div style={{float:'left',height:'30px',margin:'0px 5px',}}>
                          <span className='partBtn'><i className='fa fa-star-o'></i>{ m.text }</span>      
                        </div>
                        )
                    })
                  }
                </div>
                ]
              : <div className="form-group form-inline" style={{paddingBottom:10}}>
                  <label className="pull-left">{'已有模块：'}</label>
                  {
                    pri_module_srcs.map( m => {
                      return (
                        <div style={{float:'left',height:'30px',margin:'0px 5px',}}>
                          <span className='partBtn'><i className='fa fa-star-o'></i>{ m.text }</span>      
                        </div>
                        )
                    })
                  }
                </div>
            }
            {/*<div className="form-group form-inline">
              <label className="pull-left">{'已有模块：'}</label>
              {
                sec_module_srcs.map( m => {
                  return (
                    <div style={{float:'left',height:'30px',margin:'5px 5px',}} onClick={this.chooseSecModule.bind(this, m.id, m.text)}>
                      <span className={this.state.active_module_id == m.id ?'partBtn active':'partBtn'}><i className='fa fa-star-o'></i>{ m.text }</span>      
                    </div>
                    )
                })
              }
            </div>*/}
          </form>
        </StdModal>
    )
  }
  show(){
    this.refs.viewModuleAdd.show();
    this.props.gotModuleSrcs();
  }
  onChange(e){
    this.setState({
      module_name: e.target.value,
      error: false
    })
  }
  onConfirm(){
    let module_name = this.state.module_name;
    var {level, pri_module_id} = this.state;
    if(level == 2 && pri_module_id == -1){
      Noty('warning', '请选择一级模块');
      return;
    }
    var _this = this;
    if(module_name){
      var data = {};
      data.module_name = module_name;
      if(level == 2){
        data.parent_id = this.state.pri_module_id;
      }
      this.props.addModule(data)
          .done(function(){
            Noty('success', '保存成功');
            this.refs.viewModuleAdd.hide();
            _this.setState({module_name: '', level: 1, pri_module_id: -1});
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
  onPriLevelCheck(){
    this.setState({level:1});
  }
  onSecLevelCheck(){
    this.setState({level:2});
  }
  onPriLevelSelect(e){
    this.setState({pri_module_id: e.target.value});
  }
}

class EditModuleModal extends Component{
  constructor(props){
    super(props);
    this.state={
      level:1,
      active_module_id:0,
      active_module_name:'',
      pri_module_id:-1,
    }
  }
  render(){
    var {module_srcs } = this.props;
    var pri_module_srcs = module_srcs.filter (m => m.level == 1);
    var {pri_module_id } = this.state;
    var sec_module_srcs = module_srcs.filter ( m => m.level == 2 && m.parent_id == pri_module_id);
    return (
      <StdModal ref='viewModuleEdit' title='编辑模块' footer={false}>
        <div className='form-group '>
          <div className='form-inline'><label>一级模块：</label></div>
          <div className='form-inline'>
            {
              pri_module_srcs.map( m => {
                return (
                  <div style={{float:'left',height:'30px',margin:'5px 5px',}} onClick={this.chooseModule.bind(this, m.id, m.text)}>
                    <span className={this.state.pri_module_id == m.id ?'partBtn active':'partBtn'}><i className='fa fa-star-o'></i>{ m.text }</span>      
                  </div>
                  )
              })
            }
          </div>
          <div className='form-inline' style={{clear: 'both'}}><label>二级模块：</label></div>
          <div className='form-inline'>
            {
              sec_module_srcs.map( m => {
                return (
                  <div style={{float:'left',height:'30px',margin:'5px 5px',}} onClick={this.chooseSecModule.bind(this, m.id, m.text)}>
                    <span className={this.state.active_module_id == m.id ?'partBtn active':'partBtn'}><i className='fa fa-star-o'></i>{ m.text }</span>      
                  </div>
                  )
              })
            }
          </div>
          <hr style={{clear:'both'}}/>
          <div className='form-inline'>
            <label>模块名称：</label>
            <input type='text' className='form-control input-xs' value={this.state.active_module_name}
              onChange={this.moduleNameChange.bind(this)}/>
          </div>
          <div className='form-inline'>
            <label>模块等级：</label>
            <input type='radio' checked={this.state.level == 1} onClick={this.onPriLevelCheck.bind(this)}/>一级{'　'}
            <input type='radio' checked={this.state.level != 1} onClick={this.onSecLevelCheck.bind(this)}/>二级
          </div>
          {
            this.state.level != 1
            ?<div className='form-inline'>
              <label>{'　父模块：'}</label>
              <Select options={pri_module_srcs} value={this.state.pri_module_id} onChange={this.onPriModuleChange.bind(this)}/>
            </div>
            :null
          }
          <div className='form-inline' style={{marginTop:15}}>
            <button className='btn btn-default btn-xs space-right ' onClick = {this.onReset.bind(this)}>重置</button>
            <button className='btn btn-theme btn-xs space-left ' onClick={this.onConfirm.bind(this)}>确定</button>
          </div>
        </div>

      </StdModal>
      )
  }
  show(){
    this.refs.viewModuleEdit.show();
    this.props.gotModuleSrcs();
  }
  chooseModule(id,text){
    this.setState({active_module_id:id, pri_module_id: id, active_module_name: text, level:1});
  }
  chooseSecModule(id, text){
    this.setState({active_module_id:id, active_module_name:text, level:2});
  }
  onPriLevelCheck(){
    this.setState({level:1})
  }
  onSecLevelCheck(){
    this.setState({level:2})
  }
  moduleNameChange(e){
    this.setState({active_module_name: e.target.value});
  }
  onPriModuleChange(e){
    this.setState({pri_module_id: e.target.value})
  }
  onReset(){
    var {active_module_id} = this.state;
    var {module_srcs} = this.props;
    module_srcs.forEach( m => {
      if(m.id == active_module_id)
        {
          this.setState({
            level:m.level,
            pri_module_id:m.parent_id ? m.parent_id : 0,
            active_module_name: m.text,
          })
        }
    })
  }
  onConfirm(){
    var form_data = {};
    var {level,pri_module_id, active_module_id, active_module_name} = this.state;
    if( level == 2){
      if(pri_module_id == -1)
        {Noty('warning', '请选择一级模块')}
      else 
        form_data.parent_id = pri_module_id;
    }
    var _this = this;
    form_data.module_name = active_module_name;
    this.props.changeModule(form_data, active_module_id)
      .done(function(){
        Noty('success', '修改成功');
        _this.setState({
          active_module_id:0,
          level:1,
          active_module_name: '',
          pri_module_id: -1
        })
      })

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
