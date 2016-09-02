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
						<input type = 'checkbox' checked = {data.checked} />
					</td>
					<td>
						{data.name}
					</td>
					<td>{data.size}</td>
					<td>{data.src_name}</td>
					<td>{data.category_name}</td>
					<td>￥{data.price / 100}</td>
					<td>{data.is_online ? '是' : '否'}</td>
					<td>
						{
							data.is_available === 0?
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
			page_size : 4,
			keywords: '',
			pri_cate_id: SELECT_DEFAULT_VALUE,
			sec_cate_id: SELECT_DEFAULT_VALUE,
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
			<StdModal ref='modal' title='选择团购商品' size = 'lg' onConfirm = {this.onConfirm.bind(this)} onCancel = {this.onCancel.bind(this)}>
				<div className = 'form-group form-inline'>
					<input type='text' className = 'form-control input-xs space-right' placeholder='商品名称'/>
					<Select default-text = '商品一级分类' className = 'space-right' options = {pri_pd_cates} onChange = {this.onPriCateChange.bind(this)}/>
					<Select default-text = '商品二级分类' className = 'space-right' options = {sec_pd_cates} />
        			<button className="btn btn-xs btn-default"><i className="fa fa-search"></i>{' 查询'}</button>
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
				  page_size={this.state.page_size} 
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
			</StdModal>
			)

	}

	show(){
		this.refs.modal.show();
	}
	hide(){
		this.refs.modal.hide();
	}
	onPriCateChange(e){
		this.setState({pri_cate_id: e.target.value});
		this.props.getSecCategories(e.target.value);
	}
	onSecCateChange(e){
		this.setState({sec_cate_id: e.target.value});
	}
	search(){
		var query_data = {page_no: 0, page_size: this.state.page_size};
		if(this.state.keywords.trim() !== ''){
			query_data.keywords = this.state.keywords;
		}
		if(this.state.pri_cate_id !== SELECT_DEFAULT_VALUE){
			query_data.pri_cate_id = this.state.pri_cate_id;
		}
		if(this.state.sec_cate_id !== SELECT_DEFAULT_VALUE){
			query_data.sec_cate_id = this.state.sec_cate_id;
		}
		this.props.searchGroupbuysProducts(query_data);
	}
	onConfirm(){
		this.refs.modal.hide();
	}
	onCancel(){
		this.props.cancelSelectProduct();
		this.refs.modal.hide();
	}
}

class ProductSelectedRow extends Component{
	render(){
		var {data} = this.props;
		return (
			<tr>
				<td></td>
				<td>{data.name}</td>
				<td>{data.size}</td>
				<td>{data.src_name}</td>
				<td>{data.category_name}</td>
				<td>￥{data.price / 100}</td>
				<td>{data.is_online ? '是' : '否'}</td>
				<td><a href="javascript:;" onClick = {this.onDelete.bind(this)}>[删除]</a></td>
			</tr>
		)
	}
	onDelete(){
		this.props.deleteProduct(this.props.data.id);
	}
}