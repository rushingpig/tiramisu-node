/**
 * 三级城市的两种使用场景：1，结合redux-form; 2，原生state模式
 */
import React, { Component, PropTypes } from 'react';
import Select from 'common/select';
import { core } from 'utils/index';
import { SELECT_DEFAULT_VALUE } from 'config/app.config';

export default class AddressSelector extends Component {
  render(){
    var { province_id, city_id, provinces, cities, district_id, districts, className, style } = this.props;
    if(!core.isObject(province_id)){
      province_id = { defaultValue: province_id };
      city_id = { defaultValue: city_id };
      district_id = { defaultValue: district_id };
    }
    return (
      <div className={`form-inline inline-block ${className}`} style={style}>
        <Select 
          {...province_id}
          onChange={this.onProvinceChange.bind(this, province_id.onChange)}
          options={provinces}
          ref="province"
          key="province"
          default-text="选择省份"
          className="space-right"
        />
        <Select
          {...city_id}
          onChange={this.onCityChange.bind(this, city_id.onChange)}
          options={cities}
          ref="city"
          key="city"
          default-text="选择城市"
          className="space-right"
        />
        {
          districts.length > 1 || (districts.length == 1 && districts[0].id != city_id.value)
            ? <Select
                {...district_id}
                onChange={this.onDistrictChange.bind(this, district_id.onChange)}
                options={districts}
                ref="district"
                key="district"
                default-text="选择区县"
                className="space-right"
              />
            : null
        }
      </div>
    );
  }
  componentDidMount(){
    setTimeout(() => {
      var { province_id, city_id, actions: { getProvincesSignal, getCitiesSignal, getDistrictsAndCity } } = this.props;
      getProvincesSignal();
      province_id.value && getCitiesSignal({ province_id: province_id.value, is_standard_area: 1 });
      city_id.value && getDistrictsAndCity( city_id.value );
    }, 0);
  }
  onProvinceChange(callback, e){
    var {value} = e.target;
    this.props.actions.resetCities(this.props.form);
    if(value != this.refs.province.props['default-value']){
      this.props.actions.getCitiesSignal({ province_id: value, is_standard_area: 1 });
    }
    callback && callback(e);
    this.props.AddressSelectorHook &&
    this.props.AddressSelectorHook(e, { province_id: value != SELECT_DEFAULT_VALUE ? value : undefined });
  }
  onCityChange(callback, e){
    var {value} = e.target;
    this.props.actions.resetDistricts(this.props.form);
    if(value != this.refs.province.props['default-value']){
      this.props.actions.getDistrictsAndCity(value);
    }
    callback && callback(e);
    this.props.AddressSelectorHook &&
    this.props.AddressSelectorHook(e,
      value != SELECT_DEFAULT_VALUE
        ? { city_id: value, is_standard_area: 1 }
        : { province_id: this.props.province_id.value }
    );
  }
  onDistrictChange(callback, e){
    var {value} = e.target;
    callback && callback(e);
    this.props.AddressSelectorHook &&
    this.props.AddressSelectorHook(e,
      value != SELECT_DEFAULT_VALUE
        ? {city_id: value, is_standard_area: 0}
        : {city_id: this.props.city_id.value}
    );
  }
}

AddressSelector.propTypess = {
  province_id: PropTypes.oneOfType(
    PropTypes.object,
    PropTypes.string,
    PropTypes.number
  ).isRequired,
  provinces: PropTypes.array.isRequired,

  city_id: PropTypes.oneOfType(
    PropTypes.object,
    PropTypes.string,
    PropTypes.number
  ).isRequired,
  cities: PropTypes.array.isRequired,

  district_id: PropTypes.oneOfType(
    PropTypes.object,
    PropTypes.string,
    PropTypes.number
  ).isRequired,  //注意这里不仅包含区还可能包含市（广州市->广州市，花都区）
  districts: PropTypes.array,

  AddressSelectorHook: PropTypes.func, //选择器发生变化后的钩子回调

  actions: PropTypes.object.isRequired
}