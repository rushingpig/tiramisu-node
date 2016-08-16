import React, {Component, PropTypes} from 'react';
import { render, findDOMNode } from 'react-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import LinkedStateMixin from 'react-addons-linked-state-mixin';
import { reduxForm } from 'redux-form';

import { Noty, del } from 'utils/index';
import V from 'utils/acl';
import { SELECT_DEFAULT_VALUE } from 'config/app.config';

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
		}
	}
	render(){
		var {search_ing} = this.state;
		return (
			<div className = 'panel search'>
				<div className = 'panel-body form-inline'>
					<input ref = 'company_name' placeholder = '公司名' className='form-control input-xs space-right'/>
					<Select ref='status' default-text = '资料审核状态' />
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
						props.status == 'UNREVIEWED' ?
						[<a key='companyReview' href='javascript:;'>[审核]</a>,<br key='review_br'/>]
						: null
					}
					<a key='companyEdit' href='javascript:;' onClick = {this.viewCompanyEditModal}>[编辑]</a>
					<br />
					<a key='companyDel' >[删除]</a>
				</td>
				<td>
					
				</td>
				<td></td>
				<td></td>
				<td></td>
				<td></td>
				<td></td>
				<td></td>
				<td>
				{
					!props.img1 && props.img1 != '' &&
					[<a href='javascript:;' key='img1_a'>营业执照</a>,<br key='img1_br'/>]
				}
				{
					!props.img2 && props.img2 != '' &&
					[<a href='javascript:;' key='img2_a'>税务登记证</a>,<br key='img2_br'/>]
				}
				{
					!props.img3 && props.img3 != '' &&
					[<a href='javascript:;' key='img3_a'>营业执照</a>,<br key='img3_br'/>]
				}
				{
					!props.img4 && props.img4 != '' &&
					[<a href='javascript:;' key='img4_a'>营业执照</a>,<br key='img4_br'/>]
				}
				</td>
				<td></td>
				<td></td>
				<td></td>
				<td></td>
				<td></td>
			</tr>
			)
	},
	viewCompanyEditModal(){
		this.props.viewCompanyEditModal(this.props.id);
	}
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
		var {list, total, page_no} = this.props;
		var content = list.map( m => {
			return (
				<CompanyRow {...{...m, ...this.props}} key = {m.id}
					viewCompanyEditModal = {this.viewCompanyEditModal.bind(this)}
				/>
				)
		})
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
						<Pagination 
						  page_no={page_no} 
						  total_count={total} 
						  page_size={this.state.page_size} 
						  onPageChange={this.onPageChange.bind(this)}
						/>
					</div>
				</div>
				<CompanyModal ref='CompanyCreateModal' editable = {false}/>
				<CompanyModal ref = 'CompanyEditModal' editable = {true}/>
			</div>
			
			)
	}
	viewCompanyCreateModal(){
		this.refs.CompanyCreateModal.show();
	}
	viewCompanyEditModal(id){
		this.refs.CompanyEditModal.show(id);
	}
	componentDidMount(){
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
			progressBars: [],
			id: '',
		}
	}
	render(){
		var progressList = this.state.progressBars.map( n => {
		      return <ProgressRow ref={n.key} key={n.key} name={n.name} percent={n.percent} />;
		    });
		return (
			<StdModal ref = 'modal' title = '添加公司资料页面' footer={false}>
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

class CompanyInfo extends Component{
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
		} = this.props;
		return(
			<div>				
				<div className='form-group form-inline'>
					<label>{'　　公司名称：'}</label>
					<input {...name} type = 'text' className= 'form-control input-xs'/>
					{
						editable ?
						[
							<label>{'公司编号：'}</label>,
							<input readOnly value = {company_id} type = 'text' className = 'form-control input-xs' />
						]: null
					}
				</div>
				<div className='form-group form-inline'>
					<label>{'纳税人识别号/'}<br />{'社会信用代码：'}</label>
					<input  {...code} type='text' className='form-control input-xs' />
				</div>
				<div className='form-group form-inline'>
					<label>{'公司注册地址：'}</label>
					<input {...add} type = 'text' className= 'form-control input-xs'/>
				</div>
				<div className='form-group form-inline'>
					<label>{'公司注册电话：'}</label>
					<input {...tel} type = 'text' className= 'form-control input-xs'/>
				</div>
				<div className='form-group form-inline'>
					<label>{'开户银行名称：'}</label>
					<input {...bank_name} type = 'text' className= 'form-control input-xs'/>
				</div>
				<div className='form-group form-inline'>
					<label>{'开户银行账号：'}</label>
					<input {...bank_account} type = 'text' className= 'form-control input-xs'/>
				</div>
				<div className='form-group form-inline'>
					<label>{'资质证书照片：'}</label>
					<a id='uploadFileBtn' >上传图片</a>
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
	componentDidMount(){
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
		this.props.actions.createCompany(form_data)
			.done(function(){
				Noty('success', '保存成功');
				this.props.hide();
			}.bind(this))
			.fail(function(msg){
        		Noty('error', msg || '操作异常');
			})
	}
	handleEditCompany(){
		this.props.actions.editCompany(this.props.company_id)
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
}

CompanyInfo = reduxForm({
	form: 'company_info',
	fields: [
		'name',
		'code',
		'add',
		'tel',
		'bank_name',
		'bank_account',
	],
	destoryOnUnmount: false
})(CompanyInfo);

function mapStateToProps(state){
	return state.invoiceVATManage;
}

function mapDispatchToProps(dispatch){
	/*var actions =  bindActionCreators({

	}, dispatch);
	actions.dispatch = dispatch;*/
	return invoiceVATActions;
}

export default connect(mapStateToProps, mapDispatchToProps)(ManagePannel)







