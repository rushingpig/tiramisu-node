import React { Component, PropTypes } from 'react';
import { render, findDOMNode } from 'react-dom';
import Select from 'common/select';

class StationManageForm extends Component {
	var {
		fields: {
			station_name,
			province_id,
			city_id,
			regionalism_id,
			station_address,
			contact _number,
			product_capacity,
			remarks,
		},
		area:{
			provinces,
			cities,
			districts
		}
	} = this.props;
	render(){
		return (
			<div>
				<div className="form-group form-inline">
					<label className="control-label">{'配送中心名称：'}</label>
					<input {...station_name} className='form-control input-xs' placeholder="请填写名称" type="text" />
				</div>
				<div className="form-group form-inline">
					<label>{'配送中心地址：'}</label>
					<Select ref="province" options={provinces} {...province_id} onChange={this.onProvinceChange.bind(this, province_id.onChange)} className="form-select" />{' '}
	        <Select ref="city" options={cities} {...city_id} onChange={this.onCityChange.bind(this, city_id.onChange)} />{' '}
	        <Select ref="district" options={districts} {...regionalism_id} className={`${regionalism_id.error}`} />{' '}
				</div>
				<div className="form-group form-inline">
					<label>{'             '}</label>
					<input {...station_address} placeholder="请填写详细地址"/>
				</div
				<div className="form-group form-inline">
					<label>{'   联系方式：'}</label>
					<input {...contact_number} placeholder="请填写联系方式"/>
				</div>
				<div className="form-group form-inline">
					<label>{'生产产能数量：'}</label>
					<input {...product_capacity} placeholder="请填写生产产能数量"/>
				</div>
      	<div className="form-group form-inline">
        	<label>{'　　　备注：'}</label>
        	<textarea {...remarks} className="form-control input-xs" rows="2" cols="40"></textarea>
      	</div>
      	<div className="form-group form-inline">
        	<label>{'            '}</label>
        	<button
            key="saveBtn" 
            onClick={handleSubmit(this._check.bind(this, this.handleSaveOrder))} 
            disabled={save_ing} 
            data-submitting={save_ing} 
            className="btn btn-theme btn-xs">保存</button>
      	</div>
			</div>
		)
	}

	onProvinceChange(callback, e){
    var {value} = e.target;
    this.props.actions.resetCities();
    if(value != this.refs.province.props['default-value'])
      this.props.actions.getCities(value);
    callback(e);
  }
  onCityChange(callback, e){
    var {value} = e.target;
    this.props.actions.resetDistricts();
    if(value != this.refs.city.props['default-value'])
      this.props.actions.getDistricts(value);
    callback(e);
  }
}

StationManageForm.PropTypes = {
	area: PropTypes.shape({
    provinces: PropTypes.array.isRequired, 
    cities: PropTypes.array.isRequired, 
    districts: PropTypes.array.isRequired
  }).isRequired,
  area: PropTypes.shape({
    provinces: PropTypes.array.isRequired, 
    cities: PropTypes.array.isRequired, 
    districts: PropTypes.array.isRequired
  }).isRequired,
}


reduxForm({
	form: 'station_manage_form',
	fields: [
		station_name,
		province_id,
		city_id,
		regionalism_id,
		station_address,
		contact _number,
		product_capacity,
		remarks
	]
})(StationManageForm)