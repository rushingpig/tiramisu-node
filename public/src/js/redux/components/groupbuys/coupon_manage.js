import React, {Component, PropTypes} from 'react';
import { render, findDOMNode } from 'react-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { reduxForm } from 'redux-form';

import SearchInput from 'common/search_input';
import DatePicker from 'common/datepicker';
import Select from 'common/select';
import Pagination from 'common/pagination';
import { tableLoader, get_table_empty } from 'common/loading';
import Linkers from 'common/linkers';

class TopHeader extends Component{
	render() {
		return (
			<div className='clearfix top-header'>
				<button
				 style = {{marginLeft: 20}}
				 className="btn btn-theme btn-xs pull-right">
				   导出
				</button>
				<Linkers
				  data={['团购管理', '团购券列表']}
				  active="团购券列表"
				  className="pull-right" />
			</div>
		)
	}

}

class FilterHeader extends Component{
	constructor(props){
		super(props);
		this.state = {
			search_by_keywords_ing: false,
			search_ing: false,
		}
	}
	render(){
		var { fields: {
			coupon,
			begin_time,
			end_time,
			src_id,
			province_id,
			city_id,

		}} = this.props;
		var {search_ing, search_by_keywords_ing} = this.state;
		return (
			<div className='panel search'>
				<div className = 'panel-body form-inline'>
					<SearchInput {...coupon} className = 'form-inline v-img space-right' placeholder = '项目名称'
						searchHandler = {this.search.bind(this, 'search_by_keywords_ing')} />
					{'开始时间'}
					<DatePicker editable 
						redux-form = {begin_time}
						className="short-input" />
					{' 结束时间'}
					<DatePicker editable 
						redux-form = {end_time}
					  className="short-input space-right" />
					<Select default-text='团购网站' className='space-right' />
					<Select default-text ='选择省份' className = 'space-right' />
					<Select default-text = '选择城市' className = 'space-right' />
					<button disabled = {search_ing} data-submitting = {search_ing} className="btn btn-theme btn-xs"
						onClick = {this.search.bind(this, 'search_ing')}>
					  <i className="fa fa-search"></i>{' 搜索'}
					</button>
				</div>
			</div>
			)
		
	}

	search(){

	}
}

FilterHeader = reduxForm({
	form: 'groupbuys_coupon_filter',
	fields: [
		'coupon',
		'begin_time',
		'end_time',
		'src_id',
		'province_id',
		'city_id',
	]
})(FilterHeader)

export default class CouponManagePannel extends Component{
	constructor(props){
		super(props);
		this.state = {
			page_size: 10,
		}
	}
	render(){
		var { total, page_no, list } = this.props.main;
		return(
			<div className = 'order-manage'>
				<TopHeader />
				<FilterHeader />
				<div className = 'panel'>
					<header className = 'panel-heading'>团购券列表</header>
					<div className = 'panel' >
          			<header className="panel-heading">团购项目列表</header>
          			<div className = 'panel-body'>
          				<table className = 'table table-hover text-center'>
          					<thead>
          						<tr>
          							<th>团购券码</th>
          							<th>团购网站</th>
          							<th>本系统订单号</th>
          							<th>本站下单时间</th>
          							<th>城市</th>
          							<th>操作</th>
          						</tr>
          					</thead>
          					<tbody>
          						{tableLoader(loading || refresh, content)}
          					</tbody>
          				</table>
          			</div>
				</div>
				<Pagination 
				  page_no={page_no} 
				  total_count={total} 
				  page_size={this.state.page_size} 
				  onPageChange = {this.search.bind(this)}
				/>					
				</div>
			</div>
			)
	}
	onPageChange(){

	}
}

