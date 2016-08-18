import React, {Component, PropTypes} from 'react';
import { render, findDOMNode } from 'react-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import LinkedStateMixin from 'react-addons-linked-state-mixin';
import { reduxForm } from 'redux-form';

import { Noty, del } from 'utils/index';
import V from 'utils/acl';
import { SELECT_DEFAULT_VALUE  } from 'config/app.config';

import history from 'history_instance';

import DatePicker from 'common/datepicker';
import Linkers from 'common/linkers';
import SearchInput from 'common/search_input';
import Select from 'common/select';
import { tableLoader, get_table_empty } from 'common/loading';
import StdModal from 'common/std_modal';
import Pagination from 'common/pagination';
import RadioGroup from 'common/radio_group';
import ProgressBar from 'common/progress_bar';
import LazyLoad from 'utils/lazy_load';

import * as invoiceVATActions from 'actions/order/invoice_VAT';

import OperationRecordModal from './invoice_company_operation_record.js';
import InvoiceRecordModal from './invoice_record.js';

class TopHeader extends Component{
	render(){
		return(
			<div className = 'clearfix top-header'>
				{
				  V( 'InvoiceVATManageAddInvoice' )
				    ? <button onClick = {this.viewCompanyCreateModal.bind(this)} className="btn btn-xs btn-theme pull-left">添加公司资料</button>
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
	viewCompanyCreateModal(){
		this.props.viewCompanyCreateModal();
	}
}

class FilterHeader extends Component{
	constructor(props){
		super(props);
		this.state = {
			search_ing: false,
		}
	}
	render(){
		var {search_ing} = this.state;
		var { all_invoice_status } = this.props;
		return (
			<div className = 'panel search'>
				<div className = 'panel-body form-inline'>
					<input ref = 'company_name' placeholder = '公司名' className='form-control input-xs space-right'/>
					<Select ref='status' default-text = '资料审核状态' options = {all_invoice_status}/>
					<button disabled={search_ing} data-submitting={search_ing} 
						className="btn btn-theme btn-xs space-left"
						onClick = {this.search.bind(this)} >
					  <i className="fa fa-search"></i>{' 查询'}
					</button>
				</div>
			</div>
			)
	}
	search(){
	  this.setState({search_ing: true});
	  var name = '';
	  var status = '';
	  var data = {page_no: 0, page_size: this.props.page_size}
	  if(!this.refs.company_name){
	  	name = this.refs.company_name.value.trim();
	  }
	  if(!this.refs.status){
	  	var statusSelect = $(findDOMNode(this.refs.status));
	  	if(statusSelect[0].value != SELECT_DEFAULT_VALUE){
	  		status = statusSelect[0].value.trim();
	  	}
	  }
	  if( name != ''){
	  	data.name = name;
	  }
	  if(status != ''){
	  	data.status = status;
	  }
	  this.props.actions.getCompanyList(data)
	    .always(()=>{
	      this.setState({search_ing: false});
	    });
	}
}

var CompanyRow = React.createClass({
	render(){
		var {props} = this;
		return(
			<tr>
				<td>
					{
						V('InvoiceVATManageReview') && props.status == 'UNREVIEWED' ?
						[<a key='companyReview' href='javascript:;'>[审核]</a>,<br key='review_br'/>]
						: null
					}
					{
						V('InvoiceVATManageEdit')
						?
						[<a key='edit_a' onClick = {this.reviewCompany} key='companyEdit' href='javascript:;' onClick = {this.viewCompanyEditModal}>[编辑]</a>,
						<br key = 'edit_br'/>]
						:null
					}
					{
						V('InvoiceVATManageDel')
						?
						<a onClick = {this.delCompany} key='companyDel' >[删除]</a>
						: null
					}
				</td>
				<td>
					{props.id}
				</td>
				<td>
					{props.name}
				</td>
				<td>
					{props.code}
				</td>
				<td>
					{props.add}
				</td>
				<td>
					{props.tel}
				</td>
				<td>
					{props.bank_name}
				</td>
				<td>
					{props.bank_account}
				</td>
				<td>
				{
					props.img_1 && props.img_1 != '' &&
					[<a onClick = { this.props.viewImg.bind(null,{url: props.img_1, name: '营业执照'} )} href='javascript:;' key='img1_a'>营业执照</a>,<br key='img1_br'/>]
				}
				{
					props.img_2 && props.img_2 != '' &&
					[<a onClick = { this.props.viewImg.bind(null, {url: props.img_2, name: '税务登记证'})} href='javascript:;' key='img2_a'>税务登记证</a>,<br key='img2_br'/>]
				}
				{
					props.img_3 && props.img_3 != '' &&
					[<a onClick = { this.props.viewImg.bind(null, {url: props.img_3, name: '纳税人资格证'})} href='javascript:;' key='img3_a'>纳税人资格证</a>,<br key='img3_br'/>]
				}
				{
					props.img_4 && props.img_4 != '' &&
					[<a onClick = { this.props.viewImg.bind(null, {url: props.img_4, name: '银行开户许可证'})} href='javascript:;' key='img4_a'>银行开户许可证</a>,<br key='img4_br'/>]
				}
				</td>
				<td>
					{props.status == 'UNREVIEWED' ? '未审核' : '已审核'}
				</td>
				<td>
					{
						props.order_id && props != '' ?
						<a href='javascript:;' onClick = {this.viewInvoiceRecordModal}>{props.order_id}</a>
						: '无'
					}
				</td>
				<td>
					{props.created_by}<br />
					{props.created_time}
				</td>
				<td>
					{props.updated_by}<br />
				</td>
				<td>
					<a href='javascript:;' onClick = {this.viewOperationRecordModal}>{props.updated_time}</a>
				</td>
			</tr>
			)
	},
	viewCompanyEditModal(){
		this.props.activeCompany(this.props.id)
		this.props.viewCompanyEditModal(this.props.id);
	},
	viewOperationRecordModal(){
		this.props.viewOperationRecordModal({id: this.props.id, name: this.props.name})
	},
	viewInvoiceRecordModal(){
		this.props.viewInvoiceRecordModal({id: this.props.id, name: this.props.name})
	},
	reviewCompany(){
		this.props.reviewCompanyInfo(this.props.id)
			.done(()=>{
				Noty('success', '审核成功');
			})
	},
	delCompany(){
		this.props.companyDel(this.props.id)
			.done( () => {
				Noty('success', '删除成功');
			})
	},

})

function ViewModal(props){
  var style={
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    background: 'rgba(0, 0, 0, 0.72)',
    zIndex: 10000,
    color: '#fff',
  }
  var closeBtnStyle = {
    position: 'absolute',
    right: 0,
    width: 100,
    height: 100,
    lineHeight: '100px',
    background: 'rgba(0, 0, 0, 0.59)',
    borderRadius: '50%',
    transform: 'translate3d(48%, -50%, 0px)',
  };
  return (
    <div style={style} className="animated fadeIn">
      <div onClick={props.actions.viewImg.bind(null, null)} className="pointer hover-effect" style={closeBtnStyle}>
        <i style={{margin: '62px 0 0 24%'}} className="fa fa-lg fa-times"></i>
      </div>
      <center style={{height: '100%'}}>
        <div style={{marginTop: '10%', verticalAlign: 'top'}}>
          <img style={{maxHeight: '80vh', maxWidth: '80vw'}} src={props.domain + props.url} alt="加载失败" />
          <div className="inline-block text-left v-top" style={{paddingLeft: 31, maxWidth: '20vw', boxSizing: 'border-box'}}>
            <div className="font-lg">{props.name}</div>
            <h5>{props.size}</h5>
            <a href={props.domain + props.url} download={props.name} style={{color: 'inherit'}}>
              <i className="hover-effect pointer fa fa-lg fa-cloud-download"></i>
            </a>
          </div>
        </div>
      </center>
    </div>
  )
}


class ManagePannel extends Component{
	constructor(props){
		super(props);
		this.state = {
			page_size: 10
		}
	}
	render(){
		var { main: {list, total, page_no, refresh, loading, view_img, all_invoice_status, active_company_info}, operationRecord, invoiceRecord,
			getCompanyOptRecord, resetCompanyOptRecord, getCompanyInvoiceRecord, resetCompanyInvoiceRecord,
			editCompany, createCompany} = this.props;
		var content = list.map( m => {
			return (
				<CompanyRow {...{...m, ...this.props}} key = {m.id}
					viewCompanyEditModal = {this.viewCompanyEditModal.bind(this)}
					viewOperationRecordModal = {this.viewOperationRecordModal.bind(this)}
					viewInvoiceRecordModal = {this.viewInvoiceRecordModal.bind(this)}
				/>
				)
		})
		return (
			<div>
				<TopHeader viewCompanyCreateModal = {this.viewCompanyCreateModal.bind(this)}/>
				<FilterHeader all_invoice_status = {all_invoice_status }/>
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
						  		<tbody>
                					{ 
                						tableLoader( loading || refresh, content ) 
                					}
						  		</tbody>
						  	</table>
						</div>
						<Pagination 
						  page_no={page_no} 
						  total_count={total} 
						  page_size={this.state.page_size} 
						  onPageChange={this.onPageChange.bind(this)}
						/>
					</div>
				</div>
				<OperationRecordModal ref='viewOperationRecord' {...{getCompanyOptRecord, resetCompanyOptRecord, ...operationRecord}}/>
				<InvoiceRecordModal ref = 'viewInvoiceRecordModal' {...{getCompanyInvoiceRecord, resetCompanyInvoiceRecord , ...invoiceRecord}} />
				<CompanyModal createCompany = {createCompany} viewImg = {this.props.viewImg} ref='CompanyCreateModal' editable = {false}/>
				<CompanyModal active_company_info = {active_company_info} editCompany = {editCompany} viewImg = {this.props.viewImg} ref = 'CompanyEditModal' editable = {true}/>
				{
					view_img
					?
					<ViewModal {...view_img} domain = 'http://qn.blissmall.net/' actions = {this.props} />
					:null
				}
			</div>
			
			)
	}
	viewCompanyCreateModal(){
		this.refs.CompanyCreateModal.show();
	}
	viewCompanyEditModal(id){
		this.refs.CompanyEditModal.show(id);
	}
	viewOperationRecordModal(data){
		this.refs.viewOperationRecord.show(data)
	}
	viewInvoiceRecordModal(data){
		this.refs.viewInvoiceRecordModal.show(data);
	}
	componentDidMount(){
		LazyLoad('noty');
		this.search();
	}
	search(page){
	  //搜索数据，无需loading图
	  page = typeof page == 'undefined' ? this.props.page_no : page;
	  return this.props.getCompanyList({page_no: page, page_size: this.state.page_size});
	}
	onPageChange(page){
		var unlock = dom.lock(this.refs['table-container']);
		this.search(page).done(unlock);
	}
} 

class ProgressRow extends Component {
  render(){
    return (
      <div className="col-lg-4 col-md-6 col-sm-6">
        <div className={`${this.props.percent == 100 ? 'text-success' : 'theme'} mg-4`}>{this.props.name}</div>
        <ProgressBar percent={this.props.percent} />
      </div>
    )
  }
}

class CompanyModal extends Component{
	constructor(props){
		super(props);
		this.state = {
			id: '',
		}
	}
	render(){
		var title = this.props.editable ? '编辑公司资料页面': '添加公司资料页面';
		return (
			<StdModal ref = 'modal' title = {title} footer={false}>
				<CompanyInfo {...this.props}
					company_id = {this.state.id}
					hide = {this.hide.bind(this)}
					/>
			</StdModal>
			)
	}
	show(id){
		if(this.props.editable){
			this.setState({id: id})
		}
		this.refs.modal.show();
	}
	hide(){
		this.refs.modal.hide();
	}
}

const validate = (values, props) => {
	const errors = {};
	var msg = 'error'
	var {form} = props;

	function _v_text(key){
	  if(form[key] && form[key].touched && (values[key] === undefined || values[key].trim() == '')){
	    errors[key] = msg;
	  }
	}

	_v_text('name');
	_v_text('tel');
	_v_text('code');
	_v_text('add');
	_v_text('bank_name');
	_v_text('bank_account');
	return errors;
}
class CompanyInfo extends Component{
	constructor(props){
		super(props);
		this.state = {
			progressBars: [],
			img_1: '',
			img_2: '',
			img_3: '',
			img_4: '',
			current_upload_img: 1,
		}
	}
	render(){
		var {
			fields: {
				name,
				tel,
				code,
				add,
				bank_name,
				bank_account,
			},
			editable,
			company_id,
			handleSubmit,
		} = this.props;
		var progressList = this.state.progressBars.map( n => {
		      return <ProgressRow ref={n.key} key={n.key} name={n.name} percent={n.percent} />;
		    });
		var widthStyle =  { width: 340}
		var {img_1, img_2, img_3, img_4} = this.state;
		return(
			<div>
				{
					editable ?
					<div className = 'form-group form-inline'>
						<label key='company_no_lbl'>{'　　公司编号：'}</label>
						<input key= 'company_no_txt' readOnly value = {company_id} type = 'text' className = {`form-control input-xs ${company_id.error}`} />
					</div>					
					: null
				}
								
				<div className='form-group form-inline'>
					<label>{'　　公司名称：'}</label>
					<input {...name} type = 'text' style = {widthStyle} className= {`form-control input-xs ${name.error}`}/>

				</div>
				<div className='form-group form-inline'>
					<label>{'纳税人识别号/'}<br />{'社会信用代码：'}</label>
					<input  {...code} style = {widthStyle}  type='text' className={`form-control input-xs ${code.error}`} />
				</div>
				<div className='form-group form-inline'>
					<label>{'公司注册地址：'}</label>
					<input {...add} style = {widthStyle}  type = 'text' className= {`form-control input-xs ${add.error}`}/>
				</div>
				<div className='form-group form-inline'>
					<label>{'公司注册电话：'}</label>
					<input {...tel} style = {widthStyle}  type = 'text' className= {`form-control input-xs ${tel.error}`}/>
				</div>
				<div className='form-group form-inline'>
					<label>{'开户银行名称：'}</label>
					<input {...bank_name} style = {widthStyle}  type = 'text' className= {`form-control input-xs ${bank_name.error}`}/>
				</div>
				<div className='form-group form-inline'>
					<label>{'开户银行账号：'}</label>
					<input {...bank_account} style = {widthStyle}  type = 'text' className= {`form-control input-xs ${bank_account.error}`}/>
				</div>
				<div className='form-group form-inline'>
					<label>{'资质证书照片：'}</label>
					<button id='uploadFileBtn' className="btn btn-theme btn-xs">
		              <i className="fa fa-cloud-upload"></i> 上传
		              <span style={{marginLeft: 5}}></span>
		            </button>
					{/*<a id='uploadFileBtn' >上传图片</a>*/}
				</div>
				<div className = 'form-group form-inline'>
					<label>{'当前上传图片：'}</label>
					<RadioGroup
						onChange = {this.onCurrentImgChange.bind(this)}
						className = 'inline-block'
						value = {this.state.current_upload_img}
						radios = {
							[
							{value: 1, text: '营业执照'},
							{value: 2, text: '税务登记证'},
							{value: 3, text: '纳税人资格证'},
							{value: 4, text: '银行开户许可证'},
							]
						}
					/>
				</div>
				<div className = 'form-group form-inline'>
					{
						img_1 != ''
						?
						<a onClick = { this.props.viewImg.bind(null, {url: img_1, name: '营业执照'})} href = 'javascript:;'>
							{'　　'}<i className = 'fa fa-lg fa-file-image-o space-right'></i>
							<span>营业执照</span>
						</a>
						:null
					}
					{
						img_2 != ''
						?
						<a onClick = { this.props.viewImg.bind(null, {url: img_2, name: '税务登记证'})} href = 'javascript:;'>
							{'　　'}<i className = 'fa fa-lg fa-file-image-o space-right'></i>
							<span>税务登记证</span>
						</a>
						:null
					}
					{
						img_3 != ''
						?
						<a onClick = { this.props.viewImg.bind(null, {url: img_3, name: '纳税人资格证'})} href = 'javascript:;'>
							{'　　'}<i className = 'fa fa-lg fa-file-image-o space-right'></i>
							<span>纳税人资格证</span>
						</a>
						:null
					}
					{
						img_4 != ''
						?
						<a onClick = { this.props.viewImg.bind(null, {url: img_4, name: '银行开户许可证'})} href = 'javascript:;'>
							{'　　'}<i className = 'fa fa-lg fa-file-image-o space-right'></i>
							<span>银行开户许可证</span>
						</a>
						:null
					}
				</div>

				{
					progressList.length
					?[
						<hr key = 'hr' />,
						<div className="row" key="progressBars" style={{maxHeight: '171px', overflowY: 'auto'}}>
	                		{ progressList }
	              		</div>
					]
					:null
				}
				<div className='pull-right'>
				<button
					onClick = {this.onCancel.bind(this)}
				    key="cancelBtn"
				    className="btn btn-default btn-xs space-right">取消</button>
				{
					editable?
					<button 
					  className="btn btn-theme btn-xs space-left"
					  onClick = {handleSubmit(this._check.bind(this, this.handleEditCompany))}
					  >提交</button>
					:
					<button 
				  className="btn btn-theme btn-xs space-left"
			    	onClick = {handleSubmit(this._check.bind(this, this.handleCreateCompany))}
				  >提交</button>
				}
				</div>				
			</div>
			)
	}
	_check(callback,form_data){
	  setTimeout(()=>{
	      var {errors} =this.props;
	      var { img_1 , img_2, img_3, img_4} = this.state;
	      if(!Object.keys(errors).length){
	      	if( img_1 == '' || img_2 == '' || img_3 == '' || img_4 == ''){
	      		Noty('warning', '请上传所有图片凭证');
	      	}else{
	        	callback.call(this,{...form_data, img_1, img_2, img_3, img_4});  //以callback来代替this 调用	      		
	      	}
	      }else{
	        Noty('warning','请填写完整');
	      }
	  },0);
	}
	componentDidMount(){
		var {editable , active_company_info ,} = this.props;
		if(editable){
			this.setState({
				img_1: active_company_info.img_1,
				img_2: active_company_info.img_2,
				img_3: active_company_info.img_3,
				img_4: active_company_info.img_4,
			})
		}
		var uploaderOptions = this.getUploaderOptions();
		LazyLoad('qiniu', () => {
			var fileUploader = Qiniu.uploader({
				...uploaderOptions,
				browse_button: 'uploadFileBtn',
				init: {
					'FilesAdded': (up, files) => {
					  this.setState( state => {
					    state.progressBars = state.progressBars.concat(
					      ...files.map( file => ({
					        key: file.id,
					        name: file.name,
					        percent: 0
					      }))
					    )
					    return state;
					  })
					  fileUploader.start();
					},
					FileUploaded: (up, file, info) => {
					  //data.result : 代表返回的json数据
					  var { progressBars } = this.state;
					  $(findDOMNode(this.refs[file.id])).delay(800).fadeOut(800, () => {
					    del(progressBars, pb => pb.key == file.id);
					    this.setState({ progressBars });
					  });
					  //提交文件信息到node服务器
					  /*this.submitImgInfo({
					    dir: this.props.dirId,
					    url: JSON.parse(info).key,
					    name: file.name,
					    size: file.size,
					  });*/

					  //暂存图片信息
					  this.saveImgInfo({url: JSON.parse(info).key});
					},
					...uploaderOptions.init					
				}
			})
		})
	}

	getUploaderOptions(){
		return {
		  runtimes: 'html5',
		  get_new_uptoken: true,
		  unique_names: true, //文件名将变为hash值
		  // save_key: true,
		  // uptoken: 'CQH3l1cozF_-KJZj-CiKWUDkaCVGtdRYgI_klK5I:g2QT0uKcRNWuVwizj_uj8zkkCjs=:eyJzY29wZSI6ImhhcHB5dGVzdCIsImRlYWRsaW5lIjoxNDcwMjIwMDU3fQ==',
		  // uptoken_url: 'http://192.168.0.109:3000/qiniu/token', //服务器端可以
		  uptoken_url: 'http://120.76.25.32:8080/qiniu/token',
		  domain: 'http://qn.blissmall.net/',
		  init: {
		    UploadProgress: (up, file) => {
		      this.setState(state => {
		        state.progressBars.forEach( pb => {
		          if(pb.key == file.id){
		            pb.percent = file.percent;
		          }
		        });
		        return state;
		      });
		    },
		    /*UploadComplete: () => {
		      this.props.actions.getImageFileList({parent_id: this.props.dirId});
		    },*/
		    Error: (up, err, errTip = '上传出错，请重试！') => {
		      //上传出错时,处理相关的事情
		      Noty('error', errTip);
		    },
		  }
		}
	}
	handleCreateCompany(form_data){
		this.props.createCompany(form_data)
			.done(function(){
				Noty('success', '保存成功');
				this.props.hide();
			}.bind(this))
			.fail(function(msg){
        		Noty('error', msg || '操作异常');
			})
	}
	handleEditCompany(form_data){
		this.props.editCompany(this.props.company_id, form_data)
			.done(function(){
				Noty('success', '保存成功');
				this.props.hide();
			}.bind(this))
			.fail(function(msg){
        		Noty('error', msg || '操作异常');
			})
	}
	onCancel(){
		this.props.hide();
	}
	saveImgInfo(data){
		var { current_upload_img } = this.state;
		switch(current_upload_img){
			case 1:
				this.setState({img_1: data.url, current_upload_img: 2});break;
			case 2: 
				this.setState({img_2: data.url, current_upload_img: 3});break;
			case 3:
				this.setState({img_3: data.url, current_upload_img: 4});break;
			case 4:
				this.setState({img_4: data.url, current_upload_img: 1});break;
			default:;break;
		}
	}
	onCurrentImgChange(e){
		this.setState({current_upload_img: e});
	}
}

CompanyInfo = reduxForm({
	form: 'company_info',
	validate,
	fields: [
		'name',
		'code',
		'add',
		'tel',
		'bank_name',
		'bank_account',
	],
	destoryOnUnmount: false
}, state => {
	return {
		initialValues: state.invoiceVATManage.main.active_company_info	
	}
})(CompanyInfo);

function mapStateToProps(state){
	return state.invoiceVATManage;
}

function mapDispatchToProps(dispatch){
	var actions =  bindActionCreators({
		...invoiceVATActions
	}, dispatch);
	actions.dispatch = dispatch;
	return actions;
}

export default connect(mapStateToProps, mapDispatchToProps)(ManagePannel)







