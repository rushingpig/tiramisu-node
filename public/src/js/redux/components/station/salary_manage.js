import React, {Component, PropTypes} from 'react';
import { render, findDOMNode } from 'react-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { reduxForm } from 'redux-form';

import DatePicker from 'common/datepicker';
import Select from 'common/select';
import OrderProductsDetail from 'common/order_products_detail';

class TopHeader extends Component{
	render() {
		return (
			<div className='clearfix top-header'>
				<button className="btn btn-theme btn-xs pull-right" style={{marginLeft: 20}}>
				  <i className="fa fa-download"></i> 导出
				</button>
			</div>
		)
	}
}

class FilterHeader extends Component{
	render(){
/*		var {
			fields:{
				begin_time,
				end_time,
				province_id,
				city_id,
				deliveryman_id,
				COD,
			}
		} = this.props;*/
		return(
			<div className='panel search' >
				<div className='panel-body form-inline'>
					{'开始时间'}
					<DatePicker editable  className="short-input" />
					{' 结束时间'}
					<DatePicker editable  className="short-input space-right" />
					<Select name='province' />
					<Select name='city' />
					<div className="input-group input-group-sm" style={{height:'27px'}}>
						<span  style={{height:'27px',lineHeight:1}} className="input-group-addon"><i className="fa fa-search"></i></span>
						<input type="text"  style={{height:'27px', width:'120px'}} 
						  className="form-control" placeholder="配送员拼音首字母" />
					</div>
					<Select name= 'deliveryman' default-text = '请选择配送员' />
					<select default-text = '是否货到付款' className='form-control input-xs'>
						<option>是否货到付款</option>
						<option>是</option>
						<option>否</option>
					</select>
					<button className="btn btn-theme btn-xs">
					  <i className="fa fa-search"></i>{' 搜索'}
					</button>
				</div>
			</div>
		)

	}
}


