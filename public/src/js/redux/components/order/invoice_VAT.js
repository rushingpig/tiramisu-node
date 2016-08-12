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
				  V( 'InvoiceVATManageAddInvoice' )
				    ? <button onClick = {this.viewCompanyModal.bind(this)} className="btn btn-xs btn-theme pull-left">添加公司资料</button>
				    : null
				}
				{
				  V( 'InvoiceVATManageExportExcel' )
				    ?
				    <button className="btn btn-theme btn-xs pull-right" style={{marginLeft: 20}}>
				      <i className="fa fa-download"></i> 导出
				    </button>
				    :null            
				}				
			</div>
			)
	}
	viewCompanyModal(){
		this.props.viewCompanyModal();
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
		return (
			<div className = 'panel search'>
				<div className = 'panel-body form-inline'>
					<SearchInput placeholder = '公司名' className='form-inline v-img space-right'/>
					<Select default-text = '资料审核状态' />
					<button disabled={search_ing} data-submitting={search_ing} className="btn btn-theme btn-xs space-left">
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
			<div>
				<TopHeader viewCompanyModal = {this.viewCompanyModal.bind(this)}/>
				<FilterHeader />
				<div className = 'panel'>
					<header className='panel-heading'>发票抬头公司列表</header>
					<div className = 'panel-body'>
						<div ref="table-container" className="table-responsive main-list">
						  	<table className="table table-hover text-center">
						  		<thead>
						  			<tr>
						  				<th>管理操作</th>
						  				<th>公司编号</th>
						  				<th>公司名称</th>
						  				<th>{'纳税人识别号/'}<br />{'社会信用代码'}</th>
						  				<th>公司注册地址</th>
						  				<th>公司注册电话</th>
						  				<th>开户银行名称</th>
						  				<th>开户银行账号</th>
						  				<th>资质证书照片</th>
						  				<th>资料审核状态</th>
						  				<th>公司开票历史记录</th>
						  				<th>添加人</th>
						  				<th>操作人</th>
						  				<th>操作时间</th>
						  			</tr>
						  		</thead>
						  	</table>
						</div>
					</div>
				</div>
				<CompanyModal ref='CompanyModal'/>
			</div>
			
			)
	}
	viewCompanyModal(){
		this.refs.CompanyModal.show();
	}
} 

class CompanyModal extends Component{
	render(){
		return (
			<StdModal ref = 'modal' title = '添加公司资料页面'>
				<div className='form-group form-inline'>
					<label>{'　　公司名称：'}</label>
					<input type = 'text' className= 'form-control input-xs'/>
				</div>
				<div className='form-group form-inline'>
					<label>{'纳税人识别号/'}<br />{'社会信用代码：'}</label>
					<input type='text' className='form-control input-xs' />
				</div>
				<div className='form-group form-inline'>
					<label>{'公司注册地址：'}</label>
					<input type = 'text' className= 'form-control input-xs'/>
				</div>
				<div className='form-group form-inline'>
					<label>{'公司注册电话：'}</label>
					<input type = 'text' className= 'form-control input-xs'/>
				</div>
				<div className='form-group form-inline'>
					<label>{'开户银行名称：'}</label>
					<input type = 'text' className= 'form-control input-xs'/>
				</div>
				<div className='form-group form-inline'>
					<label>{'开户银行账号：'}</label>
					<input type = 'text' className= 'form-control input-xs'/>
				</div>
				<div className='form-group form-inline'>
					<label>{'资质证书照片：'}</label>

				</div>
			</StdModal>
			)
	}
	show(){
		this.refs.modal.show();
	}
}