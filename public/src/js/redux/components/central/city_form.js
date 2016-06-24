import React, {Component, PropTypes} from 'react';
import {render, findDOMNode} from 'react-dom';
import { reduxForm } from 'redux-form';

/*import { isSrc } from 'reducers/form';*/
import Select from 'common/select';
import LazyLoad from 'utils/lazy_load';
import { Noty, form as uForm, dateFormat, getDate } from 'utils/index';
import { SELECT_DEFAULT_VALUE ,CHECKBOXGROUP_DEFAULT_VALUE} from 'config/app.config';
import CheckBoxGroup from 'common/checkbox_group';
import CityPicker from 'common/city_picker';
import TimeSpan from 'common/time_span';
import RadioGroup from 'common/radio_group';
import DatePicker from 'common/datepicker';
import TimeInput from 'common/time_input';

import history from 'history_instance';

import FormFields from 'config/form.fields';

const pickerStyle = { width: 260, textAlign: 'center' }

const validate = (values, props) => {
	const errors = {};
	var msg = 'error';
    var { form } = props;

	function _v_hour(key){
		if(form[key] && form[key].touched  && (!uForm.isNumber(values[key]) || values[key] < 0 || values[key] >= 24))
			errors[key] =msg
	}

	function _v_minute(key){
		if(form[key] && form[key].touched && (!uForm.isNumber(values[key]) || values[key] < 0 || values[key] >= 60))
			errors[key] =msg;
	}

	function _v_select(key){
	  if(form[key] && form[key].touched && (!values[key] || values[key] == SELECT_DEFAULT_VALUE))
	    errors[key] = msg;
	}

	function _v_mobile(key){
	   if (form[key] && form[key].touched && values[key] != undefined && values[key] != ''  && !values[key] || (form[key] && !form[key].focus && values[key] && !uForm.isMobile(values[key]))){
	    errors[key] = msg;
	  }   
	}

	function _v_citypicer(key){
		if(form[key] && form[key].touched && !values[key])
			errors[key] = msg;
	}

	function _v_checkboxgroup(key){
	  //|| values[key].length == 0
	  if(form[key] && form[key].touched && ((!values[key]) || (values[key] != undefined && values[key].length==0)))
	    errors[key] = msg;
	}

	_v_hour('online_time_hour');

	_v_minute('online_time_min');

	_v_select('order_time');

	_v_mobile('manager_mobile');

	_v_citypicer('city_id');

	if(values.is_county == 0){
		_v_checkboxgroup('first_open_regions');
	}

	if(values.sec_order == 1){
		_v_checkboxgroup('sec_open_regions');
		_v_select('sec_order_time');
	}

	return	errors;
}

