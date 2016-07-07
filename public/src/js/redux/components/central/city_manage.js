import React, {Component, PropTypes} from 'react';
import { render, findDOMNode } from 'react-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import LinkedStateMixin from 'react-addons-linked-state-mixin';
import { reduxForm } from 'redux-form';

import { Noty } from 'utils/index';
import V from 'utils/acl';

import history from 'history_instance';

import Linkers from 'common/linkers';
import SearchInput from 'common/search_input';
import Select from 'common/select';
import { tableLoader, get_table_empty } from 'common/loading';
import StdModal from 'common/std_modal';
import Pagination from 'common/pagination';

import * as CityManageActions from 'actions/city_manage';

import { SELECT_DEFAULT_VALUE } from 'config/app.config';

class TopHeader extends Component{
	render(){
		return(
			<div className='clearfix top-header'>
				<Linkers
				 data={['城市管理','开通城市列表']}
				 active = '开通城市列表'
				 className = 'pull-left'
				 />
				 {
				   V( 'CityManageAddCity' )
				     ? <button onClick={this.addCity.bind(this)} className="btn btn-xs btn-theme pull-right">新增城市</button>
				     : null
				 }
				 {
				   V( 'CityManageExportExcel' )
				     ?
				     <button className="btn btn-theme btn-xs pull-right space-right" style={{marginLeft: 20}}>
				       <i className="fa fa-download"></i> 导出
				     </button>
				     :null            
				 }
			</div>
			)
	}
	addCity(){
		history.push('/cm/city/add');
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
		var {search_ing, search_by_keywords_ing } = this.state;
		var {
				fields:{
					city_name,
					province_id,
					is_county,
					exist_second_order_time,
				},
				provinces,
			} = this.props;
		return(
			<div className='panel search'>
				<div className='panel-body form-inline'>
					<SearchInput searchHandler={this.search.bind(this, 'search_by_keywords_ing')} {...city_name} ref='city_name' className='form-inline v-img space-right' placeholder='城市名称' />
					{
						V('CityManageProvince') &&
						<Select {...province_id} ref='province' default-text = '请选择省份' className='space-right' options = {provinces}/>
					}
					<select {...is_county} ref='is_county' className='form-control input-xs space-right'>
						<option value={SELECT_DEFAULT_VALUE}>是否县级市</option>
						<option value={1}>县级市</option>
						<option value={0}>地级市</option>
					</select>
					<select {...exist_second_order_time} ref='has_sec_order_time' className='form-control input-xs space-right'>
						<option value={SELECT_DEFAULT_VALUE}>是否有第二次预约时间</option>
						<option value={1}>是</option>
						<option value={0}>否</option>
					</select>
					<button className="btn btn-theme btn-xs" disabled={search_ing} data-submitting={search_ing} onClick={this.search.bind(this, 'search_ing')}>
					  <i className="fa fa-search"></i>{' 搜索'}
					</button>
				</div>
			</div>
			)
	}

	componentDidMount(){
		this.props.getProvincesSignal('authority');
	}
	search(search_in_state){
		this.setState({[search_in_state]: true});
		this.props.getAccessibleCityList({page_size:this.props.page_size, page_no: 0})
			.always(() =>
				{this.setState({[search_in_state]: false})}
			)
	}
}

FilterHeader = reduxForm({
	form: 'accessible_cities_filter',
	fields: [
		'city_name',
		'province_id',
		'is_county',
		'exist_second_order_time',
	],
   destroyOnUnmount: false,
})(FilterHeader)

