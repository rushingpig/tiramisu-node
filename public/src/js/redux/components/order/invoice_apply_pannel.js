import React, {Component, PropTypes} from 'react';
import Select from 'common/select';
import { SELECT_DEFAULT_VALUE} from 'config/app.config';
import { reduxForm } from 'redux-form';
import { Noty, form as uForm } from 'utils/index';

import RadioGroup from 'common/radio_group';
import SearchInput from 'common/search_input';

import FormFields from 'config/form.fields';

const validate = (values, props) => {
	const errors = {};
	var msg = 'error'
	var {form} = props;

	function _v_select(key){
	  if(form[key] && form[key].touched && (!values[key] || values[key] == SELECT_DEFAULT_VALUE))
	    errors[key] = msg;
	}

	function _v_mobile(key){
	   if (form[key] && form[key].touched && values[key] != undefined && values[key] != ''  && !values[key] || (form[key] && !form[key].focus && values[key] && !uForm.isMobile(values[key]))){
	    errors[key] = msg;
	  }   
	}

	function _v_text(key){
	  if(form[key] && form[key].touched && (values[key] === undefined || values[key] == '')){
	    errors[key] = msg;
	  }
	}

	if(values['type'] == 0){
		_v_text('title');
	}else{
		_v_select('company_id');
	}

	_v_text('_recipient_name');

	_v_mobile('_recipient_mobile');

	_v_select('province_id');
	_v_select('city_id');
	_v_select('regionalism_id');
	_v_text('address');

	return errors;
}
class InvoiceApplyPannel extends Component{
	constructor(props){
		super(props);
		this.state = {
			search_by_keywords_ing: false,
		}
	}
	render(){
		var {
			fields: {
				amount,
				company_id,
				order_id,
				_recipient_mobile,
				_recipient_name,
				owner_mobile,
				owner_name,
				recipient_mobile,
				recipient_name,
				remarks,
				title,
				type,
				enable_recipient_address,
				recipient,
				recipient_province_id,
				recipient_city_id,
				recipient_regionalism_id,
				recipient_address,
				province_id,
				city_id,
				regionalism_id,
				address,
			},
			company_data,
			form_provinces,
			form_cities,
			form_districts,
			editable,
			handleSubmit,
		} = this.props;
		return(
				<div>
					<div className='form-group form-inline'>
						<label>{'　订单号：'}</label>
						{
							editable ?
							<input {...order_id} type = 'text' readOnly className = 'form-control input-xs' />
							:
							<SearchInput {...order_id} searchHandler = {this.search.bind(this, 'search_by_keywords_ing')} className='form-inline v-img space-right' placeholder='搜索要开具发票的订单号' />				
						}
					</div>
					<div className='form-group form-inline'>
						<label>{'发票类型：'}</label>
						<label>
						  <input {...type} value = {0} checked = {type.value == 0} type="radio"  /> 增值税普通发票</label>
						{'　'}
						<label>
						  <input {...type} value = {1} checked = {type.value == 1} type="radio"   /> 增值税专用发票</label>
					</div>
					
					
					<div className='form-group form-inline'>
						<label>{'发票抬头：'}</label>
						{
							type.value == 1 ?
							<Select {...company_id} className= {`${company_id.error}`} default-text='请选择已审核公司' options = {company_data}/>
							:
							<input {...title} className={`form-control input-xs ${title.error}`} type='text' placeholder='个人/公司全称' />
						}
					</div>
					<div className='form-group form-inline'>
						<fieldset className='box-wrapper' style={{'border':'1px solid #ddd'}}>
          					<legend style={{'padding':'5px 10px','fontSize':'13','width':'auto','border':'0', marginBottom: 5}}>收票人信息</legend>
          					<div>
          					{'　　'}<div className='form-group form-inline' style = {{marginBottom: 8}}>
          						<label>{'发票金额/'}{'流水金额：'}</label>
          						￥<input {...amount} className='form-control input-xs' style = {{width: 80}} type='text' readOnly />
          					</div><br />
          					<div className='form-group form-inline' style = {{marginBottom: 8}}>
		 						{'　　'}<RadioGroup
		 							{...recipient}
		                   			vertical={false}
		                   			className = 'inline-block'
		 							radios={[
		 								{value: 2, text: '手动输入'},
		 								{value: 0, text: '下单人'},
		 								{value: 1, text: '收货人'},
		 								]}
		 								 />         						
          					</div>
          					<div className='form-group form-inline' style = {{marginBottom: 8}}>
          						<label className='control-label'>{'　　姓名：'}</label>
          						<input {..._recipient_name} type='text' className={`form-control input-xs ${_recipient_name.error}`}/>
          						<label>{'　　电话：'}</label>
          						<input {..._recipient_mobile} type='text'  className={`form-control input-xs ${_recipient_mobile.error}`}/>
          					</div>
          					<div className='form-group form-inline' style = {{marginBottom: 8, display: 'block'}}>
          						<label>{'　　地址：'}</label>
          						<input {...enable_recipient_address} 
          							checked={enable_recipient_address.value == 1} type = 'checkbox' 
          							/>
          						<label>{'启用收货人地址'}</label>        						
          					</div>
          					{
          						enable_recipient_address.value == 1 ?
          						[
				  					<div key='province_div' className='form-group form-inline' style = {{marginBottom: 8}}>
										{'　　　　　'}<Select disabled = {true} ref='form_province'  options = {form_provinces} {...recipient_province_id} 
														ref="province" default-text="--选择省份--" className='form-select'
														/>{' '}
										<Select disabled = {true} ref='form_city' options = {form_cities} {...recipient_city_id} 
											 ref="city"  default-text="--城市--" />{' '}
										<Select disabled = {true} ref='form_district' 
												options = {form_districts} {...recipient_regionalism_id} ref="district"  default-text="--区/县--" />{' '}
				  					</div>,
				  					<div key='add_div' className='form-group form-inline' style = {{marginBottom: 8}}>
										{'　　　　　'}<input disabled = {true} {...recipient_address} ref="recipient_address" className={`form-control input-xs ${address.error}`}  style={{width: 280}} type="text" placeholder='详细地址：小区、楼栋、门牌号'/>
				  					</div>
          						]:
          						[
				  					<div key='province_div' className='form-group form-inline' style = {{marginBottom: 8}}>
										{'　　　　　'}<Select ref='form_province'  options = {form_provinces} {...province_id} 
														ref="province" default-text="--选择省份--" className={`form-select ${province_id.error}`} 
														/>{' '}
										<Select ref='form_city' options = {form_cities} {...city_id} 
											className = {`${city_id.error}`}
											 onChange = {this.onCityChange.bind(this, city_id.onChange)}
											 ref="city"  default-text="--城市--" />{' '}
										<Select ref='form_district' 
												className = {`${regionalism_id.error}`}
												options = {form_districts} {...regionalism_id} ref="district"  default-text="--区/县--" />{' '}
				  					</div>,
				  					<div key = 'add_div' className='form-group form-inline' style = {{marginBottom: 8}}>
										{'　　　　　'}<input {...address} ref="recipient_address" className={`form-control input-xs ${address.error}`}  style={{width: 280}} type="text" placeholder='详细地址：小区、楼栋、门牌号'/>
				  					</div>
          						]
          					}
          						
          					</div>

						</fieldset>
					</div>
					<div className='pull-right'>
					<button
						onClick = {this.onCancel.bind(this)}
					    key="cancelBtn"
					    className="btn btn-default btn-xs space-right">取消</button>
					{
						editable?
						<button 
						  className="btn btn-theme btn-xs space-left"
						  onClick = {handleSubmit(this._check.bind(this, this.handleEditInvoice))}
						  >提交</button>
						:
						<button 
					  className="btn btn-theme btn-xs space-left"
				    	onClick = {handleSubmit(this._check.bind(this, this.handleCreateInvoice))}
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
	search(){
		var {fields: {order_id}, getOrderInvoiceInfo} = this.props;
		this.setState({search_by_keywords_ing: true});
		getOrderInvoiceInfo(order_id.value);
		this.setState({search_by_keywords_ing: false});
	}
	onProvinceChange(callback, e){
		var { value } = e.target;
		this.props.resetFormCities();
		if(value != SELECT_DEFAULT_VALUE){
		  this.props.getFormCities(value);
		}
		callback(e);		
	}
	onCityChange(callback, e){
		var {value} = e.target;
		this.props.resetFormDistricts();
		if(value != SELECT_DEFAULT_VALUE ){
			this.props.getFormDistricts(value);
		}
	}
	handleCreateInvoice(form_data){
		this.props.invoiceApply(form_data)
			.done(function(){
				Noty('success', '保存成功');
				this.props.onHide();
			}.bind(this))
			.fail(function(msg){
        		Noty('error', msg || '操作异常');
			})
	}
	handleEditInvoice(){
		this.props.actions.invoiceEdit(this.props.invoice_id)
			.done(function(){
				Noty('success', '保存成功');
				this.props.onHide();
			}.bind(this))
			.fail(function(msg){
        		Noty('error', msg || '操作异常');
			})
	}
	onCancel(){
		this.props.onHide();
	}

}

/*InvoiceApplyPannel = reduxForm({
	form: 'invoice_apply_pannel',
	validate,
	fields: [
		'amount',
		'company_id',
		'order_id',
		'recipient',
		'_recipient_mobile',
		'_recipient_name',
		'owner_mobile',
		'owner_name',
		'recipient_mobile',
		'recipient_name',
		'recipient_province_id',
		'recipient_city_id',
		'recipient_regionalism_id',
		'recipient_address',
		'remarks',
		'title',
		'type',
		'enable_recipient_address',
		'province_id',
		'city_id',
		'regionalism_id',
		'address',
	],
	destroyOnUnmount: false
}, state => {
  return {
    //赋初始值
    initialValues: state.invoiceManage.main.order_invoice_info
  }
})(InvoiceApplyPannel);*/

export default function InvoiceApplyPannel(initFunc){
	  return reduxForm({
	    form:'invoice_apply_pannel',
	    fields: [
			'amount',
			'company_id',
			'order_id',
			'recipient',
			'_recipient_mobile',
			'_recipient_name',
			'owner_mobile',
			'owner_name',
			'recipient_mobile',
			'recipient_name',
			'recipient_province_id',
			'recipient_city_id',
			'recipient_regionalism_id',
			'recipient_address',
			'remarks',
			'title',
			'type',
			'enable_recipient_address',
			'province_id',
			'city_id',
			'regionalism_id',
			'address',
		],
	    validate,
	   /*roleinfo:{roleinfo},
	    depts:{depts},*/
	    touchOnBlur: true,
	  },initFunc)(InvoiceApplyPannel);	
}