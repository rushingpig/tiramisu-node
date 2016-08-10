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
import { get_normal_loading } from 'common/loading';

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
      progressBars: [],
    };
  },
  render(){
    var progressList = this.state.progressBars.map( n => {
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
          <button onClick={this.props.actions.createNewDir} className="btn btn-theme btn-xs">
            <i className="fa fa-plus-circle"></i>{' 新建文件夹'}
          </button>
          <SearchInput searchHandler={this.search} searching={this.props.searchIng} className="form-inline pull-right" placeholder="图片名称" />
          {
            progressList.length
              ? [
                  <hr key="hr" />,
                  <div className="row" key="progressBars" style={{maxHeight: '171px', overflowY: 'auto'}}>
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
    // LazyLoad('qiniu_dev', () => {
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
            this.submitImgInfo({
              dir: this.props.dirId,
              url: JSON.parse(info).key,
              name: file.name,
              size: file.size,
            });
          },
          ...uploaderOptions.init
        }
      });
      var Q2 = new QiniuJsSDK();
      var dirUploader = Q2.uploader({
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
            if(up.dir_id_to_upload){
              Noty('warning', '请等待上一个文件夹上传成功之后再试！');
              return;
            }
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
            this.props.actions.getNewDir({name: dirname, parent_id: this.props.dirId})
              .done( data => {
                up.dir_id_to_upload = data.id;
                dirUploader.start();
              })
              .fail( () => Noty.error('上传失败，请重试！') )
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
              dir: up.dir_id_to_upload,
              url: JSON.parse(info).key,
              name: file.name,
              size: file.size,
            });
          },
          ...uploaderOptions.init,
          UploadComplete: () => {
            uploaderOptions.init.UploadComplete();
            delete dirUploader.dir_id_to_upload;
          }
        }
      });
    });
  },
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
  },
  submitImgInfo(data){
    this.props.actions.submitImgInfo(data).fail(()=>{
      Noty('error', '提交图片信息失败!');
      // this.submitImgInfo(data);
    })
  },
  uploadFileHandler(e){
    $(this.refs.dropDownMenu).hide();
    $('body').off('click', this.hideDropDownMenu);
  },
  showDropDownMenu: function(){
    $(this.refs.dropDownMenu).show();
    $('body').on('click', this.hideDropDownMenu);
    //添加上传文件夹支持
    $('#uploadDirBtn').next().find('input').attr('webkitdirectory', true);
  },
  hideDropDownMenu: function(){
    $(this.refs.dropDownMenu).hide();
    $('body').off('click', this.hideDropDownMenu);
  },
  search(value){
    this.props.actions.startSearchImgByNameIng();
    this.props.actions.getImageFileList({parent_id: this.props.dirId, name: value.trim() || undefined})
  },
  resetState(){
    this.setState(this.getInitialState());
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

class Row extends Component {
  constructor(props){
    super(props);
    this.state = {
      editable: false,
      operate_options: [
        { key: 'move', text: '移动到' },
        { key: 'rename', text: '重命名' },
        { key: 'del', text: '删除' },
      ],
    };
    this.submitNewDir = this.submitNewDir.bind(this);
    this.rename = this.rename.bind(this);
  }
  render(){
    var fileIcon = this.getFileIcon(this.props);
    var {isDir, editable, isNewDir, id, checked, url, name, size, updated_time, domain} = this.props;
    return (
      <tr>
        <td className="text-center"><input onClick={this.checkHandler.bind(this)} checked={checked} type="checkbox"/></td>
        <td>
          <div className="inline-block pointer">
            <i className={`fa fa-lg ${fileIcon} space-right`}></i>
            {
              editable || this.state.editable
                ? <input ref="file_name" defaultValue={name} onBlur={isNewDir ? this.submitNewDir : this.rename} type="text" />
                : isDir
                  ? <span onClick={this.props.enterDir.bind(null, {name, id})} className="underline-on-hover">{name}</span>
                  : <span onClick={this.props.actions.viewImg.bind(null, this.props)}>{name}</span>
            }
          </div>
          <div className="visibility-hidden pull-right show-on-parent-hover" style={{marginRight: 20}}>
            {
              !isDir
                ? <a href={domain + url} download={name}><i className="fa fa-download fa-color-gray space pointer"></i></a>
                : null
            }
            <DropDown
              frontBtnStyle={{padding: 0, border: 'none', background: 'none', top: -2, fontSize: 14, lineHeight: 1}}
              options={this.state.operate_options}
              noText
              noCaret
              onChoose={this.operateHandler.bind(this)}
              btnColor="btn-default">
              <i className="fa fa-caret-square-o-down fa-color-gray"></i>
            </DropDown>
          </div>
        </td>
        <td>{size || '-'}</td>
        <td>{updated_time || '-'}</td>
      </tr>
    )
  }
  componentDidMount(){
    if(this.props.editable){
      this.refs.file_name.focus();
    }
  }
  getFileIcon({ isDir, name }){
    if(isDir){
      return 'fa-folder';
    }else if(/((\.jpg)|(\.png)|(\.gif)|(\.jpeg)|(\.bmp))$/i.test(name)){
      return 'fa-file-image-o';
    }else if(/((\.doc)|(\.docx))$/i.test(name)){
      return 'fa-file-word-0';
    }else if(/\.xlsx$/i.test(name)){
      return 'fa-file-excel-o';
    }else if(/\.txt$/i.test(name)){
      return 'fa-file-text-o';
    }else if(/((\.zip)|(\.rar))$/i.test(name)){
      return 'fa-file-archive-o';
    }else{
      return 'fa-file-o';
    }
  }
  checkHandler(e){
    this.props.actions.checkImgRow(this.props.id, e.target.checked);
  }
  submitNewDir(e){
    this.props.actions.submitNewDir({name: e.target.value.trim(), parent_id: this.props.dirId});
  }
  rename(e){
    if(e.target.value.trim()){
      this.props.actions.rename({id: this.props.id, name: e.target.value}).done(()=>{
        this.setState({editable: false})
      });
    }else{
      e.target.focus();
    }
  }
  operateHandler(option){
    if(option.key == 'rename'){
      this.setState({editable: true}, function(){
        this.refs.file_name.focus();
      })
    }else if(option.key == 'del'){
      this.props.deleteImg([this.props.id]);
    }else if(option.key == 'move'){
      this.props.showMoveModal([this.props.id]);
    }
  }
}

class ImageManagePannel extends Component {
  constructor(props){
    super(props);
    this.state = {
      breadcrumb: [{id: undefined, name: '全部文件'}],
    };
    this.onBreadcrumbClicked = this.onBreadcrumbClicked.bind(this);
    this.enterDir = this.enterDir.bind(this);
    this.backToUpperDir = this.backToUpperDir.bind(this);
    this.checkAllHandler = this.checkAllHandler.bind(this);
    this.deleteImg = this.deleteImg.bind(this);
    this.showMoveModal = this.showMoveModal.bind(this);
  }
  render(){
   //借用父组件的省份数据, 默认城市信息
    var { dir_id, asc, loading, search_ing, list, checked_list, search_ing, domain, view_img } = this.props.main;
    var { breadcrumb } = this.state;
    var { enterDir, backToUpperDir, checkAllHandler } = this;
    var content = list.map( (n, i) => 
      <Row 
        key={n.id + '' + i}
        {...n}
        enterDir={enterDir}
        deleteImg={this.deleteImg}
        showMoveModal={this.showMoveModal}
        actions={this.props}
        domain={domain}
        dirId={dir_id}
      />
    );
    return (
      <div>

        <FilterHeader domain={domain} searchIng={search_ing} dirId={dir_id} actions={this.props} />

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
                    <th className="text-center"><input onClick={checkAllHandler} type="checkbox"/></th>
                    <th style={{width: '60%', height: 45}}>
                      {
                        checked_list.length
                          ? <div className="inline-block">
                              <span>已选中<span className="strong" style={{margin: '0 3px'}}>{checked_list.length}</span>个文件/文件夹</span>
                              {/*<button className="btn btn-default btn-xs space-left">
                                <i className="fa fa-download"></i> 下载
                              </button>*/}
                              <button onClick={this.patchDelete.bind(this)} className="btn btn-default btn-xs space-left">
                                <i className="fa fa-trash-o"></i> 删除
                              </button>
                              {/*<button disabled={checked_list.length > 1} className="btn btn-default btn-xs space-left">
                                                              重命名
                                                            </button>*/}
                              <button onClick={this.showMoveModal.bind(this, checked_list)} className="btn btn-default btn-xs space-left">
                                移动到
                              </button>
                            </div>
                          : <span>文件名</span>
                      }
                    </th>
                    <th>大小</th>
                    <th className={'sorting ' + (asc ? 'asc' : 'desc')} onClick={this.props.toggleImgSorting}>修改日期</th>
                  </tr>
                </thead>
                <tbody>
                  {tableLoader(loading || search_ing, content)}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <MoveModal {...this.props.move_modal} dirId={dir_id} actions={this.props} ref="move_modal" />

        {
          view_img
            ? <ViewModal {...view_img} domain={domain} actions={this.props} />
            : null
        }
      </div>
    )
  }
  componentDidMount() {
    this.props.getImageFileList();
    LazyLoad('noty');
  }
  onBreadcrumbClicked(node){
    var index = this.state.breadcrumb.findIndex( b => b.id == node.id );
    var breadcrumb = this.state.breadcrumb.slice(0, index + 1);
    this.setState({breadcrumb});
    this.props.getImageFileList({parent_id: node.id});
  }
  enterDir({id, name}){
    this.state.breadcrumb.push({id, name});
    this.setState({
      breadcrumb: this.state.breadcrumb
    })
    this.props.getImageFileList({parent_id: id});
  }
  backToUpperDir(){
    var { breadcrumb } = this.state;
    breadcrumb.pop();
    this.setState({ breadcrumb });
    this.props.getImageFileList({parent_id: breadcrumb[breadcrumb.length - 1].id});
  }
  checkAllHandler(e){
    this.props.checkAll(e.target.checked);
  }
  patchDelete(){
    var { main: {checked_list, dir_id}, deleteImg } = this.props;
    if(checked_list.length){
      this.deleteImg(checked_list);
    }
  }
  deleteImg(list){
    return Confirm('确认删除吗？删除后将不可恢复请注意！').done( () => {
      this.props.deleteImg(list).fail( () => Noty('error', '删除失败，请重试！'));
    })
  }
  showMoveModal(ids){
    if(ids.length){
      this.props.saveIdsToBeMoved(ids);
      this.refs.move_modal.show();
    }
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

class TreeNode extends React.Component {
  render(){
    var { data, onChoose, children, submitNewDirInModal } = this.props;
    return (
      <div className="tree-folder">
        <div className={`tree-folder-header ${data.active ? 'active' : ''}`} onClick={onChoose.bind(null, data.id)}>
          {
            children && children.length
              ? <i className={`fa fa-${data.open ? 'minus' : 'plus'}-square-o`}></i>
              : null
          }
          <i className="fa fa-lg fa-folder space-right"></i>
          <div className="tree-folder-name no-userselect">
            {
              data.isNewDir
                ? <input ref="input" onBlur={submitNewDirInModal.bind(this, data.parent_id)} defaultValue={data.name} type="text"/>
                : data.name
            }
          </div>
        </div>
        <div className="tree-folder-content">
          { data.open ? children : null}
        </div>
      </div>
    )
  }
  componentDidMount(){
    if(this.props.data.isNewDir){
      this.refs.input.focus();
    }
  }
}

class TreeView extends React.Component {
  constructor(props){
    super(props);
    this.build = this.build.bind(this);
  }
  render(){
    return (
      <div className="panel">
        <div className="panel-body">
          <div className="tree" style={{maxHeight: '400px'}}>
            {
              this.props.loading
                ? get_normal_loading()
                : this.props.data.map( d => this.build( d ) )
            }
          </div>
        </div>
      </div>
    )
  }
  build(data){
    return (
      <TreeNode key={data.id} data={data}
        onChoose={this.props.actions.selectDir} submitNewDirInModal={this.props.actions.submitNewDirInModal} >
        {
          data.children &&
          data.children.reduce( (pre, cur) => {
            pre.push( this.build( cur ) );
            return pre;
          }, [])
        }
      </TreeNode>
    )
  }
}

class MoveModal extends React.Component {
  render(){
    return (
      <StdModal onConfirm={this.onConfirm.bind(this)} submitting={this.props.submitting} disabled={this.props.editable} ref="modal" title="移动到">
        <div className="form-group">
          <button onClick={this.props.actions.createNewDirInModal} className="btn btn-xs btn-theme">创建文件夹</button>
        </div>
        <TreeView actions={this.props.actions} loading={this.props.loading} data={this.props.tree_data} />
      </StdModal>
    )
  }
  show(){
    this.props.actions.getAllImgDir();
    this.refs.modal.show();
  }
  onConfirm(){
    this.props.actions.moveImg(this.props.selected_dir_id, this.props.move_ids)
      .done( () => {
        this.props.actions.getImageFileList({parent_id: this.props.dirId})
        this.refs.modal.hide();
      });
  }
}