var CityRow = React.createClass({
	render(){
		var {props} = this;
		return(
			<tr>
				<td>{props.city_name}</td>
				<td>{props.province_name}</td>
				<td>{props.is_county ? '县级市': '地级市'}</td>
				<td>{props.delivery_time_range}</td>
				<td>{(parseFloat(props.order_time/60))}</td>
				<td>{props.has_sec_order_time?'是': '否'}</td>
				<td>{props.has_sec_order_time ? props.sec_order_regions_txt: '/'}</td>
				<td>{props.has_sec_order_time ? (parseFloat(props.sec_order_time)/60): '/'}</td>
				<td>{props.online_time}</td>
				<td>
					{
					[V('CityManageSEO') && 
					<a className='space-right' href='javascript:;'  key='CityManageSEO' onClick={this.showSEOModal}>[SEO]</a>,
					V('CityManageView') &&
					<a className='space-right' href='javascript:;' key='CityManageView' onClick={this.showViewModal}>[查看]</a>,
					V('CityManageEdit')&&
					<a className='space-right' href='javascript:;' key='CityManageEdit' onClick={this.eidtHandler}>[编辑]</a>,
					V('CityManageWebControl') &&
					<a className='space-right' href='javascript:;' key='CityManageWebControl'>[官网控制]</a>,
					V('CityManageDelete') && 
					<a className='space-right' href='javascript:;' key='CityManageDelete' onClick={this.showDeleteModal}>[删除]</a>]
					}
				</td>
			</tr>
			)
	},
	showSEOModal(){
		this.props.showSEOModal(this.props.city_id);
	},
	showViewModal(){
		this.props.showViewModal(this.props.city_id);
	},
	showDeleteModal(){
		this.props.showDeleteModal(this.props.city_id, this.props.city_name);
	},
	eidtHandler(){
    	history.push('/cm/city/' + this.props.city_id);
	}
})

class CityPanel extends Component{
	constructor(props){
		super(props);
		this.state ={
			page_size: 10
		}
	}
	render(){
		var {getProvincesSignal, getAccessibleCityList, getAccessibleCityDetail, updateAccessibleCity, DeleteAccessibleCity} = this.props.actions;
		var {provinces, accessible_cities, loading, refresh, accessible_city_info, submit_ing, total_count, page_no} = this.props;
		var SEO = accessible_city_info.SEO || '';
		var content = accessible_cities.map( m => {
			var has_sec_order_time =m.open_regionalisms && m.open_regionalisms.length >0 ? true: false;
			var sec_order_regions =[];
			var sec_order_regions_txt =''
			if(has_sec_order_time){
				sec_order_regions = m.open_regionalisms.filter( n => n.order_time != undefined);
				if(sec_order_regions.length <= 0){
					has_sec_order_time = false;
				}else{
					sec_order_regions.forEach( n => {
						sec_order_regions_txt = n.regionalism_name + '/' + sec_order_regions_txt;
						m.sec_order_regions_txt = sec_order_regions_txt.substring(0, sec_order_regions_txt.length - 1);
						m.sec_order_time = sec_order_regions[0].order_time;
					})
				}
			}
			m.has_sec_order_time = has_sec_order_time;
			return <CityRow key = {m.city_id} {...m}
						showSEOModal = {this.showSEOModal.bind(this)}
						showViewModal = {this.showViewModal.bind(this)}
						showDeleteModal = {this.showDeleteModal.bind(this)}
					/>;
		})
		return(
			<div className='city-manage'>
				<TopHeader/>
				<FilterHeader  {...{ provinces,page_size: this.state.page_size}}
					getProvincesSignal = {getProvincesSignal}
					getAccessibleCityList = {getAccessibleCityList}/>
				<div className='panel'>
          			<header className="panel-heading">开通城市列表</header>
          			<div className='panel-body'>
          				<div ref='table-container' className='table-responsive main-list'>
          					<table className='table table-hover text-center'>
          						<thead>
          							<tr>
          								<th>城市</th>
          								<th>省份</th>
          								<th>是否县级市</th>
          								<th>配送时间段</th>
          								<th>预约时间(小时)</th>
          								<th>是否第二预约时间</th>
          								<th>第二预约区域</th>
          								<th>第二预约时间</th>
          								<th>官网上线时间</th>
          								<th>操作</th>
          							</tr>
          						</thead>
          						<tbody>
                  					{ tableLoader( loading || refresh, content ) }
          						</tbody>
          					</table>
          				</div>
          			</div>
				</div>
				<Pagination 
				  page_no={page_no} 
				  total_count={total_count} 
				  page_size={this.state.page_size} 
				  onPageChange={this.onPageChange.bind(this)}
				/>
				<SEOModal ref='seo' SEO = {SEO} submit_ing={submit_ing} 
						getAccessibleCityDetail ={getAccessibleCityDetail}
						updateAccessibleCity = {updateAccessibleCity}/>
				<ViewModal ref='view' accessible_city_info={accessible_city_info}
						getAccessibleCityDetail ={getAccessibleCityDetail}
						/>
				<DeleteModal ref='delete' 
						DeleteAccessibleCity = {DeleteAccessibleCity}
						page_size = {this.state.page_size}
						page_no = {page_no}
						total_count = {total_count}
						getAccessibleCityList = {getAccessibleCityList}
				   		/>
			</div>
			)
	}

