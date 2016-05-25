import React, {Component, PropTypes} from 'react';
import {render, findDOMNode} from 'react-dom';
import { reduxForm } from 'redux-form';

import Select from 'common/select';

import LazyLoad from 'utils/lazy_load';
import { Noty } from 'utils/index';
import { SELECT_DEFAULT_VALUE } from 'config/app.config';

export const fields = ['name', 'module_id', 'type', 'description', 'code'];

const validate = (values, props) => {
  const errors = {};
  var msg = 'error';
  var { form } = props;
  function _v(key){
    // touched 为true 表示用户点击处理过
    if (form[key] && form[key].touched && !values[key])
      errors[key] = msg;
  }
  function _v_selsect(key){
    if(form[key] && form[key].touched && (!values[key] || values[key] == SELECT_DEFAULT_VALUE))
      errors[key] = msg;
  }

  _v('name');
  _v('description');
  _v_selsect('module_id');
  _v('code');

  //errors为空对象才表明验证正确
  console.log(errors)
  return errors;
};

class AuthorityForm extends Component{
  constructor(props){
    super(props);
    this.hide = this.hide.bind(this);
    this.saveAuthority = this.saveAuthority.bind(this);
    this.changeAuthority = this.changeAuthority.bind(this);
    this.addAuthority = this.addAuthority.bind(this);
  }
  render(){
    const {
      handleSubmit,
      resetForm,
      fields: {name, module_id, description, code, type},
    } = this.props;
    const { options } = this.props;
    const authorityType = [{id: 'LIST', text: '列表'},{id: 'ELEMENT', text: '页面元素'}]
    return (
      <div>
        <div className="form-group form-inline">
          <label>{'　　动作名称：'}</label>
          <input {...name} className={`form-control input-xs ${name.error}`} type="text" placeholder="必填"/>
        </div>
        <div className="form-group form-inline">
          <label>{'　　所属模块：'}</label>
          <Select />
          <Select {...module_id} values={module_id}  options={options} className={`form-control input-xs ${module_id.error}`} placeholder="必填"/>
        </div>
        <div className="form-group form-inline">
          <label>{'所属权限类型：'}</label>
          <Select {...type} values={type} options={authorityType} className={`form-control input-xs ${type.error}`} placeholder="必填"/>
        </div>
        <div className="form-group form-inline">
          <label>{'　　动作描述：'}</label>
          <input {...description} className={`form-control input-xs ${description.error}`} type="text" placeholder="必填"/>
        </div>
        <div className="form-group form-inline">
          <label>{'　　　CODE ：'}</label>
          <input {...code} className={`form-control input-xs ${code.error}`}/>
        </div>
        <hr/>
        <div className="clearfix">
          <div className="form-group pull-right" >
            <button className="btn btn-default btn-sm space-right" onClick={this.hide}>取消</button>
            <button className="btn btn-theme btn-sm space-left" onClick={handleSubmit(this._check.bind(this, this.saveAuthority))}>提交</button>
          </div>
        </div>
      </div>
    )
  }
  componentDidMount() {
    LazyLoad('noty');
  }
  hide(){
    this.props.resetForm();
    this.props.hide();
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
  saveAuthority(form_data){
    let { active_authority_id } = this.props;
    this.props.editable ? this.changeAuthority(form_data, active_authority_id) : this.addAuthority(form_data);
  }
  changeAuthority(form_data, id){
    const { gotAuthorityList } = this.props;
    this.props.changeAuthority(form_data, id)
      .done(function(){
        Noty('success', '保存成功');
        this.hide();
        gotAuthorityList();
      }.bind(this))
      .fail(function(msg, code){
        Noty('error', msg || '保存异常');
      });
  }
  addAuthority(form_data){
    const { gotAuthorityList } = this.props;
    this.props.addAuthority(form_data)
      .done(function(){
        Noty('success', '保存成功');
        this.hide();
         gotAuthorityList();
      }.bind(this))
      .fail(function(msg, code){
        Noty('error', msg || '保存异常');
      });
  }
}

export default function initAuthorityrForm( initFunc ){
  return reduxForm({
    form: 'authority_form',
    fields,
    validate,
  }, initFunc)( AuthorityForm );
}


