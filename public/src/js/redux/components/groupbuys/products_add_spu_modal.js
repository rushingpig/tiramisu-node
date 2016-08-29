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

export default class ProductsModal extends Component{
	render(){
		return (
			<StdModal ref='modal' title = '选择商品' size='lg'>
				<div className ='form-group form-inline'>
					<input type = 'text' placeholder='商品名称' className='form-control input-xs space-right'/>
					<Select default-text ='一级分类' className='space-right'/>
					<Select default-text = '二级分类' className='space-right' />
					<Select default-text = '官网上线' className = 'space-right'/>
        			<button className="btn btn-xs btn-theme"><i className="fa fa-search"></i>{' 查询'}</button>
				</div>
				<div ref="tableWrapper" className="table-responsive table-modal modal-list">
				  <table className="table table-hover table-bordered table-click text-center">
				  	<thead>
				  		<th></th>
				  		<th>商品编号(SPU)</th>
				  		<th>产品名称</th>
				  		<th>官网上线</th>
				  		<th>商品类型</th>
				  		<th>管理操作</th>
				  	</thead>
				  </table>
				</div>
				<Pagination 
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
				    <tbody>
				    </tbody>
				  </table>
				</div>
			</StdModal>
			)
	}

	show(){
		this.refs.modal.show();
	}
	hide(){
		this.refs.modal.show();
	}
}