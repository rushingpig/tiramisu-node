import React, {Component, PropTypes} from 'react';
import { render, findDOMNode } from 'react-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { reduxForm } from 'redux-form';

import SearchInput from 'common/search_input';
import DatePicker from 'common/datepicker';
import Select from 'common/select';
import Pagination from 'common/pagination';
import AddressSelector from 'common/address_selector';
import { tableLoader, get_table_empty } from 'common/loading';
import Linkers from 'common/linkers';
import history from 'history_instance';
import StdModal from 'common/std_modal';

import * as GroupbuysProgramActions from 'actions/groupbuys/program_manage';
import AreaActions from 'actions/area';

class TopHeader extends Component{
	render() {
		return (
			<div className='clearfix top-header'>
				<button
				 onClick = {this.addProgram}
				 className="btn btn-theme btn-xs pull-left">
				   添加
				</button>
				<Linkers
				  data={['团购管理', '团购项目列表']}
				  active="团购项目列表"
				  className="pull-right" />
			</div>
		)
	}
	addProgram(){
		history.push('/gm/pg/add');
	}

}

class FilterHeader extends Component{

	render(){
		var {
			fields: {
				keywords,
				province_id,
				city_id,
				district_id,
				is_online,
				src_id,
			},
			area: {provinces, cities, districts,} ,
			actions } = this.props;
		return(
			<div className = 'panel search'>
				<div className = 'panel-body form-inline'>
					<SearchInput className = 'form-inline v-img space-right' placeholder = '项目名称' />
					<Select default-text='所属渠道' className='space-right'/>
					<AddressSelector {...{ province_id, city_id, district_id, provinces, cities, districts, actions,
						form: 'groupbuys_program_filter' }}/>
					<Select default-text = '当前是否上线' className = 'space-right' />
					<button className="btn btn-theme btn-xs">
					  <i className="fa fa-search"></i>{' 搜索'}
					</button>
				</div>
			</div>
			)
	}
}

FilterHeader = reduxForm({
	form: 'groupbuys_program_filter',
	fields: [
		'keywords',
		'province_id',
		'city_id',
		'district_id',
		'src_id',
		'is_online',
	]
})( FilterHeader)

var GroupbuyRow = React.createClass({
	render(){
		var {props} = this;
		return(
			<tr>
				<td>
					<a href={props.url} target='_blank' style={{textDecoration: 'underline'}}>{props.name}</a>
				</td>
				<td>{props.src_name}</td>
				<td>{props.online_time}</td>
				<td><span className = 'bg-warning bordered'>{props.city}</span>{ ' ' + props.province}</td>
				<td className='copy-col'>
					<span ref='url'>{props.url}</span>
					<button
						onClick = {this.copyUrl}
					    className="btn btn-default btn-xs space-left copy-btn">复制</button>
					<a href='javascript:;' ></a>
				</td>
				<td>
					<a href='javascript:;' onClick = {this.viewGroupbuyInfoModal}>{'[查看]　'}</a>
					<a href='javascript:;'>{'[编辑]　'}</a>
					<a href='javascript:;'>{'[下架]'}</a>
				</td>
			</tr>
			)
	},
	copyUrl(e){
		/*var id = this.props.id + 'url';*/
		var url = this.refs.url;
		var range = document.createRange();
		range.selectNode(url);
		var selector = window.getSelection();
		if(selector.rangeCount > 0){
			selector.removeAllRanges();
		}
		selector.addRange(range);
		document.execCommand('copy');
	},
	viewGroupbuyInfoModal(){
		this.props.viewGroupbuyInfoModal();
	},
})

class ManagePannel extends Component{
	constructor(props){
		super(props);
		this.state = {
			page_size: 10,
		}

		this.viewGroupbuyInfoModal = this.viewGroupbuyInfoModal.bind(this);
	}
	render(){
		var { main, area, actions } = this.props;
		var {list, page_no, refresh, total, loading } = main;

		var content = list.map( (m, i) => {
			return (
				<GroupbuyRow key = {m.id + ' ' + i} {...{...this.props, ...m, viewGroupbuyInfoModal: this.viewGroupbuyInfoModal}} />
				)
		})
		return(
			<div className='order-manage'>
				<TopHeader />
				<FilterHeader {...{area, actions}}/>	
				<div className = 'panel' >
          			<header className="panel-heading">团购项目列表</header>
          			<div className = 'panel-body'>
          				<table className = 'table table-hover text-center'>
          					<thead>
          						<tr>
          							<th>项目名称</th>
          							<th>所属渠道</th>
          							<th>上线时间段</th>
          							<th>城市</th>
          							<th>商城预约网址</th>
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
				/>
				<GroupbuyInfoModal ref='GroupbuyInfoModal' />
			</div>
			)
	}

	componentDidMount(){
		this.props.actions.getGroupbuyProgramList({page_no: 0, page_size: this.state.page_size});
	}

	viewGroupbuyInfoModal(){
		this.refs.GroupbuyInfoModal.show();
	}
}

class GroupbuyInfoModal extends Component{
	render(){
		return(
			<StdModal ref='modal' title = '查看团购项目信息' >
				<div className = 'form-group form-inline'>
					<label>项目名称：</label>
				</div>
				<div className = 'form-group form-inline'>
					<label>上线渠道：</label>
				</div>
				<div className = 'form-group form-inline'>
					<label>所属城市：</label>
				</div>
				<div className = 'form-group form-inline'>
					<label>上线时间：</label>
				</div>
				<div className = 'form-group form-inline'>
					<label>团购商品列表：</label>
				</div>
				<div className = 'form-group form-inline'>
					<label>预约网址：</label>
				</div>
			</StdModal>
			)
		
	}
	show(){
		this.refs.modal.show();
	}
	hide(){
		this.refs.modal.hide();
	}
}

function mapStateToProps(state){
  return state.groupbuysProgramManage;
}

function mapDispatchToProps(dispatch){
  return {
    actions:bindActionCreators({
      ...GroupbuysProgramActions,
      ...AreaActions(),
    },dispatch)};
}

export default connect(mapStateToProps, mapDispatchToProps)(ManagePannel);