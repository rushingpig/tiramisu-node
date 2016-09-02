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
	constructor(props){
		super(props);
		this.state = {
			search_ing: false,
			search_by_keywords_ing: false,
		}
	}
	render(){
		var {
			fields: {
				keywords,
				province_id,
				city_id,
				is_online,
				src_id,
			},
			area: {provinces, cities,} ,
			actions, order_srcs } = this.props;
		var {search_ing, search_by_keywords_ing} = this.props;
		return(
			<div className = 'panel search'>
				<div className = 'panel-body form-inline'>
					<SearchInput {...keywords} className = 'form-inline v-img space-right' placeholder = '项目名称'
						searchHandler = {this.search.bind(this, 'search_by_keywords_ing')} />
					<Select {...src_id} options = {order_srcs} default-text='所属渠道' className='space-right'/>
					<Select options = {provinces} {...province_id} default-text = '选择省份' className='space-right' onChange = {this.onProvinceChange.bind(this)} />
					<Select options = { cities } {...city_id} default-text = '选择城市' className='space-right' />
					<Select options = {
						[{id: 1, text: '是'}, {id: 0, text: '否'}]
					} {...is_online} default-text = '当前是否上线' className = 'space-right' />
					<button disabled = {search_ing} data-submitting = {search_ing} className="btn btn-theme btn-xs"
						onClick = {this.search.bind(this, 'search_ing')}>
					  <i className="fa fa-search"></i>{' 搜索'}
					</button>
				</div>
			</div>
			)
	}
	onProvinceChange(callback, e){
		this.props.actions.getCityAndDistricts(e.target.value);
		callback(e);
	}
	search(search_in_state){
		this.setState({[search_in_state]: true});
		this.props.actions.getGroupbuyProgramList({page_no: 0, page_size: this.props.page_size});
	}
}

FilterHeader = reduxForm({
	form: 'groupbuys_program_filter',
	fields: [
		'keywords',
		'province_id',
		'city_id',
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
				<td>{props.start_time + '~' + props.end_time}</td>
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
					<a href='javascript:;' onClick = {this.editHandler}>{'[编辑]　'}</a>
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
		this.props.actions.getGroupbuyProgramDetail(this.props.id);
		this.props.viewGroupbuyInfoModal();
	},
	editHandler(){
		history.push('/gm/pg/edit/' + this.props.id);
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
		var {list, page_no, refresh, total, loading, order_srcs, program_info } = main;

		var content = list.map( (m, i) => {
			return (
				<GroupbuyRow key = {m.id + ' ' + i} {...{...this.props, ...m, viewGroupbuyInfoModal: this.viewGroupbuyInfoModal}} />
				)
		})
		return(
			<div className='order-manage'>
				<TopHeader />
				<FilterHeader {...{area, actions, order_srcs, page_size: this.state.page_size}}/>	
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
				  onPageChange = {this.search.bind(this)}
				/>
				<GroupbuyInfoModal ref='GroupbuyInfoModal' {...{program_info, resetGroupbuyProgram: this.props.actions.resetGroupbuyProgram}}/>
			</div>
			)
	}

	componentDidMount(){
		this.props.actions.getGroupbuyProgramList({page_no: 0, page_size: this.state.page_size});
		this.props.actions.getOrderSrcs();
		this.props.actions.getProvincesSignal();
	}
	search(page){
		page = typeof page == 'undefined' ? this.props.main.page_no: page;
		this.props.actions.getGroupbuyProgramList({page_no: page, page_size: this.state.page_size});
	}
	viewGroupbuyInfoModal(){
		this.refs.GroupbuyInfoModal.show();
	}
}

class GroupbuyInfoModal extends Component{
	render(){
		var { program_info } = this.props;
		var {products } = program_info;
		var product_list = [];
		if(products){
			  product_list = products.map( (m, i) => {
				return (<tr key={ m.id + ' ' + i}>
							<td>{m.name}</td>
							<td>{m.size}</td>
							<td>{m.product_name}</td>
							<td>{m.is_online == 1 ? '是':'否'}</td>
							<td>￥{m.price / 100}</td>
						</tr>)
			})	
		}
		
		return(
			<StdModal ref='modal' title = '查看团购项目信息' footer = {false} onCancel = {this.hide.bind(this)}>
				<div className = 'form-group form-inline'>
					<label>项目名称：</label>
					<span className='gray'>{program_info.name}</span>
				</div>
				<div className = 'form-group form-inline'>
					<label>上线渠道：</label>
					<span className = 'gray'>{program_info.src_name}</span>
				</div>
				<div className = 'form-group form-inline'>
					<label>所属城市：</label>
					<span className = 'gray'>{program_info.city_name + ' ' + program_info.province_name}</span>
				</div>
				<div className = 'form-group form-inline'>
					<label>上线时间：</label>
					<span className = 'gray'>{program_info.start_time + '~' + program_info.end_time}</span>
				</div>
				<div className = 'form-group form-inline'>
					<label>团购商品列表：</label>
					<table className = 'table table-responsive'>
						<thead>
							<tr>
							<th>团购商品</th>
							<th>规格</th>
							<th>产品类型名称</th>
							<th>商城上线</th>
							<th>价格</th>
							</tr>
						</thead>
						{
						  	product_list.length ? <tbody>{product_list}</tbody>: <tbody>{get_table_empty()}</tbody>
						}
					</table>
				</div>
				<div className = 'form-group form-inline'>
					<label>预约网址：</label>
					<span className = 'gray'>{program_info.url}</span>
				</div>
			</StdModal>
			)
		
	}
	show(){
		this.refs.modal.show();
	}
	hide(){
		this.props.resetGroupbuyProgram();
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