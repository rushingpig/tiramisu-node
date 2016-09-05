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
				<tr className={data.is_available === 0 || data.checked ? 'gray': ''}>
					<td>
						<input checked = {data.checked} disabled = {true} type = 'radio' />
					</td>
					<td>
						{data.spu_id}
					</td>
					<td>{data.product_name}</td>
					<td>{data.is_online == 1 ? '是' : '否'}</td>
					<td>{data.category_name + '/' + data.category_parent_name}</td>
					<td>
					{
						data.is_available ===0 || data.checked ? 
						<span>[选择]</span>
						:<a href='javascript:;' onClick = {this.onSelectProduct.bind(this)} >[选择]</a>
					}
					</td>
				</tr>
			)
	}
	onSelectProduct(){
		this.props.selectProduct(this.props.data);
	}
}

export default class ProductsModal extends Component{
	constructor(props){
		super(props);
		this.state = {
			page_size: 10,
			is_online: false,
		}
	}
	render(){
		var {list, page_no, total, pri_pd_cates, sec_pd_cates, selected_spu_info, selectProduct, } = this.props;
		var product_list = list.map( (n, i) => {
			return (<ProductSet key = {n.spu_id + ' ' + i} data = {n} selectProduct = {selectProduct}  />)
			}
		)
		var {is_online} = this.state;
		return (
			<StdModal ref='modal' title = '选择商品' size='lg' footer={false}>
				<div className ='form-group form-inline'>
					<input ref='keywords' type = 'text' placeholder='商品名称' className='form-control input-xs space-right'/>
					<Select ref='category_parent' onChange = {this.onPriCateChange.bind(this)} options = {pri_pd_cates} default-text ='一级分类' className='space-right'/>
					<Select ref='category' options = {sec_pd_cates} default-text = '二级分类' className='space-right' />
					{'　商城已上线：'}
					<input checked = {is_online} onClick = {this.onIsOnlineChange.bind(this)} type = 'checkbox' />{'　'}
        			<button className="btn btn-xs btn-theme"
        				onClick = {this.search.bind(this, 0)}><i className="fa fa-search"></i>{' 查询'}</button>
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
					onPageChage = {this.search.bind(this)}
				/>

				<hr className="dotted" />

				<div>商品管理 >> 选择列表</div>
				<div className="table-responsive">
				  <table className="table table-hover text-center">
				    <thead>
				    <tr>
				      <th></th>
				      <th>商品名称</th>
				      <th>商品编号</th>
				      <th>商品类型</th>
				      <th>商城是否上线</th>
				      <th>管理操作</th>
				    </tr>
				    </thead>
				    {
				    	selected_spu_info && selected_spu_info.spu_id ?
				    	<tbody>
				    		<tr>
				    			<td>
				    				
				    			</td>
				    			<td>{selected_spu_info.product_name}</td>
				    			<td>{selected_spu_info.spu_id}</td>
				    			<td>{selected_spu_info.category_name + '/' + selected_spu_info.category_parent_name}</td>
				    			<td>{selected_spu_info.is_online ===1 ? '是':'否'}</td>
				    			<td>
				    				<a href='javascript:;' onClick={this.onDelSelectedProduct.bind(this)} >[删除]</a>
				    			</td>
				    		</tr>
				    	</tbody>
				    	:null
				    }
				  </table>
				</div>
				<button className = 'btn btn-theme btn-xs pull-right' onClick = {this.onConfirm.bind(this)}>确定</button>
			</StdModal>
			)
	}

	show(){
		this.refs.modal.show();
		var {regionalism_id, src_id } = this.props
		this.props.searchProducts({regionalism_id, src_id, page_no: 0, page_size: this.state.page_size});
		this.props.getCategories();
	}
	search(page){
		var {is_online, page_size } = this.state;
		is_online = is_online ? 1 : 0;
		var page_no = typeof page == 'undefined' ? this.props.main.page_no : page;
		var query_data = {regionalism_id: this.props.regionalism_id, src_id: this.props.src_id, is_online, page_no, page_size }
		var keywords = this.refs.keywords.value.trim();
		if(keywords != ''){
			query_data.keywords = keywords;
		}
		var category_parent_id = this.refs.category_parent.value;
		if(category_parent_id != SELECT_DEFAULT_VALUE){
			query_data.category_parent_id = category_parent_id;
		}
		var category_id = this.refs.category.value;
		if(category_id != SELECT_DEFAULT_VALUE){
			query_data.category_id = category_id;
		}
		this.props.searchProducts(query_data);
	}
	onPriCateChange(e){
		this.props.getSecCategories(e.target.value);
	}
	onIsOnlineChange(){
		this.setState({
			is_online: !this.state.is_online
		})
	}
	onDelSelectedProduct(){
		this.props.delSelectProduct();
	}
	onConfirm(){
		this.refs.modal.hide();
	}
}