	showSEOModal(city_id){
    	LazyLoad('noty');
		this.refs.seo.show(city_id);
	}
	showViewModal(city_id){
		this.refs.view.show(city_id);
	}
	showDeleteModal(city_id, city_name){
    	LazyLoad('noty');		
		this.refs.delete.show(city_id, city_name);
	}
	componentDidMount(){
		this.props.actions.getAccessibleCityList({page_no: 0, page_size: this.state.page_size});
	}
	onPageChange(page){
    	page = typeof page == 'undefined' ? this.props.accessible_cities.page_no : page;
		this.props.actions.getAccessibleCityList({page_no: page, page_size: this.state.page_size});
	}
}

class SEOModal extends Component{
	constructor(props){
		super(props);
		this.state = {SEO:'', city_id: -1}
	}
	render(){
		return(
			<StdModal title='SEO' ref='viewSEOModal' onConfirm={this.onConfirm.bind(this)}>
				<div className='form-inline'>
					<label className='control-form space-right'>链接&渠道</label>
					<textarea ref='seoTextarea' className='form-control input-lg' style={{width:'100%',height:200}} value={this.state.SEO} 
						onChange = {this.seoChange.bind(this)}/>
				</div>
			</StdModal>
			)
	}
	show(city_id){
		this.setState({city_id});
		this.props.getAccessibleCityDetail(city_id);
		this.refs.viewSEOModal.show();
	}
	componentWillReceiveProps(nextProps){
		var {SEO} = nextProps;
		this.setState({SEO});
	}
	seoChange(e){
		this.setState({SEO: e.target.value})
	}
	onConfirm(){
		var { SEO, city_id} = this.state;
		var _this = this;
		this.props.updateAccessibleCity({SEO, city_id})
			.done(function(){
        		Noty('success', '保存成功');
        		_this.refs.viewSEOModal.hide();
			})
			.fail(function(msg, code){
        		Noty('error', msg || '网络繁忙，请稍后再试');
			})
	}
}

class ViewModal extends Component{