class AddCityForm extends Component{
	constructor(props){
	  super(props);
	  this.state = {
	  	hour_error: '',
	  	minute_error: '',
	  	initialFlag: true,
	  }
	}
	render(){
		var {
			editable,
			handleSubmit,
			fields:{
				is_county,
				sec_order,
				city_id,
				order_time,
				delivery_time_range,
				is_diversion,
				manager_mobile,
				manager_name,
				remarks,
				online_time_date,
				online_time_hour,
				online_time_min,
				first_open_regions,
				sec_open_regions,
				sec_order_time,
			},
			provinces_letter,
			cities_letter,
			districts_letter,
			accessible_city_info,
		} = this.props;
		var { gotRegionalismLetter } = this.props.actions;
		var {county, sec_reservation} = this.state;
		var reservationList =[
			{id:1,text: '1'},
			{id:2,text: '2'},
			{id:3,text: '3'},
			{id:4,text: '4'},
			{id:5,text: '5'},
			{id:6,text: '6'},
			{id:7,text: '7'},
			{id:8,text: '8'},
			{id:9,text: '9'},
			{id:10,text: '10'},
			{id:11,text: '11'},
			{id: 12, text: '12'}
		]
		return(
			<div>
				{
				    !editable?
					<div className='form-group form-inline'>
						<label className='control-label'>{'　　　　城市级别：'}</label>
						<label>
							<input {...is_county} type='radio' value={1} checked={is_county.value == 1} />{'县级市　'}
							<input {...is_county} type='radio' value={0} checked={is_county.value == 0}/>{'地级市'}
						</label>
					</div>
					:
					null	
				}
				
				<div className='form-group form-inline'>
					<label className='control-label'>{'　　　请确定城市：'}</label>
					{
						!editable?
						[
							<select key='country' className='form-control input-xs space-right'>
								<option>中国大陆</option>
							</select>,
							<CityPicker
								{...city_id} 
								key = {city_id}
								provinces={provinces_letter}
								cities = {cities_letter}
								districts = {districts_letter}
								is_county = {is_county.value}
								getRegionalism = {gotRegionalismLetter}
								className = {`form-control ${city_id.error}`}
								/>
						]
						:
						<span>{accessible_city_info.area}</span>
					}
					
				</div>
				<fieldset className={`box-wrapper ${first_open_regions.error}`} style={{'border':'1px solid #ddd', 'marginBottom' :5 , 'padding': '0px 5px'}}>
        			<legend  style={{'padding':'5px 10px','fontSize':'14','width':'auto','border':'0'}}>{'提前预约'}</legend>
        			<div>
	        			{ is_county.value == 0 && 
	        			<div className='form-group form-inline'>
	        				<label className='control-label'>{'　　　　开通区域：'}</label>
	        				<div className='inline-block'>
	        					{!editable ?
	        						<CheckBoxGroup {...first_open_regions} checkboxs={districts_letter || []} value ={first_open_regions.value || districts_letter.filter( m => m.is_open)}/>
	        						:
	        						<CheckBoxGroup {...first_open_regions} checkboxs={districts_letter || []} value ={first_open_regions.value || districts_letter}/>
	        					}
	        				</div>
	        			</div>}
	        			<div className='form-group form-inline'>
	        				<label className='control-label'>{'　　提前预约时间：'}</label>
	        				<Select {...order_time} options = {reservationList} className={`form-control ${order_time.error}`}/>
	        			</div>
        			</div>
				</fieldset>
				{ is_county.value == 0 && [
					<div className='form-group form-inline'>
						<label className='control-label'>{'是否有第二提前预约时间：'}</label>
						<input {...sec_order} type='radio' checked={sec_order.value == 1} value={1}/>{'是　'}
						<input {...sec_order} type='radio' checked={sec_order.value == 0} value={0}/>{'否'}
					</div>,
        		sec_order.value == 1 ?
	        		<fieldset className={`box-wrapper ${sec_open_regions.error}`} style={{'border':'1px solid #ddd', marginBottom:5}}>
	        			<legend  style={{'padding':'5px 10px','fontSize':'14','width':'auto','border':'0'}}>{'提前预约二'}</legend>
	        			<div>
							 	<div className='form-group form-inline'>
							 		<label className='control-label'>{'　　　　开通区域：'}</label>
							 		<div className='inline-block'>
							 		<CheckBoxGroup {...sec_open_regions} checkboxs={first_open_regions.value || []} value={sec_open_regions.value || []}/>
							 		</div>
							 	</div>
							 	<div className='form-group form-inline'>
							 		<label className='control-label'>{'　　提前预约时间：'}</label>
							 		<Select {...sec_order_time} options={reservationList} className={`form-control ${sec_order_time.error}`} />
							 	</div>      				
	        			</div>
	        		</fieldset>
	        		:null
        		]
        	}
				<div className='form-group form-inline'>
					<label className='control-label'>{'　　　配送时间段：'}</label>
					<TimeSpan
						redux-form = {delivery_time_range} 
						{...delivery_time_range}
						/>
				</div>

				<div className='form-group form-inline'>
					<label className='control-label'>{'　　官网上线时间：'}</label>
					<DatePicker {...online_time_date} className="short-input" />
					{'　'}
					<input 
					  {...online_time_hour} 
					  className={`form-control input-xs time-input ${online_time_hour.error}`} />
					<span className="gray">{' : '}</span>
					<input
					  {...online_time_min} 
					  ref="minute"
					  {...online_time_min} 
					  className={`form-control input-xs time-input ${online_time_min.error}`} />
				</div>				
					<div className='form-group form-inline'>
						{ is_county.value == 0?
							<label className='control-label'>{'　是否县级市订单：'}</label>
							:
							<label className='control-label'>{'　是否地级市订单：'}</label>
						}
						{/*<input type='radio'/>{'是　'}
						<input type='radio'/>{'否'}*/}
						<RadioGroup
							{...is_diversion} 
                  			vertical={false}
                  			className ='inline-block'
							radios={[
								{value: 1, text: '是'},
								{value: 0, text: '否'}
								]}
								 />
					</div>
				<div className='form-group form-inline'>
					<label className='control-label'>{'　　　　城市经理：'}</label>
					<input {...manager_name} className='form-control input-xs space-right' type='text' placeholder='姓名'/>
					<input {...manager_mobile} className={`form-control input-xs ${manager_mobile.error}`} type='text' placeholder='手机号码/只能填数字'/>
				</div>
				<div className='form-inline form-group'>
					<label className='control-label'>{'　　　　　　备注：'}</label>
					<input {...remarks} className ='form-control' type='textarea' />
				</div>
				<div className="form-group" >
				{'　　　　　　　　　'}
				  <button
				  	  onClick = {this.cancel.bind(this)}
				      key="cancelBtn"
				      className="btn btn-default btn-xs space-right">取消</button>
				  {
				  	editable?
				  	<button 
				    	onClick = {handleSubmit(this._check.bind(this, this.handleSubmitCity))}
				  	  className="btn btn-theme btn-xs space-left"
				  	  >提交</button>
				  	:
				  	<button 
				    className="btn btn-theme btn-xs space-left"
				    onClick = {handleSubmit(this._check.bind(this, this.handleCreateCity))}
				    >提交</button>
				  }      
				  
				</div>
			</div>
			)
	}
	_check(callback,form_data){
	  setTimeout(()=>{
	      var {errors} =this.props;
	      if(!Object.keys(errors).length){
	        callback.call(this,form_data);  //以callback来代替this 调用
	      }else{
	        Noty('warning','请填写完整');
	      }
	  },0);
	}
	onlineTimeChange(begin_time, end_time){
		var begin_str = dateFormat(begin_time, 'yyyy-MM-dd hh:mm:ss');
		var end_str = dateFormat(end_time, 'yyyy-MM-dd hh:mm:ss');
		var {fields:{online_time}} = this.props;
		online_time.value = begin_str + ' ~ ' + end_str;
	}
	handleCreateCity(form_data){
		form_data.sec_reservation = this.state.sec_reservation;
		this.props.actions.CreateAccessibleCity(form_data)
			.done(function(){
				Noty('success', '保存成功');
				history.push('/cm/city');
			}.bind(this))
			.fail(function(msg){
        		Noty('error', msg || '操作异常');
			})
	}
	handleSubmitCity(form_data){
		form_data.city_id = this.props.params.id;
		form_data.sec_reservation = this.state.sec_reservation;
	    this.props.actions.updateAccessibleCity(form_data).done(function(){
	      //this.props.actions.resetStations();
	      Noty('success', '已成功提交！');
	      history.push('/cm/city');
	    }).fail(function(msg){
	      Noty('error', msg || '操作异常');
	    });

	}
	cancel(){
	  history.push("/cm/city");
	}
	componentDidMount(){
		LazyLoad('noty');
	}
}

export default function initAddCityForm(initFunc){
	  return reduxForm({
	    form:'add_city',
	    fields:FormFields.add_city,
	    validate,
	   /*roleinfo:{roleinfo},
	    depts:{depts},*/
	    touchOnBlur: true,
	  },initFunc)(AddCityForm);	
}