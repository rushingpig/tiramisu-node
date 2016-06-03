import React, {Component, PropTypes} from 'react';
import {render, findDOMNode} from 'react-dom';
import { reduxForm } from 'redux-form';

/*import { isSrc } from 'reducers/form';*/
import Select from 'common/select';
import LazyLoad from 'utils/lazy_load';
import { Noty, form as uForm, dateFormat } from 'utils/index';
import { SELECT_DEFAULT_VALUE ,CHECKBOXGROUP_DEFAULT_VALUE} from 'config/app.config';
import CheckBoxGroup from 'common/checkbox_group';

import history from 'history_instance';


import FormFields from 'config/form.fields';

const validate = (values,props) => {
  const errors = {};
  var msg = 'error';
  var labelmsg = 'labelRed';
  var { form } = props;

  var {editable} =props;

  function _v(key){
     if (form[key] && form[key].touched && !values[key])
      errors[key] = msg;   
  }

  function _v_mobile(key){
     if (form[key] && form[key].touched && !values[key] || (form[key] && !form[key].focus && values[key] && !uForm.isMobile(values[key]))){
      errors[key] = msg;
    }   
  }

  function _v_select(key){
    if(form[key] && form[key].touched && (!values[key] || values[key] == SELECT_DEFAULT_VALUE))
      errors[key] = msg;
  }

  function _v_checkboxgroup(key){
    //|| values[key].length == 0
    if(form[key] && form[key].touched && (!values[key]) || (values[key] != undefined && values[key].length==0))
      errors[key] = msg;
  }

  _v('username');
  if(!editable){
    _v('pwd');   
  } 
  _v('name');
  _v_mobile('mobile');
  _v_checkboxgroup('stations_in');
  _v_checkboxgroup('roles_in');

/*  _v_select('dept_id');
  _v_select('province_id');*/
/*  _v_checkboxgroup('station_ids');
  _v_checkboxgroup('role_ids');*/

  return errors;
}

function RoleNode( props ){
  var { data ,onChoose } = props;
  return (
    <span style={{'float':'left','marginLeft':'15'}}>
      <input type='checkbox' checked={data.active}/>{data.role}
    </span>
    )
}



