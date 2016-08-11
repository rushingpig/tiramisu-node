import React, {Component, PropTypes} from 'react';
import { render, findDOMNode } from 'react-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import LinkedStateMixin from 'react-addons-linked-state-mixin';
import { reduxForm } from 'redux-form';

import { Noty } from 'utils/index';
import V from 'utils/acl';

import history from 'history_instance';

import DatePicker from 'common/datepicker';
import Linkers from 'common/linkers';
import SearchInput from 'common/search_input';
import Select from 'common/select';
import { tableLoader, get_table_empty } from 'common/loading';
import StdModal from 'common/std_modal';
import Pagination from 'common/pagination';
import RadioGroup from 'common/radio_group';

class TopHeader extends Component{
	render(){
		return(
			<div className = 'clearfix top-header'>
				{
				  V( 'InvoiceManageAddInvoice' )
				    ? <button className="btn btn-xs btn-theme pull-left" onClick = {this.viewInvoiceApplyModal.bind(this)}>添加发票申请</button>
				    : null
				}
				{
				  V( 'InvoiceManageExportExcel' )
				    ?
				    <button className="btn btn-theme btn-xs pull-right" style={{marginLeft: 20}}>
				      <i className="fa fa-download"></i> 导出
				    </button>
				    :null            
				}				
			</div>
			)
	}
	viewInvoiceApplyModal(){
		this.props.viewInvoiceApplyModal();
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
		var {search_ing, search_by_keywords_ing} = this.state;
/*		var {
			fields:{
				province_id,
				begin_time,
				end_time,
			}
		} = this.props;*/
		return(
			<div className='panel search'>
				<div className='panel-body form-inline'>
					<SearchInput ref='city_name' className='form-inline v-img space-right' placeholder='订单号查询' />
					{' 开始时间'}
					<DatePicker editable className="short-input" />
					{' 结束时间'}
					<DatePicker editable className="short-input space-right" />
					<Select default-text = '请选择省份' className='space-right'/>
					<Select default-text = '请选择市' className='space-right'/>
					<Select default-text = '请选择配送站' className='space-right'/>
					<Select default-text = '开票状态'  className='space-right'/>
					<Select default-text = '订单来源' className='space-right'/>
					<button disabled={search_ing} data-submitting={search_ing} className="btn btn-theme btn-xs">
					  <i className="fa fa-search"></i>{' 查询'}
					</button>
				</div>
			</div>
			)
	}
}
export default class ManagePannel extends Component{
	render(){
		return (
			<div className='order-manage'>
				<TopHeader 
					viewInvoiceApplyModal= {this.viewInvoiceApplyModal.bind(this)} />
				<FilterHeader />
				<div className = 'panel'>
					<header className='panel-heading'>发票列表</header>
					<div className='panel-body'>
						<div ref="table-container" className="table-responsive main-list">
						  <table className="table table-hover text-center">
						  	<thead>
						  		<tr>
						  			<th>管理操作</th>
						  			<th>发票类型</th>
						  			<th>发票抬头</th>
						  			<th>发票金额</th>
						  			<th>发票状态</th>
						  			<th>订单状态</th>
						  			<th>收票人信息</th>
						  			<th>城市</th>
						  			<th>配送站</th>
						  			<th>订单来源</th>
						  			<th>订单号查询</th>
						  			<th>物流追踪</th>
						  			<th>申请人</th>
						  			<th>操作人</th>
						  			<th>操作时间</th>
						  		</tr>
						  	</thead>
						  </table>
						</div>
					</div>
				</div>
				<InvoiceApplyModal ref='InvoiceApplyModal'/>
			</div>
			)
	}
	viewInvoiceApplyModal(){
		this.refs.InvoiceApplyModal.show();
	}
}

class InvoiceApplyModal extends Component{
	render(){
		return(
			<StdModal ref='modal' title='发票申请页面' >
				<div>
					<div className='form-group form-inline'>
						<label>{'　订单号：'}</label>
						<SearchInput className='form-inline v-img space-right' placeholder='搜索要开具发票的订单号' />				
					</div>
					<div className='form-group form-inline'>
						<label>{'发票金额/'}<br />{'流水金额：'}</label>
						￥<input className='form-control input-xs' type='text' readOnly />
					</div>
					<div className='form-group form-inline'>
						<label>{'发票类型：'}</label>
						<label>
						  <input type="radio" 
							 /> 增值税普通发票</label>
						{'　'}
						<label>
						  <input type="radio" 
								/> 增值税专用发票</label> 
					</div>
					
					
					<div className='form-group form-inline'>
						<label>{'发票抬头：'}</label>
						<Select default-text='请选择已审核公司' />
						<input className='form-control input-xs' type='text' placeholder='个人/公司全称' />
					</div>
					<div className='form-group form-inline'>
						<fieldset className='box-wrapper' style={{'border':'1px solid #ddd'}}>
          					<legend style={{'padding':'5px 10px','fontSize':'13','width':'auto','border':'0', marginBottom: 5}}>收票人信息</legend>
          					<div>
          					{'　　　'}<div className='form-group form-inline' style = {{marginBottom: 8}}>
		 						<RadioGroup
		                   			vertical={false}
		 							radios={[
		 								{value: 1, text: '手动输入'},
		 								{value: 2, text: '下单人'},
		 								{value: 3, text: '收货人'},
		 								]}
		 								 />         						
          					</div>
          					<div className='form-group form-inline' style = {{marginBottom: 8}}>
          						<label className='control-label'>{'　　姓名：'}</label>
          						<input type='text' className='form-control input-xs'/>
          						<label>{'　　电话：'}</label>
          						<input type='text'  className='form-control input-xs'/>
          					</div>
          					<div className='form-group form-inline'>
          						
          					</div>
          					<div className='form-group form-inline' style = {{marginBottom: 8, display: 'block'}}>
          						<label>{'　　地址：'}</label>
          						<input type = 'checkbox' /><label>{'启用收货人地址'}</label>        						
          					</div>
          					
          					<div className='form-group form-inline' style = {{marginBottom: 8}}>
        						{'　　　　　'}<Select ref="province" default-text="--选择省份--" className="form-select" />{' '}
        						<Select ref="city"  default-text="--城市--" />{' '}
        						<Select ref="district"  default-text="--区/县--" />{' '}
          					</div>
          					<div className='form-group form-inline' style = {{marginBottom: 8}}>
        						{'　　　　　'}<input ref="recipient_address" className='form-control input-xs'  style={{width: 280}} type="text" placeholder='详细地址：小区、楼栋、门牌号'/>
          					</div>	
          					</div>

						</fieldset>
					</div>
				</div>
			</StdModal>
			)
	}
	show(){
		this.refs.modal.show();
	}
}