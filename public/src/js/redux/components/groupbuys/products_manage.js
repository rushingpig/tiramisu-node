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

class TopHeader extends Component{
	render() {
		return (
			<div className='clearfix top-header'>
				<button
				 onClick = {this.addProduct.bind(this)}
				 className="btn btn-theme btn-xs pull-left">
				   添加
				</button>				
				<button
				 onClick = {this.addProduct.bind(this)}
				 style = {{marginLeft: 20}}
				 className="btn btn-theme btn-xs pull-right">
				   导出
				</button>
				<Linkers
				  data={['团购管理', '团购商品列表']}
				  active="团购商品列表"
				  className="pull-right space-left" />
			</div>
		)
	}
	addProduct(){
		history.push('/gm/pd/add');
	}

}

class FilterHeader extends Component{
	render(){
		return(
			<div className='panel panel-search'>
				<div className='panel-body form-inline'>
					<SearchInput placeholder = '商品名称' className = 'inline-block space-right'/> 
					<Select default-text='所属渠道' className='space-right'/>
					<Select default-text='一级分类' className='space-right'/>
					<Select default-text='二级分类' className='space-right'/>
					<Select default-text='选择省份' className='space-right'/>
					<Select default-text='选择城市' className='space-right'/>
					<Select default-text='是否属于团购项目' className='space-right'/>
					<Select default-text='商城是否上线' className='space-right'/>
					<button className="btn btn-theme btn-xs">
					  <i className="fa fa-search"></i>{' 搜索'}
					</button>
				</div>
			</div>
			)
	}	
}

/*FilterHeader = reduxForm({
	form: 'groupbuys_products_filter',
	fields: [
		'keywords',
		'src_id',
		''
	]
})*/

class EditModal extends Component{
	render(){
		return (
			<StdModal ref='modal' title = '编辑价格'>
				<div className='form-group form-inline'>
					<label>团购城市：</label>
					<Select />
					<Select />
				</div>
				<div className='form-group form-inline'>
					<label>团购网站：</label>
					<Select />
				</div>
				<div className='form-group form-inline'>
					<label>所属项目：</label>
					<Select />
				</div>
			</StdModal>
			)
	}
}
export default class ManagePannel extends Component{
	constructor(props){
		super(props);
		this.state = {
			page_size: 10,
		}
	}
	render(){
		var {page_no , total} = this.props;
		return(
			<div className='order-manage'>
				<TopHeader />
				<FilterHeader />
				<div className='panel'>
          			<header className="panel-heading">团购商品列表</header>
          			<div className='panel-body'>
          				<table className = 'table table-hover text-center'>
          					<thead>
          						<th>spu编号/sku编号</th>
          						<th>团购商品名称</th>
          						<th>规格</th>
          						<th>出售价格</th>
          						<th>所属渠道</th>
          						<th>所属团购项目</th>
          						<th>分类</th>
          						<th>城市</th>
          						<th>商城是否上线</th>
          						<th>操作</th>
          					</thead>
          				</table>
          			</div>
				</div>
				<Pagination 
				  page_no={0} 
				  total_count={0} 
				  page_size={this.state.page_size} 
				/>
			</div>
			)
	}
}