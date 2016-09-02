import React, {Component, PropTypes} from 'react';
import { render, findDOMNode } from 'react-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { reduxForm } from 'redux-form';

import { triggerFormUpdate } from 'actions/form';

import SearchInput from 'common/search_input';
import DatePicker from 'common/datepicker';
import Select from 'common/select';
import Pagination from 'common/pagination';
import AddressSelector from 'common/address_selector';
import { tableLoader, get_table_empty } from 'common/loading';
import Linkers from 'common/linkers';
import history from 'history_instance';
import StdModal from 'common/std_modal';

import * as GroupbuysProductsActions from 'actions/groupbuys/products_manage';
import AreaActions from 'actions/area';

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
		var { 
			fields: {
				keywords,
				src_id,
				pri_pd_cate,
				sec_pd_cate,
				province_id,
				city_id,
				in_project,
				is_online,
			}
		} = this.props;

		var {pri_pd_cates, sec_pd_cates, order_srcs, area} = this.props;
		var { provinces, cities } = area;
		return(
			<div className='panel panel-search'>
				<div className='panel-body form-inline'>
					<SearchInput {...keywords} placeholder = '商品名称' className = 'inline-block space-right'/> 
					<Select {...src_id} default-text='团购网站' options = {order_srcs} className='space-right'/>
					<Select {...pri_pd_cate} default-text='一级分类' options = {pri_pd_cates} className='space-right' onChange = {this.onPriCateChange.bind(this)}/>
					<Select {...sec_pd_cate} default-text='二级分类' options = {sec_pd_cates} className='space-right'/>
					<Select {...province_id} default-text='选择省份' options = { provinces } className='space-right'/>
					<Select {...city_id} default-text='选择城市' options = {cities} className='space-right'/>
					{'　属于团购项目：'}
					<input {...in_project} checked = {in_project.value == 1} onClick = {this.onIsProgramChange.bind(this, is_online.onChange)}  type ='checkbox' />
					{'　商城已上线：'}
					<input {...is_online} checked = {is_online.value == 1} onClick = {this.onIsOnlineChange.bind(this, in_project.onChange)} type = 'checkbox' />{'　'}
					<button className="btn btn-theme btn-xs">
					  <i className="fa fa-search"></i>{' 搜索'}
					</button>
				</div>
			</div>
			)
	}

	onProvinceChange(callback, e){
		this.props.getCityAndDistricts(e.target.value);
		callback(e);
	}
	onIsProgramChange(){
		this.setState({in_project: !this.state.in_project})
	}
	onIsOnlineChange(callback, e){
		var {fields: { is_online }} = this.props;
		var result = is_online.value == 1 ? 0: 1;
		this.props.triggerFormUpdate('groupbuys_products_filter','is_online',  result)
		callback(e)
	}
	onPriCateChange(callback, e){
		var {fields: { in_project }} = this.props;
		var result = in_project.value === 1 ? 0: 1;
		this.props.triggerFormUpdate('groupbuys_products_filter', 'in_project' ,result);
		callback(e)
	}

}

FilterHeader = reduxForm({
	form: 'groupbuys_products_filter',
	fields: [
		'keywords',
		'src_id',
		'pri_pd_cate',
		'sec_pd_cate',
		'province_id',
		'city_id',
		'in_project',
		'is_online',
	]
})(FilterHeader)

class ProductRow extends Component{
	render(){
		var {data} = this.props;
		return (
			<tr>
				<td>{data.sku_id + '/' + data.spu_id}</td>
				<td>{data.name}</td>
				<td>{data.size}</td>
				<td>￥{data.price / 100}</td>
				<td>{data.src_name}</td>
				<td>{data.project_name ? data.project_name : '/'}</td>
				<td>{data.category_name}</td>
				<td><span className = 'bg-warning bordered'>{data.city}</span>{ ' ' + data.province}</td>
				<td>{data.is_online == 1? '是': '否'}</td>
				<td>
					<a href='javascript:;' onClick = {this.viewEditModal.bind(this)}>[编辑价格]</a>{'　'}
					<a href='javascript:;' onClick = {this.viewMsgModal.bind(this)}>[下架]</a>
				</td>
			</tr>
			)
	}
	viewEditModal(){
		this.props.viewEditModal(this.props.data);
	}
	viewMsgModal(){
		this.props.viewMsgModal(this.props.data);
	}
}

