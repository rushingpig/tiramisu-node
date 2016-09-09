import React, {Component, PropTypes} from 'react';
import {render, findDOMNode} from 'react-dom';
import { reduxForm } from 'redux-form';

/*import { isSrc } from 'reducers/form';*/
import Select from 'common/select';
import LazyLoad from 'utils/lazy_load';
import { Noty, form as uForm, dateFormat, getDate } from 'utils/index';
import { SELECT_DEFAULT_VALUE } from 'config/app.config';
import DatePicker from 'common/datepicker';
import LineRouter from 'common/line_router';
import history from 'history_instance';

import AddSpuModal from './products_add_spu_modal';


/*class SKURow extends Component{

}*/

export default class ManageForm extends Component{
	constructor(props){
		super(props);
		this.state = {
			province_id: SELECT_DEFAULT_VALUE,
			regionalism_id: SELECT_DEFAULT_VALUE,
			src_id: SELECT_DEFAULT_VALUE,
			product_name: '',

			filter_sku_size_list: [],
			sku_size_list: [],
			current_size: SELECT_DEFAULT_VALUE,
		}
	}
	render(){
		var { area: { provinces, cities }, main: { order_srcs, list, page_no, total, pri_pd_cates, sec_pd_cates, selected_spu_info, spu_sku_list, save_ing, save_success }} = this.props;
		var {actions : {
			searchProducts, getSecCategories, getCategories, selectProduct, delSelectProduct, getAllSize, addSize
		}} = this.props;
		var { filter_sku_size_list, current_size, province_id, regionalism_id, src_id, product_name } = this.state;
		var add_btn_disabled = province_id === SELECT_DEFAULT_VALUE || regionalism_id === SELECT_DEFAULT_VALUE || src_id === SELECT_DEFAULT_VALUE;
		var new_sku_size_list = spu_sku_list.filter( m => m.is_new)
		var submit_btn_disabled = !(selected_spu_info && selected_spu_info.spu_id && new_sku_size_list.length);
		var sku_size_content = filter_sku_size_list.map( (n, i) => {
			return (<option key={n.id + ' ' + i} value = {n.text}>{n.text}</option>)
		})
		return(
				<div>
					<header className='panel-heading'>团购商品详情</header>
					<div className='panel-body'>
						<div className='form-group form-inline'>
							<label>{'　　团购城市：'}</label>
							<Select default-text = '选择省份' className = "space-right" options = {provinces} onChange={this.onProvinceChange.bind(this)}/>
							<Select default-text = '选择城市' options = {cities} onChange = {this.onCityChange.bind(this)}/>
						</div>
						<div className ='form-group form-inline gray'>
							{'　　　　备注：团购商品的预约时间是默认此商品SPU整体的提前预约时间，如需更改请前往商品管理编辑修改'}
						</div>
						<div className='form-group form-inline'>
							<label>{'　　团购网站：'}</label>
							<Select options={ order_srcs } default-text='团购网站' onChange = {this.onSrcChange.bind(this)}/>
						</div>
						<div className='form-group form-inline'>
							<label>{'　　选择商品：'}</label>
							<button
								disabled = {add_btn_disabled}
							  	onClick = {this.add_spu.bind(this)}
								className = 'btn btn-xs btn-default '>
								<i className='fa fa-plus'></i>
								{!submit_btn_disabled ? ' 修改':' 添加'}</button>
						</div>
						{
							selected_spu_info && selected_spu_info.spu_id ?
						[
						<div key='product_name_div' className = 'form-group form-inline'>
							<label>团购商品名称：</label>
							<input type='text' value = {product_name}  className = 'form-control input-xs' onChange = {this.onProductNameChange.bind(this)} />
						</div>,
						<div key='size_list_div' className = 'form-group form-inline'>
							<table className='table text-center text-center' style = {{ marginLeft: 60, width: '50%', border: '2px solid #ddd', minWidth: 600}}>
								<thead>
									<tr>
										<td style={{textAlign: 'right', fontWeight: 'bold'}}>
											{'SPU(' + selected_spu_info.spu_id + ')　　' +selected_spu_info.product_name}
										</td>
										<td></td>
										<td></td>
									</tr>
									<tr>
									<th>规格</th>
									<th>价格（元）</th>
									<th>操作</th>
									</tr>
								</thead>
								<tbody>
									{
										spu_sku_list && spu_sku_list.length ?
										spu_sku_list.map( (m, i) => {
											return (<tr key={i + ' '} style={{border: 0}}>
												<td style ={{borderRight: '2px solid #ddd'}}><input type='text' className='form-control input-xs' readOnly value = {m.size}/></td>
												<td style ={{borderRight: '2px solid #ddd'}}><input type='text' className='form-control input-xs' readOnly value = {m.price / 100} /></td>
												<td>
													{m.is_new ?
														<a href='javascript:;' onClick = {this.delSize.bind(this, i)}>[删除]</a>
														:null
													}
												</td>
											</tr>)
										})
										:null
									}
									<tr>
										<td style = {{borderRight: '2px solid #ddd'}}>
											<input className = 'form-control input-xs' type = 'text' 
												onChange = {this.filterHandler.bind(this)} placeholder='输入关键字搜索规格'/>
											<select ref='size' className = 'form-control input-xs ' value = {current_size} onChange = {this.onSizeChange.bind(this)}>
												{
													sku_size_content.length?
													sku_size_content:
													<option key='none' value='无'>无</option>
												}
											</select>
										</td>
										<td  style ={{borderRight: '2px solid #ddd'}}>
											<input ref='price' className = 'form-control input-xs space-right' />
										</td>
										<td>
											<button className = 'btn btn-default btn-xs space-left'
												onClick = {this.addSize.bind(this)}>
												<fa className = 'fa fa-plus'></fa>{' 添加'}
											</button>
										</td>
									</tr>
								</tbody>
							</table>
						</div>,
						]
						:null}
						
						<div className = 'form-group'>
							{'　　　　　'}<button 
								disabled = {submit_btn_disabled || save_ing || save_success}
								data-submitting = {save_ing}
							  className="btn btn-theme btn-xs space-left"
							  onClick = {this.onSubmit.bind(this)}
							  >提交</button>
						</div>
					</div>
					<AddSpuModal ref='AddSpuModal' 
						{...{searchProducts, list, page_no, total, pri_pd_cates, sec_pd_cates, getCategories, 
							getSecCategories, selected_spu_info, selectProduct, delSelectProduct, regionalism_id, src_id}}/>
				</div>
			)
	}
	onSubmit(){
		var { regionalism_id, src_id, product_name } = this.state;
		var data = {regionalism_id: regionalism_id, src_id, product_name}
		this.props.actions.createGroupbuySKU(data)
			.done( ()=> {
				history.push('/gm/pd');
				Noty('success', '添加成功')
			}.bind(this))
			.fail( (msg, code) => {
				Noty('error', msg || '网络繁忙，请稍后再试');
			})
	}
	add_spu(){
		this.refs.AddSpuModal.show();
	}
	addSize(){
		var price = this.refs.price.value.trim();
		if(!uForm.isNumber(price)){
			Noty('warning', '请填写正确格式的价格')
		}else if(this.state.current_size === SELECT_DEFAULT_VALUE || this.state.current_size === 0){
			Noty('warning', '请选择规格')
		}else{
			this.props.actions.addSize(this.state.current_size, price);			
		}
	}
	delSize(index){
		this.props.actions.delSize(index);
	}
	componentDidMount(){
		LazyLoad('noty');
    	LazyLoad('chinese_py');
    	this.props.actions.resetProduct();
		this.props.actions.getProvincesSignal();
		this.props.actions.getAllSize();
	}
	onSizeChange(e){
		this.setState({current_size: e.target.value})
	}
	onProductNameChange(e){
		this.setState({product_name: e.target.value});
	}
	componentWillReceiveProps(nextProps){
	  var { main } = nextProps;
	  var {selected_spu_info} = main;
	  this.setState({product_name: selected_spu_info.product_name})
	  var {sku_size_list, sku_size_load_success} = main;
	  if(sku_size_load_success && sku_size_list && this.props.main.sku_size_list !== sku_size_list){
	    var list = sku_size_list;
	    var build = function(){
	      var new_data = list.map(function(n){
	      	if(typeof n.text != 'string' ){
	      		n.text = '';
	      	}
	      		n.py = window.makePy(n.text);
	        	return n;
	      })
	      this.setState({
	        sku_size_list: list, filter_sku_size_list: new_data, current_size: new_data.length && new_data[0].text
	      })
	    }.bind(this);

	    if(window.makePy){
	      build();
	    }else{
	      //异步加载的chinese_py库可能还未加载完成，所以需要定时检测
	      this._build_timer = setInterval(() => {
	        if(window.makePy){
	          build();
	          clearInterval(this._build_timer);
	          delete this._build_timer;
	        }
	      }, 100);
	    }
	  }
	}
	filterHandler(e){
	  var { value } = e.target;
	  var { sku_size_list } = this.state;
	  var results = [];
	  value = value.toUpperCase();
	  if(value === ''){
	    results = sku_size_list;
	  }else if(/^\w+$/i.test(value)){ //首字母
	    results = sku_size_list.filter(n => {
	      return n.py.some(m => m.toUpperCase().indexOf(value) == 0)
	    })
	  }else{ //中文全称
	    results = sku_size_list.filter(n => n.text.indexOf(value) != -1)
	  }
	  this.setState({ filter_sku_size_list: results, current_size: results.length && results[0].text });
	}
	onProvinceChange(e){
		var {value} = e.target;
		this.setState({province_id: value})
		this.props.actions.getCitiesSignal({province_id: value, is_standard_area: 0})
		this.props.actions.resetProduct();

	}
	onCityChange(e){
		var {value} = e.target;
		this.setState({regionalism_id: value})
		this.props.actions.resetProduct();
	}
	onSrcChange(e){
		var {value } = e.target;
		this.setState({src_id: value});
		this.props.actions.resetProduct();
	}
}