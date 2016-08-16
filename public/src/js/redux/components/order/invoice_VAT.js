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
import ProgressBar from 'common/progress_bar';
import LazyLoad from 'utils/lazy_load';

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
		}
	}
	render(){
		var progressList = this.state.progressBars.map( n => {
		      return <ProgressRow ref={n.key} key={n.key} name={n.name} percent={n.percent} />;
		    });
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
			</StdModal>
			)
	}
	show(){
		this.refs.modal.show();
	}
	componentDidMount(){
		var uploaderOptions = this.getUploaderOptions();
		LazyLoad('qiniu', () => {
			var fileUploader = Qiniu.uploader({
				...uploaderOptions,
				browse_button: 'uploadFileBtn',
				init: {
					'FilesAdded': (up, files) => {
					  /*this.setState( state => {
					    state.progressBars = state.progressBars.concat(
					      ...files.map( file => ({
					        key: file.id,
					        name: file.name,
					        percent: 0
					      }))
					    )
					    return state;
					  })*/
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
					  this.submitImgInfo({
					    dir: this.props.dirId,
					    url: JSON.parse(info).key,
					    name: file.name,
					    size: file.size,
					  });
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
		  domain: this.props.domain,
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
		    UploadComplete: () => {
		      this.props.actions.getImageFileList({parent_id: this.props.dirId});
		    },
		    Error: (up, err, errTip = '上传出错，请重试！') => {
		      //上传出错时,处理相关的事情
		      Noty('error', errTip);
		    },
		  }
		}
	}
}