class ManageAddForm extends Component{
  constructor(props){
    super(props);
    this._check=this._check.bind(this);
  }
  render(){
    var {
      editable,
      handleSubmit,
      fields:{
        username,
        pwd,
        name,
        mobile,
        dept_id,
        province_id,
        tmp_roles,
        role_ids,
        tmp_cities,
        city_ids,
        tmp_stations,
        station_ids,
        cities_in,
        stations_in,
        roles_in,
        is_national,
        en_delivery,
      },
      roles_in_test,
    } = this.props;
    /*var {depts} = this.props.roleinfo;*/
    var {dept_role,area} = this.props;
    var {provinces,cities}= area;
    var {depts,roles,stations} = dept_role;

    return (
    <div>
      <div className="form-group form-inline">
        <label>{'　　用户名：'}</label>
        <input {...username} className={`form-control input-xs ${username.error}`} ref='username'  type='text' />
      </div>
      <div className="form-group form-inline">
        <label>{'　　　密码：'}</label>
        <input {...pwd} className={`form-control input-xs ${pwd.error}`} ref='pwd'  type='password' id="pwd"/>
        <span id="togglePwdStatus" onClick={this.onPwdToggle.bind(this)} style={{marginLeft:10,color:'blue',textDecoration:'underline',cursor:'Default'}}>{'密码可视'}</span>
      </div>
      <div className="form-group form-inline">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-3" style={{'paddingLeft':'0'}}>
              <label>{'　真实姓名：'}</label>
              <input {...name} className={`form-control input-xs ${name.error}`} type='text' />              
            </div>
            <div className="col-md-3" style={{'paddingLeft':'0'}}>
              <label>{'　电话号码：'}</label>
              <input {...mobile} className={`form-control input-xs ${mobile.error}`}  type='text' ref='mobile' />
            </div>
            <div className='col-md-6'></div>
          </div>
        </div>


      </div>
      <div className="form-group form-inline">
        <fieldset className={`box-wrapper ${roles_in.error}`} style={{'border':'1px solid #ddd'}}>
          <legend style={{'padding':'5px 10px','fontSize':'14','width':'auto','border':'0'}}>角色选择</legend>
          <div>
            <label>{'　　　部门：'}</label>
            <Select ref='department' options={[{'id':999,'text':'全部角色'},...depts]} {...dept_id} className="form-select" default-text="--请选择用户所属部门--" onChange={this.onDeptChange.bind(this,dept_id.onChange)} />
            <div style={{'marginLeft':60,}}>
              <CheckBoxGroup className="input-xs"  ref='role' {...tmp_roles} value={roles_in.value || []}  checkboxs={roles} />
            </div>
            
            <label >{'　已选角色：'}</label>
            {/*<CheckBoxGroup  name="已选角色" {...role_ids} checkboxs={roles.filter( n => role_ids.value.some(m => m == n.id) )}/>*/}
            <div style={{'marginLeft':60}}>
              <CheckBoxGroup ref='roles_in' name="已选角色" checkboxs={roles_in.value||[]} value={roles_in.value}  {...roles_in}/>
              {
                roles_in.value && roles_in.value.some( m => m.text == '配送员')
                ?<div style={{color:'#9C6B21'}}><input {...en_delivery} checked={en_delivery.value} type='checkbox'/>{'参与配送'}</div>
                :null
              }
            </div>
          </div>
        </fieldset>

        {/*checkboxs={roles.filter( n => role_ids.value.some(m => m == n.id) )}*/}
      </div>
      

      <div className="form-group form-inline" style={{'clear':'both'}}>
        <fieldset className={`box-wrapper ${stations_in.error}`} style={{'border':'1px solid #ddd'}}>
          <legend style={{'padding':'5px 10px','fontSize':'14','width':'auto','border':'0'}}>城市及配送站选择</legend>
          <div>
            <div className="form-group form-inline" style={{clear:'both',}}>
              <label>{'　　　省份：'}</label>
              <Select ref='province' className={`input-xs ${province_id.error}`} options={[{'id':999,'text':'全部城市'},...provinces]} {...province_id} onChange={this.onProvinceChange.bind(this,province_id.onChange)} />
              <div style={{'marginLeft':60,}}>
                <CheckBoxGroup name="城市" {...tmp_cities} value={cities_in.value || []}  checkboxs={[{'id':999,'text':'总部'},...cities]} onChange={this.onCityChange.bind(this,tmp_cities.onChange)}/>
              </div>
              <label >{'　已选城市：'}</label>
              {/*<CheckBoxGroup ref='city' {...city_ids} checkboxs={[{'id':999,'text':'总部'},...cities.filter( n=> city_ids.value.some(m => m== n.id))]} />*/}
              <div style={{'marginLeft':60,}}>
                <CheckBoxGroup ref='city' {...cities_in} checkboxs={cities_in.value||[]} value={cities_in.value}/>
              </div>
            </div>  
            <hr/>   
            <div className="form-group form-inline" style={{clear:'both',}}>
              <label className={`input-xs ${station_ids.error}`}>{'所属配送站：'}</label>
                <div style={{'marginLeft':60}}>
                  <div style={{color:'#9C6B21'}}><input type='checkbox' {...is_national} checked={is_national.value}/>{'所属城市全部配送站'}</div>
                  <CheckBoxGroup name="配送站" {...tmp_stations} checkboxs={stations} value={stations_in.value || []} />
                </div>
              <label  className="input-xs">{'已选配送站：'}</label>
                <div style={{'marginLeft':60,}}>
                  <CheckBoxGroup name="配送站" {...stations_in} checkboxs={stations_in.value||[]} value={stations_in.value}/>
                </div>
            </div>
          </div>
        </fieldset>
      </div>
      <div className="form-group" >
        <button
            key="cancelBtn"
            onClick={this.cancel}
            className="btn btn-default btn-xs space-right">取消</button>      
      {
        !editable
        ?
        <button
            key="submitBtn"
            onClick={handleSubmit(this._check.bind(this, this.handleCreateUser))}
            className="btn btn-theme btn-xs space-left">提交</button>
            :
        <button 
          onClick={handleSubmit(this._check.bind(this,this.handleSubmitUser))} 
          className="btn btn-theme btn-xs space-left">提交</button>
      }
      </div>
    </div>
      )
  }

