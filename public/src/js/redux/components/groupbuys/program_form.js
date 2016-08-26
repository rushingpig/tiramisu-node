import React, {Component, PropTypes} from 'react';
import {render, findDOMNode} from 'react-dom';
import { reduxForm } from 'redux-form';

/*import { isSrc } from 'reducers/form';*/
import Select from 'common/select';
import LazyLoad from 'utils/lazy_load';
import { Noty, form as uForm, dateFormat, getDate } from 'utils/index';
import { SELECT_DEFAULT_VALUE } from 'config/app.config';
import DatePicker from 'common/datepicker';
import LineRouter from 'common/line_router';

import ProgramProductsModal from './program_add_products_modal';

const validate = (values, props) => {
	const errors = [];
	var msg = 'error';

	var {form} = props;

	function _v_text(key){
	  if(form[key] && form[key].touched && (values[key] === undefined || values[key] == '')){
	    errors[key] = msg;
	  }
	}

	function _v_select(key){
	  if(form[key] && form[key].touched && (!values[key] || values[key] == SELECT_DEFAULT_VALUE))
	    errors[key] = msg;
	}

	return errors;
}

class TopHeader extends Component{
	render() {
		var {editable} = this.props;
		var title = editable ? '编辑团购项目': '添加团购项目';
		return (
			<div className='clearfix top-header'>
				<LineRouter
					routes={[{name: '团购项目管理', link: '/gm/pg'}, {name: title, link: ''}]}
					className = 'pull-right'
					/>
			</div>
		)
	}
}



class ManageForm extends Component{
	render(){
		var { actions: {searchGroupbuysProducts }, list, total, } = this.props;
		return (
			<div>
				<TopHeader />
				<div className = 'panel'>
					<header className='panel-heading'>团购项目详情</header>
					<div className = 'panel-body'>
						<div className='form-group form-inline'>
							<label>团购城市：</label>
							<Select default-text = '选择省份' />
							<Select default-text = '选择城市' />
						</div>
						<div className = 'form-group form-inline'>
							<label>团购网站：</label>
							<Select />
						</div>
						<div  className = 'form-group form-inline'>
							<label>项目名称：</label>
							<input type = 'text' className = 'form-control input-xs' />
						</div>
						<div className = 'form-group form-inline'>
							<label>选择产品：</label>
							<button 
								onClick = {this.addProducts.bind(this)}
								className = 'btn btn-theme btn-xs'>添加</button>
						</div>
						<div className = 'form-group form-inline'>
							<label>预售时间：</label>
		          			<DatePicker editable className="short-input" /> {'至'}
		          			<DatePicker editable className="short-input" />
						</div>
						<div className = 'form-group'>
							{'　　　　　'}<button 
							  className="btn btn-theme btn-xs space-left"
							  >提交</button>
						</div>
					</div>
				</div>
				<ProgramProductsModal ref='ProgramProductsModal' {...{searchGroupbuysProducts, list, total}}/>
			</div>
			)
	}

	addProducts(){
		this.refs.ProgramProductsModal.show();
	}
}

ManageForm = reduxForm({
	form: 'program_from',
	fields: [
		'province_id',
		'city_id',
		'src_id',
		'begin_time',
		'end_time',
	],
	validate,
	destroyOnUnmount: true	
})(ManageForm);

export default ManageForm;

/*export default function initManageForm(initFunc){
	  return reduxForm({
	    form: 'program_from',
	    fields: [
	    	'province_id',
	    	'city_id',
	    	'src_id',
	    	'begin_time',
	    	'end_time',
	    ],
	    validate,
	    touchOnBlur: true,
	  },initFunc)(ManageForm);	
}*/