	render(){
		var info = this.props.accessible_city_info;
		info.manager_name = info.manager_name == null ? '' : info.manager_name;
		info.manager_mobile = info.manager_mobile == null ? '' : info.manager_mobile;
		var has_sec_order_time = info && info.second_order_regionalisms && info.second_order_regionalisms.length > 0 ? true : false;
		var regionalisms_name = '';
		var sec_regionalisms_name = '';
		var {regionalisms} = info;
		if(regionalisms != undefined){
			regionalisms.filter( m => m.is_open == 1).forEach( m => {
				regionalisms_name = m.regionalism_name + ' ' + regionalisms_name
				if( m.order_time != undefined){
					sec_regionalisms_name = m.regionalism_name + ' ' + sec_regionalisms_name;
				}
			})
		}
		return(
			<StdModal title='城市信息' ref='viewModal' footer = {false}>
				<div className='form-inline'>
					<label className='control-form'>{'　　　　　城市名称：'}</label>
					<span className='gray'>{info.area}</span>
				</div>
				<div className='form-inline'>
					<label className='control-form'>{'　　　　　城市级别：'}</label>
					<span className='gray'>{info.is_county ? '县级市': '地级市'}</span>
				</div>				
				{info.is_county == 0 && <div className='form-inline'>
					<label className='control-form'>{'　　　　　开通区域：'}</label>
					<span className='gray'>{regionalisms_name}</span>
				</div>}
				<div className='form-inline'>
					<label className='control-form'>{'　　　　配送时间段：'}</label>
					<span className='gray'>{info.delivery_time_range}</span>
				</div>
				<div className='form-inline'>
					<label className='control-form'>{'　　　　　预约时间：'}</label>
					<span className='gray'>{info.order_time + '小时'}</span>
				</div>
				{
					has_sec_order_time ?
					/*<div className='form-inline'>
						<label className='control-form'>{'是否有第二预约时间：'}</label>
						<label className=''>{has_sec_order_time ? '是' : '否'}</label>
					</div>*/
					<div className='form-inline'>
						<label className='control-form'>{'第二次预约区域/时间：'}</label>
						<span className='gray'>{sec_regionalisms_name + '　' + info.second_order_time / 60 + '小时'}</span>
					</div>:
					null
				}
				<div className='form-inline'>
					<label className='control-form'>{'　　　官网上线时间：'}</label>
					<span className='gray'>{info.online_time}</span>
				</div>				
				<div className='form-inline'>
					<label className='control-form'>{info.is_county? '是否支持地级市选择订单：': '是否支持县级市选择订单：'}</label>
					<span className='gray'>{info.is_diversion? '是':'否'}</span>
				</div>				
				<div className='form-inline'>
					<label className='control-form'>{'　　　　　城市经理：'}</label>
					<span className='gray'>{info.manager_name + ' ' + info.manager_mobile}</span>
				</div>
				<div className='form-inline'>
					<label className='control-form'>{'　　　　　　　备注：'}</label>
					<span className='gray'>{info.remarks}</span>
				</div>
				<hr />
				<div className='form-group pull-right'>
				  <button className="btn btn-theme btn-sm space-right" onClick={this.hide.bind(this)}>关闭</button>           
				</div>
			</StdModal>
			)
	}
	show(city_id){
		var _this = this;
		this.props.getAccessibleCityDetail(city_id)
			.done(function(){
				_this.refs.viewModal.show();
			})
	}
	hide(){
		this.refs.viewModal.hide();
	}
}
class DeleteModal extends Component{
	constructor(props){
		super(props);
		this.state = {
			city_name: '',
			city_id: -1,
		}
	}
	render(){
		return(
			<StdModal title='删除城市' ref='deleteModal' onConfirm={this.onConfirm.bind(this)}>
				<div>
					<span>你将删除城市 </span> <span style={{padding : '2px 5px', borderRadius:'5px 5px'}} className=' bordered bg-warning'>{this.state.city_name}</span><br />
					<span>请确认是否删除城市，删除后所有信息将不可恢复</span>
				</div>
			</StdModal>
			)
	}
	show(city_id, city_name){
		this.setState({city_id, city_name})
		this.refs.deleteModal.show();
	}
	onConfirm(){
		this.props.DeleteAccessibleCity(this.state.city_id);
		setTimeout(() => {
		  this.refs.deleteModal.hide();
		  var {page_no, page_size,total_count, getAccessibleCityList} = this.props;
		  if( total_count % page_size == 0 && total_count != 0) {
		  	page_no -= 1;
		  	getAccessibleCityList({page_no: page_no, page_size: page_size});
		  }
		},500);
	}
}


function mapStateToProps(state){
  return state.accessibleCityManage;
}

function mapDispatchToProps(dispatch){
  return {
    actions:bindActionCreators({
      ...CityManageActions,
    },dispatch)};
}

export default connect(mapStateToProps, mapDispatchToProps)(CityPanel);
