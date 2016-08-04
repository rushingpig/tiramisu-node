import React, {Component, PropTypes} from 'react';
import { render, findDOMNode } from 'react-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import LinkedStateMixin from 'react-addons-linked-state-mixin';
import classNames from 'classnames';

import { Confirm } from 'common/message_box';
import Select from 'common/select';
import SearchInput from 'common/search_input';
import Pagination from 'common/pagination';
import StdModal from 'common/std_modal';
import { tableLoader, get_table_loading, get_table_empty } from 'common/loading';
import DropDown from 'common/drop_down';
import Breadcrumb from 'common/breadcrumb';
import ProgressBar from 'common/progress_bar';

import { Noty, del } from 'utils/index';
import { SELECT_DEFAULT_VALUE } from 'config/app.config';
import LazyLoad from 'utils/lazy_load';
import V from 'utils/acl';

import * as ImageManageActions from 'actions/central_image_manage';

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

var FilterHeader = React.createClass({
  getInitialState: function() {
    return {
      search_ing: false,
      progressBars: [],
    };
  },
  render(){
    var { search_ing, progressBars } = this.state;
    var progressList = progressBars.map( n => {
      return <ProgressRow ref={n.key} key={n.key} name={n.name} percent={n.percent} />;
    });
    return (
      <div className="panel search">
        <div className="panel-body form-inline">
          <div className="inline-block btn-group">
            <button onClick={this.showDropDownMenu} className="btn dropdown-toggle btn-theme btn-xs">
              <i className="fa fa-cloud-upload"></i> 上传
              <span className="caret" style={{marginLeft: 8}}></span>
            </button>
            <ul ref="dropDownMenu" className="dropdown-menu">
              <li>
                <a id="uploadFileBtn" onClick={this.uploadFileHandler} href="javascript:void(0)" >
                  上传文件
                </a>
              </li>
              <li>
                <a id="uploadDirBtn" onClick={this.uploadFileHandler} href="javascript:void(0)" >
                  上传文件夹
                </a>
              </li>
            </ul>
          </div>
          {'　　'}
          <button className="btn btn-theme btn-xs">
            <i className="fa fa-plus-circle"></i>{' 新建文件夹'}
          </button>
          <SearchInput searchHandler={this.search.bind(this, 'search_ing')} searching={search_ing} className="form-inline pull-right" placeholder="图片名称" />
          {
            progressBars.length
              ? [
                  <hr key="hr" />,
                  <div className="row" key="progressBars">
                    { progressList }
                  </div>
                ]
              : null
          }
        </div>
      </div>
    )
  },
  componentDidMount(){
    //api文档：http://developer.qiniu.com/code/v6/sdk/javascript.html
    var uploaderOptions = this.getUploaderOptions();
    LazyLoad('qiniu_dev', () => {
      const fileUploader = Qiniu.uploader({
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
          ...uploaderOptions.init
        }
      });
      var Q2 = new QiniuJsSDK();
      const dirUploader = Q2.uploader({
        ...uploaderOptions,
        browse_button: 'uploadDirBtn',
        init: {
          'FilesAdded': (up, files) => {
            try{
              var dirname = files[0].getNative().webkitRelativePath.split('/')[0];
            }catch(e){
              Noty('error', '读取文件夹失败！');
              return;
            }
            this.setState( state => {
              state.progressBars = state.progressBars.concat(
                ...files.map( file => ({
                  key: file.id,
                  name: file.getNative().webkitRelativePath,
                  percent: 0
                }))
              )
              return state;
            })
            fileUploader.start();
          },
          ...uploaderOptions.init
        }
      });
      //添加上传文件夹支持
      $('#uploadDirBtn').next().find('input').attr('webkitdirectory', true);
    });
  },
  getUploaderOptions(){
    return {
      runtimes: 'html5',
      get_new_uptoken: true,
      unique_names: true, //文件名将变为hash值
      // save_key: true,
      // uptoken: 'CQH3l1cozF_-KJZj-CiKWUDkaCVGtdRYgI_klK5I:g2QT0uKcRNWuVwizj_uj8zkkCjs=:eyJzY29wZSI6ImhhcHB5dGVzdCIsImRlYWRsaW5lIjoxNDcwMjIwMDU3fQ==',
      uptoken_url: 'http://192.168.0.109:3000/qiniu/token', //服务器端可以
      domain: 'o8wbe9riz.bkt.clouddn.com',
      init: {
        'UploadProgress': (up, file) => {
          this.setState(state => {
            state.progressBars.forEach( pb => {
              if(pb.key == file.id){
                pb.percent = file.percent;
              }
            });
            return state;
          });
        },
        'FileUploaded': (up, file, info) => {
          debugger;
          //data.result : 代表返回的json数据
          var { progressBars } = this.state;
          $(findDOMNode(this.refs[file.id])).delay(1000).fadeOut(1000, () => {
            del(progressBars, pb => pb.key == file.id);
            this.setState({ progressBars });
          })
        },
        'Error': (up, err, errTip = '上传出错，请重试！') => {
          //上传出错时,处理相关的事情
          Noty('error', errTip);
        },
      }
    }
  },
  uploadFileHandler(e){
    $(this.refs.dropDownMenu).hide();
    $('body').off('click', this.hideDropDownMenu);
  },
  showDropDownMenu: function(){
    $(this.refs.dropDownMenu).show();
    $('body').on('click', this.hideDropDownMenu);
  },
  hideDropDownMenu: function(){
    $(this.refs.dropDownMenu).hide();
    $('body').off('click', this.hideDropDownMenu);
  },
  search(){
    
  },
  resetState(){
    this.setState(this.getInitialState());
  }
})

