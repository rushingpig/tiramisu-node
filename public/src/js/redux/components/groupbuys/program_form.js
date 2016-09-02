import React, {Component, PropTypes} from 'react';
import {render, findDOMNode} from 'react-dom';
import { reduxForm } from 'redux-form';

/*import { isSrc } from 'reducers/form';*/
import Select from 'common/select';
import LazyLoad from 'utils/lazy_load';
import { tableLoader, get_table_empty } from 'common/loading';
import { Noty, form as uForm, dateFormat, getDate } from 'utils/index';
import { SELECT_DEFAULT_VALUE } from 'config/app.config';
import DatePicker from 'common/datepicker';
import LineRouter from 'common/line_router';

import DateTimeRangePicker from 'react-bootstrap-datetimerange-picker';
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

	_v_select('province_id');

	_v_select('regionalism_id');

	_v_select('src_id');

	_v_text('')

	return errors;
}

const pickerStyle = { width: 260, textAlign: 'center' }

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
const iNow = new Date();

class ManageForm extends Component{
	constructor(props){
		super(props);
		this.state = {
			start_time: iNow,
			end_time: new Date(getDate(iNow, 7)),
		}
	}
	render(){
		var {
			fields: {
				province_id, 
				regionalism_id,
				src_id,
				name,
				start_time,
				end_time,
			} 
		} = this.props;
		var { actions: {searchGroupbuysProducts, changeOnlineTime, getCategories, getSecCategories, selectProduct, 
				deleteProduct, cancelSelectProduct,
				}, area: {provinces, cities}, main, editable } = this.props;
		var { order_srcs, program_info, list, total, page_no, pri_pd_cates, sec_pd_cates, selected_list } = main;
		var product_list = [];
		 product_list = selected_list.map( (m, i) => {
			return (<tr key={ m.id + ' ' + i}>
						<td>{m.name}</td>
						<td>{m.size}</td>
						<td>{m.category_name}</td>
						<td>{m.src_name}</td>
						<td>￥{m.price / 100}</td>
						<td>{m.is_online == 1 ? '是':'否'}</td>
						<td>
							<a href='javascript:;' onClick={this.onDeleteProduct.bind(this, m.id)}>[删除]</a>
						</td>
					</tr>)
		})
		var add_btn_disabled = !province_id.value || province_id.value == SELECT_DEFAULT_VALUE ||
								!regionalism_id.value || regionalism_id.value == SELECT_DEFAULT_VALUE ||
								!src_id.value || src_id.value == SELECT_DEFAULT_VALUE			
		return (
			<div>
				<TopHeader />
				<div className = 'panel'>
					<header className='panel-heading'>团购项目详情</header>
					<div className = 'panel-body'>
						<div className='form-group form-inline'>
							<label>团购城市：</label>
							<Select className = {` space-right ${province_id.error}`} {...province_id} default-text = '选择省份'
								options = {provinces} onClick = {this.onProvinceChange.bind(this, province_id.onChange)}
								disabled = {editable} />
							<Select disabled = {editable} className = {`${regionalism_id.error}`} {...regionalism_id} default-text = '选择城市' options = {cities} />
						</div>
						<div className = 'form-group form-inline'>
							<label>团购网站：</label>
							<Select disabled = {editable} className = {`${src_id.error}`} {...src_id} options = {order_srcs } default-text = '团购网站'/>
						</div>
						<div  className = 'form-group form-inline'>
							<label>项目名称：</label>
							<input {...name} type = 'text' className = {`form-control input-xs ${name.error}`} />
						</div>
						<div className = 'form-group form-inline'>
							<label>选择商品：</label>
							<button 
								disabled = {add_btn_disabled}
								onClick = {this.addProducts.bind(this)}
								className = 'btn btn-default btn-xs'>
								<i className = 'fa fa-plus'></i>{' 添加'}</button>
						</div>
						{
							selected_list.length ?
						<table className = 'table table-responsive' style={{maxWidth: 600}}>
							<thead>
								<tr>
								<th>商品名称</th>
								<th>规格</th>
								<th>商品类型名称</th>
								<th>渠道</th>
								<th>价格</th>
								<th>商城上线</th>
								<th>操作</th>
								</tr>
							</thead>
							{
							  	product_list.length ? <tbody>{product_list}</tbody>: <tbody>{get_table_empty()}</tbody>
							}
						</table>
						:null
						}
						<div className = 'form-group form-inline'>
							<label>预售时间：</label>
							<DateTimeRangePicker
							    className="form-control input-xs"
							    style={pickerStyle}
							    beginTime={start_time.value}
							    endTime={end_time.value}
							    onChange = {this.onTimeRangeChange.bind(this)}
							/>
						</div>
						<div className = 'form-group'>
							{'　　　　　'}<button 
							  className="btn btn-theme btn-xs space-left"
							  onClick = {this.submit.bind(this)}>提交</button>
						</div>
					</div>
				</div>
				<ProgramProductsModal ref='ProgramProductsModal' {...{searchGroupbuysProducts, getSecCategories, list, total, pri_pd_cates, sec_pd_cates, 
					selected_list, selectProduct, deleteProduct, cancelSelectProduct}}/>
			</div>
			)
	}

	addProducts(){
		this.props.actions.getCategories();
		this.props.actions.searchGroupbuysProducts();
		this.refs.ProgramProductsModal.show();
	}
	onProvinceChange(callback, e){
		this.props.actions.getCityAndDistricts(e.target.value);
		callback(e);
	}
	onTimeRangeChange(beginTime, endTime){
		this.props.actions.triggerFormUpdate('program_from', 'start_time', beginTime);
		this.props.actions.triggerFormUpdate('program_from', 'end_time', endTime);
	}
	componentDidMount(){
		LazyLoad('datetimerangepicker');	
	}
	componentWillReceiveProps(nextProps){
		var {editable, main: {program_info}} = this.props;
		if(program_info != nextProps.main.program_info){
			if(editable){
				var start_time = nextProps.main.program_info.start_time;
				var end_time = nextProps.main.program_info.end_time;
				start_time = new Date(start_time);
				end_time = new Date(end_time);
				this.setState({
					start_time: start_time,
					end_time: end_time,
				})	
			}	
		}
	}
	submit(){
		var m = $(findDOMNode(this.refs.datej));
		var a= 1-1;
	}
	onDeleteProduct(id){
		this.props.actions.deleteProduct(id);
	}
}

ManageForm = reduxForm({
	form: 'program_from',
	fields: [
		'province_id',
		'regionalism_id',
		'src_id',
		'name',
		'start_time',
		'end_time',
	],
	validate,
	destroyOnUnmount: true	
}, state => {
	return {
		initialValues: state.groupbuysProgramFormManage.main.program_info
	}
})(ManageForm);

export default ManageForm;

/*export default function initManageForm(initFunc){
	  return reduxForm({
	    form: 'program_from',
	    fields: [
	    	'province_id',
	    	'regionalism_id',
	    	'src_id',
	    	'begin_time',
	    	'end_time',
	    ],
	    validate,
	    touchOnBlur: true,
	  },initFunc)(ManageForm);	
}*/
