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
						<input type = 'checkbox' />
					</td>
					<td>
						
					</td>
					<td></td>
					<td></td>
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
		var {list, total, page_no, page_size} = this.props;
		var product_list = list.map( (m, i) => {
			return(<ProductSet key = {m.product_id + ' ' + i} {...{...this.props, m}} />)
		})
		return(
			<StdModal ref='modal' title='选择团购产品' size = 'lg'>
				<div className = 'form-group form-inline'>
					<input type='text' className = 'form-control input-xs space-right' placeholder='产品名称'/>
					<Select default-text = '选择产品分类' className = 'space-right'/>
        			<button className="btn btn-xs btn-default"><i className="fa fa-search"></i>{' 查询'}</button>
				</div>
				<div ref="tableWrapper" className="table-responsive table-modal modal-list">
				  <table className="table table-hover table-bordered table-click text-center">
				    <thead>
				    <tr>
				      <th></th>
				      <th>产品名称</th>
				      <th>规格</th>
				      <th>渠道</th>
				      <th>产品类型名称</th>
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
				/>

				<hr className="dotted" />

				<div>产品管理 >> 选择列表</div>
				<div className="table-responsive">
				  <table className="table table-hover text-center">
				    <thead>
				    <tr>
				      <th>产品名称</th>
				      <th>规格</th>
				      <th>产品类型名称</th>
				      <th>渠道</th>
				      <th>价格</th>
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
		this.refs.modal.hide();
	}
}

class ProductSelectedRow extends Component{
	render(){
		return (
			<tr>
				<td></td>
				<td></td>
				<td></td>
				<td></td>
				<td></td>
				<td></td>
			</tr>
		)
	}
}