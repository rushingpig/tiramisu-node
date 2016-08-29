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
		return(
				<tr>
					<td>
						<input type = 'radio' />
					</td>
					<td>
						
					</td>
					<td></td>
					<td></td>
					<td></td>
					<td>
						<a href='javascript:;' >[选择]</a>
					</td>
				</tr>
			)
	}
}

class ProductRow extends Component{
	render(){
		return(
				<tr>
					<td>
						
					</td>
					<td></td>
					<td></td>
					<td></td>
					<td>
						<a href='javascript:;' >[删除]</a>
					</td>
				</tr>
			)
	}	
}

export default class ProductsModal extends Component{
	constructor(props){
		super(props);
		this.state = {
			page_size: 10
		}
	}
	render(){
		var {list, page_no, total, pri_pd_cates, sec_pd_cates } = this.props;
		var product_list = list.map( (n, i) => {
			return (<ProductSet key = {n + ' ' + i} {...{n, ...this.props}} />)
			}
		)
		var product_selected = list.map( (n, i) => {
			return (<ProductRow key = {n + ' ' + i} {...{n, ...this.props}} />)
		})
		return (
			<StdModal ref='modal' title = '选择商品' size='lg'>
				<div className ='form-group form-inline'>
					<input type = 'text' placeholder='商品名称' className='form-control input-xs space-right'/>
					<Select onChange = {this.onPriCateChange.bind(this)} options = {pri_pd_cates} default-text ='一级分类' className='space-right'/>
					<Select options = {sec_pd_cates} default-text = '二级分类' className='space-right' />
					<Select default-text = '官网上线'
						options = {
							[ {id: 1, text: '是'},
							  {id: 0, text: '否'}
							]
						} className = 'space-right'/>
        			<button className="btn btn-xs btn-theme"><i className="fa fa-search"></i>{' 查询'}</button>
				</div>
				<div ref="tableWrapper" className="table-responsive table-modal modal-list">
				  <table className="table table-hover table-bordered table-click text-center">
				  	<thead>
				  		<tr>
				  		<th></th>
				  		<th>商品编号(SPU)</th>
				  		<th>产品名称</th>
				  		<th>官网上线</th>
				  		<th>商品类型</th>
				  		<th>管理操作</th>
				  		</tr>
				  	</thead>
				  	{
				    	product_list.length ? <tbody>{product_list}</tbody>: <tbody>{get_table_empty()}</tbody>
				    }
				  </table>
				</div>
				<Pagination 
					total_count = {total}
					page_no = {page_no}
					page_size = {this.state.page_size}
				/>

				<hr className="dotted" />

				<div>商品管理 >> 选择列表</div>
				<div className="table-responsive">
				  <table className="table table-hover text-center">
				    <thead>
				    <tr>
				      <th>商品名称</th>
				      <th>商品编号</th>
				      <th>商品类型</th>
				      <th>官网是否上线</th>
				      <th>管理操作</th>
				    </tr>
				    </thead>
				    {
				    	product_selected.length ? <tbody>{product_selected}</tbody>: <tbody>{get_table_empty()}</tbody>
				    }
				  </table>
				</div>
			</StdModal>
			)
	}

	show(){
		this.refs.modal.show();
		this.props.searchProducts();
		this.props.getCategories();
	}
	hide(){
		this.refs.modal.show();
	}
	onPriCateChange(e){
		this.props.getSecCategories(e.target.value);
	}
}