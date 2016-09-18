import React, { Component, PropTypes } from 'react';
import Select from 'common/select';
import Pagination from 'common/pagination';
import SelectGroup from 'common/select_group';
import { get_table_empty } from 'common/loading';
import StdModal from 'common/std_modal';

import * as OrderProductsActions from 'actions/order_products';
import { SELECT_DEFAULT_VALUE } from 'config/app.config';
import { toFixed, dom } from 'utils/index';

class ProductSet extends Component{
	render(){
		var {data} = this.props;
		return(
				<tr  className={data.is_available === 0 || data.checked ? 'gray' : ''} >
					<td>
						{
							data.is_available === 0 || data.checked ?
							<input type = 'checkbox' checked = {data.checked} disabled = {true}/>
							:
							<input type = 'checkbox' checked = {data.checked} onClick = {this.onSelect.bind(this)}/>
						}
					</td>
					<td>
						{data.product_name}
					</td>
					<td>{data.size}</td>
					<td>{data.src_name}</td>
					<td>{data.category_name}</td>
					<td>￥{data.price / 100}</td>
					<td>{data.is_online == 1 ? '是' : '否'}</td>
					<td>
						{
							data.is_available === 0 || data.checked ?
							<span className = 'gray'>[选择]</span>
							:<a href='javascript:;' onClick = {this.onSelect.bind(this)} >[选择]</a>
						}
					</td>
				</tr>
			)
	}
	onSelect(){
		this.props.selectProduct(this.props.data);
	}
}

export default class ProductsModal extends Component{
	constructor(props){
		super(props);
		this.state = {
			keywords: '',
			category_parent_id: SELECT_DEFAULT_VALUE,
			category_id: SELECT_DEFAULT_VALUE,
		}
	}
	render(){
		var {list, total, page_no, page_size, pri_pd_cates, sec_pd_cates, selected_list, selectProduct, deleteProduct} = this.props;
		var product_list = (list || []).map( (m, i) => {
			return(<ProductSet key = {m.id + ' ' + i} data = {m} selectProduct = {selectProduct} />)
		})
		var product_selected_list = (selected_list || []).map( (m, i) => {
			return (<ProductSelectedRow key = {m.id + ' ' + i} data = {m} deleteProduct = {deleteProduct} />)
		})
		return(
			<StdModal ref='modal' title='选择团购商品' size = 'lg' onConfirm = {this.onConfirm.bind(this)} footer = {false}>
				<div className = 'form-group form-inline'>
					<input value={this.state.keywords} onChange={this.onKeywordsChange.bind(this)} type='text' className = 'form-control input-xs space-right' placeholder='商品名称'/>
					<Select default-text = '商品一级分类' className = 'space-right' options = {pri_pd_cates} onChange = {this.onPriCateChange.bind(this)}/>
					<Select default-text = '商品二级分类' className = 'space-right' options = {sec_pd_cates} onChange = {this.onSecCateChange.bind(this)} />
        			<button className="btn btn-xs btn-default" 
        				onClick = {this.onSearch.bind(this)}><i className="fa fa-search"></i>{' 查询'}</button>
				</div>
				<div ref="tableWrapper" className="table-responsive table-modal modal-list">
				  <table className="table table-hover table-bordered table-click text-center">
				    <thead>
				    <tr>
				      <th></th>
				      <th>商品名称</th>
				      <th>规格</th>
				      <th>渠道</th>
				      <th>商品类型名称</th>
				      <th>价格</th>
				      <th>官网是否上线</th>
				      <th>管理操作</th>
				    </tr>
				    </thead>
				    {
				    	product_list.length ? <tbody>{product_list}</tbody>: <tbody>{get_table_empty()}</tbody>
				    }
				  </table>
				</div>

				<Pagination 
				  page_no={page_no} 
				  total_count={total} 
				  page_size={page_size} 
				  onPageChange = {this.onPageChange.bind(this)}
				/>

				<hr className="dotted" />

				<div>商品管理 >> 选择列表</div>
				<div className="table-responsive">
				  <table className="table table-hover text-center">
				    <thead>
				    <tr>
				      <th></th>
				      <th>商品名称</th>
				      <th>规格</th>
				      <th>渠道</th>
				      <th>商品类型名称</th>
				      <th>价格</th>
				      <th>官网是否上线</th>
				      <th>管理操作</th>
				    </tr>
				    </thead>
				    {
				    	product_selected_list.length ? <tbody>{product_selected_list}</tbody>: <tbody>{get_table_empty()}</tbody>
				    }
				  </table>
				</div>
				<button className = 'btn btn-theme btn-xs pull-right' onClick = {this.onConfirm.bind(this)}>确定</button>
			</StdModal>
			)

	}

	show(){
		this.refs.modal.show();
	}
	onPriCateChange(e){
		this.setState({category_parent_id: e.target.value});
		this.props.getSecCategories(e.target.value);
	}
	onSecCateChange(e){
		this.setState({category_id: e.target.value});
	}
	onKeywordsChange(e){
		this.setState({keywords: e.target.value});
	}
	onSearch(){
		this.search();
	}
	onPageChange(page){
		this.search(page);
	}
	search(page){
		page = typeof page == 'undefined' ? this.props.page_no: page;
		var query_data = {page_no: page, page_size: this.props.page_size, regionalism_id: this.props.regionalism_id,
			src_id : this.props.src_id};
		if(this.state.keywords.trim() !== ''){
			query_data.keywords = this.state.keywords;
		}
		if(this.state.category_parent_id !== SELECT_DEFAULT_VALUE){
			query_data.category_id = this.state.category_parent_id;
		}
		if(this.state.category_id !== SELECT_DEFAULT_VALUE){
			query_data.category_id = this.state.category_id;
		}
		this.props.searchGroupbuysProducts(query_data);
	}
	onConfirm(){
		this.refs.modal.hide();
	}
}

class ProductSelectedRow extends Component{
	render(){
		var {data} = this.props;
		return (
			<tr>
				<td></td>
				<td>{data.product_name}</td>
				<td>{data.size}</td>
				<td>{data.src_name}</td>
				<td>{data.category_name}</td>
				<td>￥{data.price / 100}</td>
				<td>{data.is_online == 1 ? '是' : '否'}</td>
				<td><a href="javascript:;" onClick = {this.onDelete.bind(this)}>[删除]</a></td>
			</tr>
		)
	}
	onDelete(){
		this.props.deleteProduct(this.props.data.id);
	}
}