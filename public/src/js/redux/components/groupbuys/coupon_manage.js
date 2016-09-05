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
import { Noty, dom } from 'utils/index';
import V from 'utils/acl';

import {SRC, SELECT_DEFAULT_VALUE } from 'config/app.config';

import * as CouponManageActions from 'actions/groupbuys/coupon_manage';
import AreaActions from 'actions/area';

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

		},
		order_srcs,
		area,
		} = this.props;
		var {provinces, cities} = area;
		var {search_ing, search_by_keywords_ing} = this.state;
		return (
			<div className='panel search'>
				<div className = 'panel-body form-inline'>
					<SearchInput {...coupon} className = 'form-inline v-img space-right' placeholder = '团购券码'
						searchHandler = {this.search.bind(this, 'search_by_keywords_ing')} />
					{'开始时间'}
					<DatePicker editable 
						redux-form = {begin_time}
						className="short-input" />
					{' 结束时间'}
					<DatePicker editable 
						redux-form = {end_time}
					  className="short-input space-right" />
					<Select default-text='团购网站' {...src_id} className='space-right' options = {order_srcs} />
					<Select default-text ='选择省份' {...province_id} className = 'space-right' options = {provinces} />
					<Select default-text = '选择城市' {...city_id} className = 'space-right' options = {cities} />
					<button disabled = {search_ing} data-submitting = {search_ing} className="btn btn-theme btn-xs"
						onClick = {this.search.bind(this, 'search_ing')}>
					  <i className="fa fa-search"></i>{' 搜索'}
					</button>
				</div>
			</div>
			)
		
	}
	onProvinceChange(callback, e){
		this.props.getCitiesSignal({province_id: e.target.value, is_standard_area: 0});
		callback(e);
	}
	search(search_in_state){
		this.setState({[search_in_state]: true});
		this.props.getCouponOrderList({page_no: 0, page_size: this.props.page_size, src_id: SRC.group_site})
			.always(()=>{
			  this.setState({[search_in_state]: false});
			});
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

class CouponRow extends Component{
	render(){
		var {props} = this;
		var {src_name } = props;
		var src_names = src_name.split(',');
		return (
			<tr>
				<td>{props.coupon}</td>
				<td>{src_names[1]}</td>
				<td>{props.order_id}</td>
				<td>{props.created_time}</td>
				<td><span className = 'bg-warning bordered'>{props.city}</span>{ ' ' + props.province}</td>
				<td>
					{
						V('GroupbuyCouponManageViewStatus')
						?
						<a href='javascript:;'>[查看状态]</a>
						:null
					}
				</td>
			</tr>
			)
	}
}

class CouponManagePannel extends Component{
	constructor(props){
		super(props);
		this.state = {
			page_size: 10,
		}
	}
	render(){
		var { total, page_no, list, loading, refresh, order_srcs } = this.props.main;
		var {area, actions} = this.props;
		var {getCouponOrderList, getCitiesSignal } = actions;
		var content = list.map( (n, i) => {
			return <CouponRow key={n.order_id + ' ' + i} {...{...n}} />
		})
		return(
			<div className = 'order-manage'>
				<TopHeader />
				<FilterHeader {...{order_srcs, area, getCouponOrderList, getCitiesSignal, page_size: this.state.page_size}} />
					<div className = 'panel' >
          			<header className="panel-heading">团购券列表</header>
          			<div ref='table-container' className = 'panel-body'>
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
				  onPageChange = {this.onPageChange.bind(this)}
				/>					
			</div>
			)
	}
	onPageChange(page){
    	var unlock = dom.lock(this.refs['table-container']);
		this.search(page).done(unlock);
	}
	componentDidMount(){
		this.search()
		this.props.actions.getOrderSrcs();
		this.props.actions.getProvincesSignal();
	}
	search(page){
		page = typeof page == 'undefined' ? this.props.main.page_no : page;
		return this.props.actions.getCouponOrderList({page_no: page, page_size: this.state.page_size, src_id: SRC.group_site})
	}
}

function mapStateToProps(state){
  return state.groupbuysCouponManage;
}

function mapDispatchToProps(dispatch){
  return {
    actions:bindActionCreators({
      ...CouponManageActions,
      ...AreaActions(),
    },dispatch)};
}

export default connect(mapStateToProps, mapDispatchToProps)(CouponManagePannel);

