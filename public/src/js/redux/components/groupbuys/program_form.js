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

	_v_select('city_id');

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
			/*start_time: iNow,
			end_time: new Date(getDate(iNow, 7)),*/
		}
	}
	render(){
		var {
			fields: {
				province_id, 
				city_id,
				src_id,
				name,
			} 
		} = this.props;
		var { actions: {searchGroupbuysProducts, changeOnlineTime }, list, total, area: {provinces, cities}, main, editable } = this.props;
		var { order_srcs, program_info } = main;
		var { products } = program_info;
		var product_list = [];
		if(products){
			  product_list = products.map( (m, i) => {
				return (<tr key={ m.id + ' ' + i}>
							<td>{m.name}</td>
							<td>{m.size}</td>
							<td>{m.product_name}</td>
							<td>{program_info.src_name}</td>
							<td>￥{m.price / 100}</td>
							<td>{m.is_online == 1 ? '是':'否'}</td>
							<td><a href='javascript:;'>[删除]</a></td>
						</tr>)
			})	
		}
		var start_time = program_info.start_time;
		var end_time = program_info.end_time;
		if(start_time && end_time){
			start_time = start_time.replace(/-/g, '/');
			end_time = end_time.replace(/-/g, '/');
			start_time = new Date(getDate(start_time));
			end_time = new Date(end_time);
		}
		var endTime = end_time;
		
		return (
			<div>
				<TopHeader />
				<div className = 'panel'>
					<header className='panel-heading'>团购项目详情</header>
					<div className = 'panel-body'>
						<div className='form-group form-inline'>
							<label>团购城市：</label>
							<Select className = {`${province_id.error}`} {...province_id} default-text = '选择省份' options = {provinces} onClick = {this.onProvinceChange.bind(this, province_id.onChange)} />
							<Select className = {`${city_id.error}`} {...city_id} default-text = '选择城市' options = {cities} />
						</div>
						<div className = 'form-group form-inline'>
							<label>团购网站：</label>
							<Select className = {`${src_id.error}`} {...src_id} options = {order_srcs } default-text = '团购网站'/>
						</div>
						<div  className = 'form-group form-inline'>
							<label>项目名称：</label>
							<input value={this.state.tmp_name} type = 'text' className = {`form-control input-xs ${name.error}`} />
						</div>
						<div className = 'form-group form-inline'>
							<label>选择产品：</label>
							<button 
								onClick = {this.addProducts.bind(this)}
								className = 'btn btn-default btn-xs'>
								<i className = 'fa fa-plus'></i>{' 添加'}</button>
						</div>
						{
							editable ?
						<table className = 'table table-responsive' style={{maxWidth: 600}}>
							<thead>
								<tr>
								<th>产品名称</th>
								<th>规格</th>
								<th>产品类型名称</th>
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
							    beginTime={start_time}
							    endTime={endTime}
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
				<ProgramProductsModal ref='ProgramProductsModal' {...{searchGroupbuysProducts, list, total}}/>
			</div>
			)
	}

	addProducts(){
		this.refs.ProgramProductsModal.show();
	}
	onProvinceChange(callback, e){
		this.props.actions.getCityAndDistricts(e.target.value);
		callback(e);
	}
	onTimeRangeChange(beginTime, endTime){
		var m = 0;
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
				start_time = start_time.replace(/-/g, '/');
				end_time = end_time.replace(/-/g, '/');
				start_time = new Date(start_time);
				end_time = new Date(end_time);
				this.setState({
					start_time: start_time,
					end_time: end_time,
				})	
			}	
			var m = '';
		}
	}
	submit(){
		var m = $(findDOMNode(this.refs.datej));
		var a= 1-1;
	}
}

ManageForm = reduxForm({
	form: 'program_from',
	fields: [
		'province_id',
		'city_id',
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
	    	'city_id',
	    	'src_id',
	    	'begin_time',
	    	'end_time',
	    ],
	    validate,
	    touchOnBlur: true,
	  },initFunc)(ManageForm);	
}*/