class Row extends Component {
  constructor(props){
    super(props);
    this.state = {
      operate_options: [
        { key: 'move', text: '移动到' },
        { key: 'rename', text: '重命名' },
        { key: 'del', text: '删除' },
      ],
    }
  }
  render(){
    var fileIcon = this.getFileIcon(this.props);
    var {isDir, id, name, size, update_time} = this.props;
    return (
      <tr>
        <td className="text-center"><input type="checkbox"/></td>
        <td>
          <div className="inline-block pointer">
            <i className={`fa fa-lg ${fileIcon} space-right`}></i>
            {
              isDir
                ? <span onClick={this.props.enterDir.bind(null, {name, id})} className="underline-on-hover">{name}</span>
                : <span>{name}</span>
            }
          </div>
          <div className="display-none pull-right show-on-parent-hover" style={{marginRight: 20}}>
            <i className="fa fa-download fa-color-gray space pointer"></i>
            <DropDown
              frontBtnStyle={{padding: 0, border: 'none', background: 'none', top: -2, fontSize: 14, lineHeight: 1}}
              options={this.state.operate_options}
              noText
              noCaret
              onChoose={()=>{}}
              btnColor="btn-default">
              <i className="fa fa-caret-square-o-down fa-color-gray"></i>
            </DropDown>
          </div>
        </td>
        <td>{size || '-'}</td>
        <td>{update_time || '-'}</td>
      </tr>
    )
  }
  getFileIcon({ isDir, name }){
    if(isDir){
      return 'fa-folder';
    }else if(/((\.jpg)|(\.png)|(\.gif)|(\.jpeg)|(\.bmp))$/i.test(name)){
      return 'fa-file-image-o';
    }else if(/((\.doc)|(\.docx))$/i.test(name)){
      return 'fa-file-word-0';
    }else if(/\.xls$/i.test(name)){
      return 'fa-file-excel-o';
    }else if(/\.txt$/i.test(name)){
      return 'fa-text-o';
    }else if(/((\.zip)|(\.rar))$/i.test(name)){
      return 'fa-file-archive-o';
    }else{
      return 'fa-file-o';
    }
  }
}

class ImageManagePannel extends Component {
  constructor(props){
    super(props);
    this.state = {
      breadcrumb: [{id: -1, name: '全部文件'}]
    };
    this.onBreadcrumbClicked = this.onBreadcrumbClicked.bind(this);
    this.enterDir = this.enterDir.bind(this);
    this.backToUpperDir = this.backToUpperDir.bind(this);
  }
  render(){
   //借用父组件的省份数据, 默认城市信息
    var { loading, list, search_ing } = this.props;
    var { breadcrumb } = this.state;
    var { enterDir, backToUpperDir } = this;
    var content = list.map( n => <Row key={n.id} {...n} enterDir={enterDir} /> );
    return (
      <div>

        <FilterHeader actions={this.props} />

        <div className="panel">
          <div className="panel-body">
            <div style={{marginBottom: 5}}>
              {
                breadcrumb.length > 1
                  ? [
                      <span key="return" onClick={backToUpperDir} className="achor">返回上一级</span>,
                      <span key="sep" className="gray"> | </span>
                    ]
                  : null
              }
              <Breadcrumb
                data={breadcrumb}
                className="inline-block"
                onClick={this.onBreadcrumbClicked}
              />
              <span className="pull-right">已全部加载，共 {content.length} 个</span>
            </div>
            <div className="">
              <table className="table table-hover table-bordered table-click text-left">
                <thead className="font-normal">
                  <tr>
                    <th className="text-center"><input type="checkbox"/></th>
                    <th>
                      <span>文件名</span>
                      <div className="inline-block">
                        <span>已选中<span className="strong" style={{margin: '0 3px'}}>1</span>个文件/文件夹</span>
                        <button className="btn btn-default btn-xs space-left">
                          <i className="fa fa-download"></i> 下载
                        </button>
                        <button className="btn btn-default btn-xs space-left">
                          <i className="fa fa-trash-o"></i> 删除
                        </button>
                        <button className="btn btn-default btn-xs space-left">
                          重命名
                        </button>
                        <button className="btn btn-default btn-xs space-left">
                          移动到
                        </button>
                      </div>
                    </th>
                    <th>大小</th>
                    <th className="sorting desc">修改日期</th>
                  </tr>
                </thead>
                <tbody>
                  {tableLoader(loading || search_ing, content)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    )
  }
  componentDidMount() {
    this.props.getImageFileList();
    // LazyLoad('noty');
  }
  onBreadcrumbClicked(node){
    var index = this.state.breadcrumb.findIndex( b => b.id == node.id );
    var breadcrumb = this.state.breadcrumb.slice(0, index + 1);
    this.setState({breadcrumb});
    this.props.getImageFileList(node.id);
  }
  enterDir(dir){
    this.state.breadcrumb.push(dir);
    this.setState({
      breadcrumb: this.state.breadcrumb
    })
    this.props.getImageFileList(dir.id);
  }
  backToUpperDir(){
    var { breadcrumb } = this.state;
    breadcrumb.pop();
    this.setState({ breadcrumb });
    this.props.getImageFileList(breadcrumb[breadcrumb.length - 1].id);
  }
}

function mapStateToProps({imageManage}){
  return imageManage;
}

/* 这里可以使用 bindActionCreators , 也可以直接写在 connect 的第二个参数里面（一个对象) */
function mapDispatchToProps(dispatch){
  return bindActionCreators(ImageManageActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ImageManagePannel);