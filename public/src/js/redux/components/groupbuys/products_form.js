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

import AddSpuModal from './products_add_spu_modal';



export default class ManageForm extends Component{
	render(){
		var { area: { provinces, cities }, main: { order_srcs, list, page_no, total, pri_pd_cates, sec_pd_cates, selected_list }} = this.props;
		var {actions : {
			searchProducts, getSecCategories, getCategories, selectProduct,
		}} = this.props;
		return(
				<div>
					<header className='panel-heading'>团购商品详情</header>
					<div className='panel-body'>
						<div className='form-group form-inline'>
							<label>团购城市：</label>
							<Select default-text = '选择省份' options = {provinces} onClick={this.onProvinceChange.bind(this)}/>
							<Select default-text = '选择城市' options = {cities}/>

						</div>
						<div className='form-group form-inline'>
							<label>团购网站：</label>
							<Select options={ order_srcs } default-text='团购网站'/>
						</div>
						<div className='form-group form-inline'>
							<label>选择商品：</label>
							<button 
							  	onClick = {this.add_spu.bind(this)}
								className = 'btn btn-xs btn-default '>
								<i className='fa fa-plus'></i>
								{' 添加'}</button>
						</div>
						<div className = 'form-group'>
							{'　　　　　'}<button 
							  className="btn btn-theme btn-xs space-left"
							  >提交</button>
						</div>
					</div>
					<AddSpuModal ref='AddSpuModal' 
						{...{searchProducts, list, page_no, total, pri_pd_cates, sec_pd_cates, getCategories, 
							getSecCategories, selected_list}}/>
				</div>
			)
	}
	add_spu(){
		this.refs.AddSpuModal.show();
	}

	componentDidMount(){
		this.props.actions.getProvincesSignal();
	}

	onProvinceChange(e){
		var {value} = e.target;
		this.props.actions.getCityAndDistricts(value);
	}
}