export default class DeliveryManSalaryManagePannel extends Component{
	render(){
		return (
				<div className=''>
					<TopHeader />
					<FilterHeader />
					<div className='panel' >
						<header className="panel-heading">工资信息列表</header>
						<div className="panel-body">
						  <div ref="table-container" className="table-responsive ">
						  	<div ref='box' id='box'  style={{maxHeight:434,width:1268, overflowY:'auto', position:'relative'}} onscroll = {this.onTbScroll.bind(this)}>
							    <table id='tab' className="table table-hover text-center" ref='tab' style={{width:1268}}>
							      <thead >
							      <tr>
							        <th><div style={{width:80}}>配送时间</div></th>
							        <th><div style={{width:80}}>签收时间</div></th>
							        <th><div style={{width:80}}>订单号</div></th>
							        <th><div style={{width:80}}>收货人信息</div></th>
							        <th><div style={{width:80}}>配送方式</div></th>
							        <th><div style={{width:80}}>签收状态</div></th>
							        <th><div style={{width:100}}>是否第二次配送</div></th>
							        <th><div style={{width:80}}>支付状态</div></th>
							        <th><div style={{width:80}}>总金额</div></th>
							        <th><div style={{width:80}}>配送工资</div></th>
							        <th><div style={{width:80}}>实收金额</div></th>
							        <th><div style={{width:80}}>管理操作</div></th>
							        <th><div style={{width:80}}>备注</div></th>
							      </tr>
							      </thead>
							      <tbody>
							      	<tr><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:100}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td></tr>
							      	<tr><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:100}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td></tr>
							      	<tr><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:100}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td></tr>
							      	<tr><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:100}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td></tr>
							      	<tr><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:100}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td></tr>
							      	<tr><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:100}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td></tr>
							      	<tr><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:100}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td></tr>
							      	<tr><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:100}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td></tr>
							      	<tr><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:100}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td></tr>
							      	<tr><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:100}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td></tr>
							      	<tr><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:100}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td></tr>
							      	<tr><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:100}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td></tr>
							      	<tr><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:100}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td></tr>
							      	<tr><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:100}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td></tr>
							      	<tr><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:100}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td></tr>
							      	<tr><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:100}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td></tr>
							      	<tr><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:100}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td></tr>
							      	<tr><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:100}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td></tr>
							      	<tr><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:100}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td></tr>
							      	<tr><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:100}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td></tr>
							      	<tr><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:100}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td></tr>
							      	<tr><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:100}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td></tr>
							      	<tr><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:100}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td></tr>
							      	<tr><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:100}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td></tr>
							      	<tr><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:100}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td></tr>
							      	<tr><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:100}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td></tr>
							      	<tr><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:100}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td></tr>
							      	<tr><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:100}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td></tr>
							      	<tr><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:100}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td></tr>
							      	<tr><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:100}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td></tr>
							      	<tr><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:100}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td></tr>
							      	<tr><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:100}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td></tr>
							      	<tr><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:100}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td></tr>
							      	<tr><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:100}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td></tr>
							      	<tr><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:100}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td></tr>
							      	<tr><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:100}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td><td><div style={{width:80}}>1</div></td></tr>


							      </tbody>
							    </table>
						    </div>
						    <div className='form-inline' style={{marginTop:20,float:'right'}}>
						    	<span style={{fontWeight:'bold'}}>{'应收金额总计：'}</span>
						    	<input readOnly type='text' style={{width:50}} className="form-control input-xs short-input"/>
						    	<span style={{fontWeight:'bold'}}>{'　工资总计：'}</span>
						    	<input readOnly type='text' style={{width:50}} className="form-control input-xs short-input"/>
						    	<span style={{fontWeight:'bold'}}>{'　实收金额总计：'}</span>
						    	<input readOnly type='text' style={{width:50}} className="form-control input-xs short-input"/>
						    	{'　(现金xxx,POS机xxx)　'}
						    </div>
						  </div>
						</div>
					</div>
					<div className="panel">
					              <div className="panel-body" style={{position: 'relative'}}>
					                <div>订单管理 >> 产品详情</div>
					                {/*<OrderProductsDetail loading={get_products_detail_ing} products={check_order_info.products} />*/}
					              </div>
					            </div>
				</div>
			)
	}
	componentDidMount(){
		this.onTbScroll('tab','box',1);
/*		window.onload = function (){
			
		}*/		
	}
	onTbScroll(viewid, scrollid, size){
	    	// 获取滚动条容器
		var scroll = document.getElementById(scrollid);
		/*var scroll = $(findDOMNode(this.refs.tab));*/
	        // 将表格拷贝一份
		var tb2 = document.getElementById(viewid).cloneNode(true);
		/*var tb2 = $(findDOMNode(this.refs.box).cloneNode(true));*/
	        // 获取表格的行数
		/*var len = tb2.rows.length;*/
		var len = tb2.rows.length;
	        // 将拷贝得到的表格中非表头行删除
		for(var i=tb2.rows.length;i>size;i--){
			// 每次删除数据行的第一行
	                tb2.deleteRow(size);
		}
	        // 创建一个div
		var bak = document.createElement("div");
	        // 将div添加到滚动条容器中
		scroll.appendChild(bak);
	        // 将拷贝得到的表格在删除数据行后添加到创建的div中
		bak.appendChild(tb2);
	        // 设置创建的div的position属性为absolute，即绝对定于滚动条容器（滚动条容器的position属性必须为relative）
		bak.style.position = "absolute";
	        // 设置创建的div的背景色与原表头的背景色相同（貌似不是必须）
		bak.style.backgroundColor = "#fff";
	        // 设置div的display属性为block，即显示div（貌似也不是必须，但如果你不希望总是显示拷贝得来的表头，这个属性还是有用处的）
		bak.style.display = "block";
	        // 设置创建的div的left属性为0，即该div与滚动条容器紧贴
		bak.style.left = 0;
	        // 设置div的top属性为0，初期时滚动条位置为0，此属性与left属性协作达到遮盖原表头
		bak.style.top = "0px";
	        // 给滚动条容器绑定滚动条滚动事件，在滚动条滚动事件发生时，调整拷贝得来的表头的top值，保持其在可视范围内，且在滚动条容器的顶端

		// 设置div的top值为滚动条距离滚动条容器顶部的距离值
		bak.style.top = scroll.scrollTop + 'px';
	        // 给滚动条容器绑定滚动条滚动事件，在滚动条滚动事件发生时，调整拷贝得来的表头的top值，保持其在可视范围内，且在滚动条容器的顶端
		scroll.onscroll = function(){
	                // 设置div的top值为滚动条距离滚动条容器顶部的距离值
			bak.style.top = this.scrollTop+"px";
		}				
	}	

}
