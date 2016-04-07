import React, { Component, PropTypes } from 'react';
import { render, findDOMNode } from 'react-dom';
import { reduxForm } from 'redux-form';

import Select from 'common/select';
import StationMap from './station_map';

import LazyLoad from 'utils/lazy_load';
import { Noty , core, form as uForm} from 'utils/index';
import history, { go } from 'history_instance';
import { SELECT_DEFAULT_VALUE } from 'config/app.config';

export const fields = ['name', 'province_id', 'city_id', 'regionalism_id', 'address', 'phone', 'capacity'];

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
  function isContactNumber(input){
    return /^\d{11,12}$/.test(input);
  }
  function _v_mobile(key){
    if (form[key] && form[key].touched && !values[key] || (form[key] && !form[key].focus && values[key] && !isContactNumber(values[key]))){
      errors[key] = msg;
    }
  }
  function _v_number(key){
    if(form[key] && form[key].touched && !values[key] || (form[key] && !form[key].focus && values[key] && !uForm.isNumber(values[key]))){
      errors[key] = msg;
    }
  }

  _v('name');
  _v('province_name');
  _v('city_name');
  _v('address');
  _v_number('capacity');
  _v_mobile('phone');

  _v_selsect('regionalism_id');

  console.log(errors);
  // //errors为空对象才表明验证正确
  return errors;
};

const FormGroup = props => (
  <div className="form-group form-inline" {...props} />
)