class EditModal extends Component{
	constructor(props){
		super(props);
		this.state = {
			data: {},
			price: 0,
		}
	}
	render(){
		var {data, price} = this.state;
		return (
			<StdModal ref='modal' title = '编辑价格'>
				<header className = 'panel-heading'>{'SKU(' +data.sku_id + ')　　　' +  data.name }</header>
				<div className='panel-body'>
				<div className='form-group form-inline'>
					<label>团购城市：</label>
					<input value = {data.city} className='form-control input-xs space-right' style = {{width: 100}} type = 'text' readOnly />
					<input value = {data.province} className='form-control input-xs' style = {{width: 100}}  type = 'text' readOnly />
				</div>
				<div className='form-group form-inline'>
					<label>团购网站：</label>
					<input value = {data.src_name} className='form-control input-xs' type = 'text' readOnly />
				</div>
				<div className='form-group form-inline'>
					<label>所属项目：</label>
					<input value = {data.project_name}  className='form-control input-xs' type = 'text' readOnly />
				</div>
				<table className = 'table table-responsive text-center' style = {{maxWidth: 240}}>
					<thead>
						<tr>
							<th>规格</th>
							<th>价格（元）</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>{data.size}</td>
							<td><input onChange = {this.onPriceChange.bind(this)} value = {price / 100} type='text' className = 'form-control input-xs inline-block' style = {{width: 120, marginLeft: 10}} /></td>
						</tr>
					</tbody>
				</table>
				</div>
			</StdModal>
			)
	}
	show(data){
		this.setState({data, price: data.price})
		this.refs.modal.show();
	}
	onPriceChange(e){
		this.setState({price: e.target.value * 100});
	}
}

class MsgModal extends Component{
	constructor(props){
		super(props);
		this.state = {
			data: {},
		}
	}
	render(){
		var {data} = this.state;
		return(
			<StdModal title = '下架确认' ref ='modal' onConfirm = {this.onConfirm.bind(this)}>
				<header className = 'panel-heading'>{'SKU(' +data.sku_id + ')　　　' +  data.name }</header>
				<div className='panel-body'><span className = 'bg-warning bordered'>提示</span>{'　请确认是否下架当前商品， 若商品属于团购项目，且该团购项目只有此商品则会将团购项目一同下架'}</div>
			</StdModal>
			)
	}
	show(data){
		this.setState({data})
		this.refs.modal.show();
	}
	onConfirm(){
		this.props.offShelf(this.data.sku_id)
			.done( () => {
				this.refs.modal.hide();
				Noty('success', '下架成功')
			})
			.fail( (code, msg) => {
				Noty('error', msg || '下架失败')
			})
	}
}

class ManagePannel extends Component{
	constructor(props){
		super(props);
		this.state = {
			page_size: 10,
		}
	}
	render(){
		var {page_no , total, main, actions, area, triggerFormUpdate} = this.props;
		var { pri_pd_cates, sec_pd_cates, order_srcs, list, refresh, loading, total, page_no } = main;
		var { getSecCategories, getProductList, editSkuPrice, offShelf } = actions;
		var content = list.map( (m, i) => {
			return (<ProductRow data = {m} key= {m.sku_id + ' ' + i} 
				viewEditModal={ this.viewEditModal.bind(this)}
				viewMsgModal = {this.viewMsgModal.bind(this)}
				/>)
		})
		return(
			<div className='order-manage'>
				<TopHeader />
				<FilterHeader {...{pri_pd_cates, sec_pd_cates, order_srcs, area, getSecCategories, triggerFormUpdate}}/>
				<div className='panel'>
          			<header className="panel-heading">团购商品列表</header>
          			<div className='panel-body'>
          				<table className = 'table table-hover table-responsive text-center'>
          					<thead>
          						<tr>
	          						<th>spu编号/sku编号</th>
	          						<th>团购商品名称</th>
	          						<th>规格</th>
	          						<th>出售价格</th>
	          						<th>团购网站</th>
	          						<th>所属团购项目</th>
	          						<th>分类</th>
	          						<th>城市</th>
	          						<th>商城是否上线</th>
	          						<th>操作</th>
          						</tr>
          					</thead>
          					<tbody>
                				{ tableLoader( loading || refresh, content ) }
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
				<EditModal ref = 'EditModal' {...{editSkuPrice}}/>
				<MsgModal ref='MsgModal' {...{offShelf}} />
			</div>
			)
	}
	componentDidMount(){
		this.props.actions.getCategories();
		this.props.actions.getOrderSrcs();
		this.props.actions.getProvincesSignal();
		this.props.actions.getProductList({page_size: this.state.page_size, page_no: 0})
	}
	search(page){
		page = typeof page == 'undefined' ? this.props.main.page_no: page;
		this.props.actions.getProductList({page_size: this.state.page_size, page_no: page});
	}
	viewEditModal(data){
		this.refs.EditModal.show(data);
	}
	viewMsgModal(data){
		this.refs.MsgModal.show(data);
	}
}

function mapStateToProps(state){
  return state.groupbuysProductsManage;
}

function mapDispatchToProps(dispatch){
  return {
    actions:bindActionCreators({
      ...GroupbuysProductsActions,
      ...AreaActions(),
      triggerFormUpdate,
    },dispatch)};
}

export default connect(mapStateToProps, mapDispatchToProps)(ManagePannel)