import React, {Component, PropTypes} from 'react';
import { render } from 'react-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import LinkedStateMixin from 'react-addons-linked-state-mixin';
import classNames from 'classnames';

import DatePicker from 'common/datepicker';
import { Confirm } from 'common/message_box';
import Select from 'common/select';
import Pagination from 'common/pagination';
import StdModal from 'common/std_modal';
import { tableLoader, get_table_loading, get_table_empty } from 'common/loading';

import { Noty } from 'utils/index';
import { SELECT_DEFAULT_VALUE } from 'config/app.config';
import LazyLoad from 'utils/lazy_load';

import * as OrderSupportActions from 'actions/order_support';
import * as Actions from 'actions/central_src_channel_manage';

import getTopHeader from '../top_header';

const TopHeader = getTopHeader([{name: '集合管理', link: '/cm/src'}, {name: '来源渠道列表', link: ''}]);

var FilterHeader = React.createClass({
  getInitialState: function() {
    return {
      search_ing: false,
      src_name: '',
      channel_id: SELECT_DEFAULT_VALUE,
    };
  },
  render(){
    var { search_ing, channels } = this.state;
    return (
      <div className="panel search">
        <div className="panel-body form-inline">
          <div className="row">
            <div className="col-md-6">
              <input valueLink={this.linkState('src_name')} className="form-control input-xs" placeholder="来源渠道名称" />
              {'　'}
              <Select valueLink={this.linkState('channel_id')} options={this.props.channels} default-text="选择一级渠道" className="space-right"/>

              <button disabled={search_ing} data-submitting={search_ing} onClick={this.search} className="btn btn-theme btn-xs">
                <i className="fa fa-search"></i>{' 查询'}
              </button>
            </div>
            <div className="col-md-6 text-right">
              <button onClick={this.props.actions.showAddSrcChannel.bind(this, 1)} className="btn btn-theme btn-xs">
                <i className="fa fa-plus"></i>{' 添加一级渠道'}
              </button>
              {'　'}
              <button onClick={this.props.actions.showAddSrcChannel.bind(this, 2)} className="btn btn-theme btn-xs">
                <i className="fa fa-plus"></i>{' 添加二级渠道'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  },
  mixins: [LinkedStateMixin],
  search(){
    this.props.actions.filterSrcChannel({
      src_name: this.state.src_name,
      channel_id: this.state.channel_id == SELECT_DEFAULT_VALUE ? undefined : this.state.channel_id
    });
  },
  resetState(){
    this.setState(this.getInitialState());
  }
})

const EditGroup = function({ editHandler, deleteHandler }){
  return (
    <td>
      <a onClick={editHandler} href="javascript:;">[编辑]</a>{' '}
      <a onClick={deleteHandler} href="javascript:;">[删除]</a>
    </td>
  )
}

class SrcSet extends Component {
  constructor(props){
    super(props);
    this.toggle = this.toggle.bind(this);
    this.state = {
      open: false,
    }
  }
  render(){
    var { choose } = this;
    var { open } = this.state;
    var { data, data : {src_id, name, srcs = [], active }} = this.props;

    var head = (
      <tr key={data.id} className={classNames({'clickable': srcs.length, 'active': active})} onClick={srcs.length ? this.toggle : null} >
        <td className="text-left" style={{textIndent: 20, fontSize: 13}}>
          {name}
          {
            srcs.length
            ? <span className="pull-right space"><i className={"gray fa fa-" + (open ? 'minus' : 'plus')}></i></span>
            : null
          }
        </td>
        <EditGroup editHandler={this.editHandler.bind(this, data)} deleteHandler={this.deleteHandler.bind(this, data)} />
      </tr>
    );

    var body = srcs.map((n, i) => {
      return (
        <tr key={n.id} className={classNames({'hidden' : !open, 'active': n.active})} >
          <td className="text-left" style={{textIndent: 50}}>{n.name}</td>
          <EditGroup editHandler={this.editHandler.bind(this, n)} deleteHandler={this.deleteHandler.bind(this, n)} />
        </tr>
      )
    });

    return (
      <tbody>
        {[head, ...body]}
      </tbody>
    )
  }
  toggle(){
    this.setState({open: !this.state.open})
  }
  editHandler(data, e){
    this.props.actions.showEditSrcChannel(data);
    e.stopPropagation();
  }
  deleteHandler(data, e){
    Confirm('请确认是否删除当前渠道，删除后一级分类下的二级分类也将被删除！！！').then( () => {
      this.props.actions.deleteSrcChannel(data.id)
        .done( () => {
          this.props.actions.getOrderSrcs();
          Noty('success', '删除成功');
        });
    })
    e.stopPropagation();
  }
}
SrcSet.propTypess = {
  data: PropTypes.array.isRequired,
}

class SrcChannelPannel extends Component {
  constructor(props){
    super(props);
  }
  render(){
   //借用父组件的省份数据, 默认城市信息
    var { search_ing, order_srcs_show, total, page_no, page_size, channels_one, filterSrcChannel,
      show_edit_panel, edit_channel_data, level, submitting } = this.props;
    var src_list = order_srcs_show.map( (n) => {
      return <SrcSet data={n} key={n.id} actions={this.props} />;
    });
    return (
      <div className="order-manage">

        <TopHeader />
        <FilterHeader actions={this.props} channels={channels_one} />

        <div className="panel">
          <div className="panel-body">
            <div className="row">
              <div className="col-lg-6 col-md-6">
                <div className="table-responsive">
                  <table className="table table-hover table-click text-center">
                    <thead>
                      <tr>
                        <th>一级渠道/二级渠道</th>
                        <th>操作</th>
                      </tr>
                    </thead>
                    {
                      search_ing
                        ? <tbody>{get_table_loading()}</tbody>
                        : src_list.length
                            ? src_list
                            : <tbody>{get_table_empty()}</tbody>
                    }
                  </table>
                </div>

                <Pagination 
                  page_no={page_no} 
                  total_count={total} 
                  page_size={page_size} 
                  onPageChange={this.onPageChange.bind(this)}
                />
              </div>
              <div className="col-lg-5 col-lg-offset-1 col-md-6" style={{paddingTop: 5}}>
                {
                  show_edit_panel
                    ? <ChannelDetail actions={this.props}  {...{channels: channels_one, data: edit_channel_data, level, submitting}} />
                    : null
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  componentDidMount() {
    LazyLoad('noty');
    this.props.getOrderSrcs().fail( (msg) => Noty('error', msg || '服务器忙'));
  }
  onPageChange(page){
    this.props.filterSrcChannel({page_no: page});
  }
}

function mapStateToProps({srcChannelManage}){
  return srcChannelManage;
}

/* 这里可以使用 bindActionCreators , 也可以直接写在 connect 的第二个参数里面（一个对象) */
function mapDispatchToProps(dispatch){
  return bindActionCreators({...OrderSupportActions, ...Actions}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(SrcChannelPannel);

const FormGroup = props => <div className="form-group form-inline">{props.children}</div>;

var ChannelDetail = React.createClass({
  getInitialState: function() {
    var {data} = this.props;
    return this._getState( data );
  },
  _getState(data){
    return {
      name: data && data.name || '',
      parent_id: data ? data.parent_id : SELECT_DEFAULT_VALUE,
      remark: data && data.remark || '',
    }
  },
  mixins: [LinkedStateMixin],
  componentWillReceiveProps(nextProps){
    if( nextProps.data != this.props.data){
      this.setState(this._getState( nextProps.data ))
    }
  },
  render(){
    var { channels, data, level, submitting } = this.props;
    const is_level_one = level == 1;
    const editable = !!data;
    return (
      <div>
        <FormGroup>
          <label>{ (is_level_one ? '一' : '二') + '级渠道名称：'}</label>
          <input valueLink={this.linkState('name')} className="form-control input-xs" type="text"/>
        </FormGroup>
        {
          !is_level_one
            ? <FormGroup>
                <label>选择一级渠道：</label>
                <Select valueLink={this.linkState('parent_id')} options={channels} className="form-control"></Select>
              </FormGroup>
            : null
        }
        <FormGroup>
          <label>　　　　备注：</label>
          <textarea valueLink={this.linkState('remark')} className="form-control" rows="2" cols="30"></textarea>
        </FormGroup>
        <FormGroup>
          {'　　　　　　　'}
          {
            editable
              ? <button onClick={this.saveChannel} disabled={submitting} data-submitting={submitting}  className="btn btn-theme btn-xs">保存</button>
              : <button onClick={this.addChannel} disabled={submitting} data-submitting={submitting}  className="btn btn-theme btn-xs">添加</button>
          }
          {'　　'}
          <button onClick={this.props.actions.hideChannelPanel} className="btn btn-default btn-xs">取消</button>
        </FormGroup>
      </div>
    )
  },
  preCheck(){
    var { name, parent_id } = this.state;
    if(!name){
      Noty('warning', '请填写渠道名称'); return false;
    }else if(name.indexOf(',') != -1){
      Noty('warning', '渠道名称不能包含逗号'); return false;
    }
    //添加二级渠道就需要填写 附属于一级渠道
    if(this.props.level != 1 && parent_id == SELECT_DEFAULT_VALUE){
      Noty('warning', '请填写一级渠道'); return false;
    }
    return true;
  },
  saveChannel(){
    var { name, parent_id, remark } = this.state;

    remark = remark || undefined;
    if( this.preCheck() ){
      this.props.actions.updateSrcChannel(
        this.props.data.id,
        this.props.level == 1 ? {name, remark} : {name, parent_id, remark}
      ).done(() =>{
        this.props.actions.getOrderSrcs()
        Noty('success', '保存成功')
      })
    }
  },
  addChannel(){
    var { name, parent_id, remark } = this.state;
    remark = remark || undefined;
    if( this.preCheck() ){
      this.props.actions.addSrcChannel(
        this.props.level == 1 ? {name, remark} : {name, parent_id, remark}
      ).done(() =>{
        this.props.actions.getOrderSrcs()
        Noty('success', '添加成功')
      })
    }
  }
})