  _check(callback,form_data){
    setTimeout(()=>{
        var {dispatch,user_id,errors} =this.props;
        var user_info = this.props['form-data'].data;
        if(!Object.keys(errors).length){
          form_data.user_id = user_id;
          form_data.u_name = user_info.name;
          callback.call(this,form_data);  //以callback来代替this 调用
        }else{
          console.warn(Object.keys(errors).length)
          Noty('warning','请填写完整');
        }
    },0);
  }
  handleCreateUser(form_data){
    this.props.actions.createUser(form_data)
      .done(function(){
        this.props.actions.resetStations();
        Noty('success','保存成功');
        history.push('/am/user');
      }.bind(this))
      .fail(function(msg){
        Noty('error',msg || '保存异常');
      })
  }
  handleSubmitUser(form_data){
      this.props.actions.submitUser(form_data).done(function(){
        this.props.actions.resetStations();
        Noty('success', '已成功提交！');
        history.push('/am/user');
      }).fail(function(msg){
        Noty('error', msg || '操作异常');
      });

  }
  cancel(){
    history.push("/am/user");
  }
  componentDidMount(){
/*    var {getDepts} = this.props.actions;
    getDepts();*/
    LazyLoad('noty');
    var {getProvincesSignal,getDeptsSignal, resetRoles } = this.props.actions;
    var {params} = this.props;
    resetRoles();
    getProvincesSignal("authority");
    getDeptsSignal("authority");
  }
  onProvinceChange(callback,e){
    var {value} = e.target;
    this.props.actions.resetCities();
    if(value == 999)
      this.props.actions.getAllCities("authority");
    else
      if(value != this.refs.province.props['default-value'])
        this.props.actions.getCitiesSignal(value,"authority");
    callback(e);
  }

  onCityChange(callback,e){

    //this.props.actions.
    /*var {value} = e.target;*/
      this.props.actions.resetStations();
      if(e != []){
        var city_id_str='';
        e.forEach((n)=>{
          city_id_str=n.id + ',' + city_id_str;
        });
        city_id_str=city_id_str.substring(0,city_id_str.length-1);
        this.props.actions.getStationsByCityIdsSignal(city_id_str,'authority');
      }
    callback(e);
    //var {value} = e.target;
    //console.log(value);
  }

  onDeptChange(callback,e){
    var {value} = e.target;
    this.props.actions.resetRoles();
    if(value == 999 )
      this.props.actions.getAllRolesSignal(value, "authority");
    else
      if(value != this.refs.department.props['default-value'])
          this.props.actions.getRolesSignal(value, "authority");
    callback(e);
  }

  onRoleChange(callback,e){
/*    var {value} = e.target;
    this.props.actions.resetTickedRoles();
    if(value != this.refs.role.props['default-value'])
        this.props.actions.getTickedRoles(value);

    callback(e);*/
  }

  onPwdToggle(){
    var type = document.getElementById("pwd").getAttribute('type');

    if(type=='password'){
      document.getElementById("pwd").setAttribute('type','text');
      document.getElementById("togglePwdStatus").innerHTML = '密码不可视';
    }else{
      document.getElementById("pwd").setAttribute('type','password');
      document.getElementById("togglePwdStatus").innerHTML = '密码可视';
    }
  }
}
ManageAddForm.propTypes = {

  area:PropTypes.shape({
    provinces:PropTypes.array.isRequired,
  }),
  actions:PropTypes.shape({
    getDeptsSignal:PropTypes.func.isRequired
  }).isRequired,

   editable: PropTypes.bool.isRequired,
}


export default function initManageUserForm( initFunc ){
  return reduxForm({
    form:'add_user',
    fields:FormFields.add_user,
    validate,
/*    roleinfo:{roleinfo},
    depts:{depts},*/
  },initFunc)(ManageAddForm);
}