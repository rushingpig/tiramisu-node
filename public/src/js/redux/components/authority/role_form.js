import React,{Component,PropTypes} from 'react';
import Select from 'common/select';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import { bindActionCreators } from 'redux';

import {  SELECT_DEFAULT_VALUE } from 'config/app.config';
import LazyLoad from 'utils/lazy_load';
import {Noty} from 'utils/index';

export const fields=['name','org_id','description','data_scope_id'];

const validate = (values,props) => {
  const errors = {};
  var msg = 'error';
  var {form} = props;
  function _v(key){
    if(form[key] && form[key].touched && !values[key])
      errors[key] = msg;
  }

  function _v_select(key){
    if(form[key] && form[key].touched && (!values[key] || values[key] == SELECT_DEFAULT_VALUE))
      errors[key] = msg
  }

  _v('name');
  _v_select('org_id');
  _v_select('data_scope_id');

  return errors;
}

class RoleForm extends Component{
  constructor(props){
    super(props);
    this.hide=this.hide.bind(this);
    this.saveRole=this.saveRole.bind(this);
    this.changeRole=this.changeRole.bind(this);
    this.addRole=this.addRole.bind(this);
  }
  render(){
    const {
      handleSubmit,
      fields:{name,org_id,description,data_scope_id},
    } = this.props;
    const { depts,dataaccess}=this.props;
    return (
      <div>
        <div className='form-group form-inline'>
          <label>{'　　角色名称：'}</label>
          <input {...name} type="text" className={`form-control input-xs ${name.error}`}/>
        </div>
        <div className='form-group form-inline'>
          <label>{'角色职能描述：'}</label>
          <input  {...description} type="text" className="form-control input-xs"/>
        </div>
        <div className='form-group form-inline'>
          <label>{'　　所属部门：'}</label>
          <Select {...org_id} values={org_id} options={depts} className={`form-control input-xs ${org_id.error}`}/>
        </div> 
        <div className='form-group form-inline'>
          <label>{'角色数据权限：'}</label>
          <Select {...data_scope_id} values={data_scope_id} options={dataaccess} className={`form-control input-xs ${data_scope_id.error}`}/>
        </div>
        <div className='clearfix'>
          <div className='form-group pull-right'>
            <button className="btn btn-default btn-sm space-right" onClick={this.hide}>取消</button>
            <button ref='submit_btn' className="btn btn-theme btn-sm space-left" onClick={handleSubmit(this._check.bind(this, this.saveRole))}>提交</button>           
          </div>
        </div> 
      </div>                   
      )    
  }



  componentDidMount(){
    LazyLoad('noty');
  }
  _check(callback, form_data){
    setTimeout(() => {
      var { errors } = this.props;
      if(!Object.keys(errors).length){
        callback.call(this, form_data);
      }else{
        Noty('warning', '请填写完整');
      }
    }, 0);
  }

  hide(){
    this.props.resetForm();
    this.props.hide();
  }
  saveRole(form_data){
    this.refs.submit_btn.disabled = true;
    let  {handle_role_id}  = this.props;
    this.props.editable ? this.changeRole(form_data, handle_role_id) : this.addRole(form_data);
  }
  changeRole(form_data, id){
    this.props.changeRole(form_data, id)
      .done(function(){
        Noty('success', '保存成功');
        this.hide();
        this.refs.submit_btn.disabled = false;
      }.bind(this))
      .fail(function(msg, code){
        Noty('error', msg || '保存异常');
        this.refs.submit_btn.disabled = false;
      });
  }
  addRole(form_data){
    this.props.addRole(form_data)
      .done(function(){
        Noty('success', '保存成功');
        this.hide();
        this.refs.submit_btn.disabled = false;
        //this.props.getRoleInfoList();
      }.bind(this))
      .fail(function(msg, code){
        Noty('error', msg || '保存异常');
        this.refs.submit_btn.disabled = false;
      });
  }

}

export default function initRoleForm(initFunc){
  return reduxForm({
    form:'role_form',
    fields,
    validate,
    touchOnBlur:true,
  },initFunc)(RoleForm);
}