class StationManageForm extends Component {
  constructor(props){
    super(props);
    this.state = {};
  }
  render(){
    var {
      editable,
      handleSubmit,
      fields: {
        name,
        station_id,
        province_id,
        city_id,
        regionalism_id,
        is_national,
        address,
        phone,
        capacity,
        remarks,
        coords,
      },
      area:{
        provinces,
        cities,
        districts
      },
    } = this.props;

    var { save_ing, save_success, submit_ing } = this.props['form-data'];
    return (
      <div>
        <div className="form-group form-inline">
          <label>{'　配送中心名称：'}</label>
          <input {...name} className={`form-control input-xs ${name.error}`} placeholder="请填写名称" type="text" />
        </div>
        <div className="form-group form-inline">
          <label>{'　配送中心地址：'}</label>
          <Select ref="province" className={`${province_id.error}`} default-text="请输入省份" options={provinces} {...province_id} onChange={this.onProvinceChange.bind(this, province_id.onChange)} className="form-select" />{' '}
          <Select ref="city" className={`${city_id.error}`} default-text="请输入城市" options={cities} {...city_id} onChange={this.onCityChange.bind(this, city_id.onChange)} />{' '}
          <Select ref="district" className={`${regionalism_id.error}`} default-text="请输入地区" options={districts} {...regionalism_id} className={`${regionalism_id.error}`} />{' '}
        </div>
        <div className="form-group form-inline">
          <label>{'　　　　　　　　'}</label>
          <input ref="address" {...address} className={`form-control input-xs ${address.error}`}  placeholder="请填写详细地址"/>
        </div>
        <div className="form-group form-inline">
          <label>{'　　　联系方式：'}</label>
          <input {...phone} className={`form-control input-xs ${phone.error}`} placeholder="请填写联系方式"/>
        </div>
        <div className="form-group form-inline">
          <label>{'　生产产能数量：'}</label>
          <input {...capacity} className={`form-control input-xs ${capacity.error}`} placeholder="请填写生产产能数量"/>
        </div>
        <div className="form-group form-inline">
          <label>{'是否适用于全国：'}</label>
          <div className="radio space-right">
            <label><input type="radio" {...is_national} value="1" checked={is_national.value == '1'}/>是</label>
            <label><input type="radio" {...is_national} value="0" checked={is_national.value == '0'}/>否</label>
          </div>
        </div>
        <div className="form-group form-inline">
          <label>{'　　　　　备注：'}</label>
          <textarea {...remarks} className="form-control input-xs" rows="2" cols="40"></textarea>
        </div>
        <div className="form-group form-inline">
          {
            editable
            ? [
                <button key="editBtn" onClick={this.editScope.bind(this)} className="btn btn-theme btn-xs">修改配送区域</button>,
                '　　',
                <button key="stopBtn" onClick={this.stopEditScope.bind(this)} className="pull-right btn btn-theme btn-xs">停止修改</button>,
                '　　',
                <button
                  key="saveBtn" 
                  disabled={save_ing}
                  data-submitting={save_ing}
                  onClick={handleSubmit(this._check.bind(this, this.handleUpdateStationInfo))} 
                  className="btn btn-theme btn-xs">保存</button>
              ]
            : [
                <button key="editBtn" onClick={this.addScope.bind(this)} className="btn btn-theme btn-xs">添加配送区域</button>,
                '　　',
                <button key="stopBtn" onClick={this.stopEditScope.bind(this)} className="pull-right btn btn-theme btn-xs">停止修改</button>,
                '　　',
                <button
                  key="saveBtn" 
                  disabled={save_ing}
                  data-submitting={save_ing}
                  onClick={handleSubmit(this._check.bind(this, this.handleCreateStationInfo))} 
                  className="btn btn-theme btn-xs">保存</button>
              ]
          }
        </div>
        <StationMap ref="stationMap" city={this.state.city} {...this.props.fields}/>
      </div>
    )
  }
  _check(callback,form_data){
    LazyLoad('noty');
    setTimeout(() => {
      var { errors } = this.props;
      var station_info = this.props['form-data'].data;
      if(Object.keys(errors).length){
        Noty('warning', '请填写完成');
        return;
      }
      callback.call(this, form_data);
    }, 0);
  }
  componentDidMount(){
    var { getProvinces } = this.props.actions;
    getProvinces();
    var city = this.findSelectedOptionText('city');
    this.setState({
      city: city
    });
    console.log(this.state.city)
  }
  onProvinceChange(callback, e){
    var {value} = e.target;
    this.props.actions.resetCities();
    if(value != this.refs.province.props['default-value'])
      this.props.actions.getCities(value);
    callback(e);
  }
  onCityChange(callback, e) {
    var { value } = e.target;
    this.props.actions.resetDistricts();
    if(value != this.refs.city.props['default-value'])
      this.props.actions.getDistricts(value);
    callback(e);
  }
  handleCreateStationInfo(form_data){
    var { station_id } = this.props;
    var coords = this.refs.stationMap.saveStationScope();
    form_data = {...form_data, coords}
    this.props.actions.addStation(form_data, station_id)
      .done(function(){
        Noty('success', '保存成功');
        setTimeout(() => {
          go('/sm/station');
        }, 2000)
      })
      .fail(function(msg, code){
        Noty('error', msg || '保存异常');
      });
  }
  handleUpdateStationInfo(form_data){
    var { station_id } = this.props;
    var coords = this.refs.stationMap.saveStationScope();
    form_data = {...form_data, coords}
    this.props.actions.updateStation(form_data, station_id)
      .done(function(){
        Noty('success', '保存成功');
        setTimeout(() => {
          go('/sm/station');
        }, 2000)
      })
      .fail(function(msg, code){
        Noty('error', msg || '保存异常');
      }); 
  }
  findSelectedOptionText(_refs){
    return $(findDOMNode(this.refs[_refs])).find('option:selected').html();
  }
  stopEditScope(){
    this.refs.stationMap.stopEditScope();
  }
  editScope(){
    this.refs.stationMap.editScope();
  }
  addScope(){
    var city_name = this.findSelectedOptionText('city');
    var address = $(findDOMNode(this.refs.address)).val();
    this.refs.stationMap.addScope(city_name, address);
  }

}

StationManageForm.propTypess = {
  area: PropTypes.shape({
    provinces: PropTypes.array.isRequired, 
    cities: PropTypes.array.isRequired, 
    districts: PropTypes.array.isRequired
  }).isRequired,
  fields: PropTypes.shape ({
    name: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    phone: PropTypes.number.isRequired,
    capacity: PropTypes.number.isRequired,
    remarks: PropTypes.string
  }).isRequired,
}

export default function initManageStationForm(initFunc) {
  return reduxForm({
    form: 'station_manage_form',
    fields: [
      'name',
      'province_id',
      'city_id',
      'regionalism_id',
      'is_national',
      'address',
      'phone',
      'capacity',
      'remarks',
      'coords',
    ],
    validate,
    touchOnBlur: true,
  },initFunc)(StationManageForm)
}
