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
import SearchInput from 'common/search_input';
import { tableLoader, get_table_loading, get_table_empty } from 'common/loading';

import { Noty } from 'utils/index';
import { SELECT_DEFAULT_VALUE } from 'config/app.config';
import LazyLoad from 'utils/lazy_load';
import V from 'utils/acl';

import * as Actions from 'actions/operation_product_size_manage';
import { onFormChange } from 'actions/common';

import getTopHeader from '../top_header';

const TopHeader = getTopHeader([{name: '运营管理', link: ''}, {name: '规格管理', link: ''}]);
const FormGroup = props => <div className="form-group form-inline">{props.children}</div>;

class Main extends Component {
  constructor(props){
    super(props);
  }
  render(){
    var { props } = this;
    var list = props.list.map( n => (
      <tr
        key={n.id}
        className={`clickable ${props.selected_id == n.id ? 'active' : ''}`}
        onClick={props.actions.activeRow.bind(null, n.id)}
        >
        <td>{n.name}</td>
        <td>
          <a onClick={props.actions.editRow.bind(null, n.id)} href="javascript:;" className="space">[编辑]</a>
          {
            n.enable == 1
              ? <a onClick={props.actions.disableSize.bind(null, n.id)} href="javascript:;" className="space">[下架]</a>
              : <a onClick={props.actions.enableSize.bind(null, n.id)} href="javascript:;" className="space">[上架]</a>
          }
        </td>
      </tr>
    ));
    return (
      <div className="order-manage">
        <TopHeader />
        <div className="row">
          <div className="col-lg-6 col-md-6">
            <FormGroup>
              <SearchInput className="inline-block" placeholder="规格名称" />
              <button
                disabled={props.is_add}
                onClick={props.actions.addProductSize}
                className="btn btn-xs btn-theme pull-right">
                <i className="fa fa-plus"></i> 添加
              </button>
            </FormGroup>
          </div>
        </div>
        <div className="panel">
          <div className="panel-body">
            <div className="row">
              <div className="col-lg-6 col-md-6">
                <div className="table-responsive" style={{maxHeight: 600, overflow: 'auto'}}>
                  <table className="table table-hover table-click text-center">
                    <thead>
                      <tr>
                        <th>
                          &nbsp;&nbsp;&nbsp;&nbsp;规格名称　
                          <span className={props.selected_id ? '' : 'visibility-hidden'}>
                            <a onClick={props.actions.moveUp} href="javascript:;"><i className="fa fa-long-arrow-up space-right"></i></a>
                            <a onClick={props.actions.moveDown} href="javascript:;"><i className="fa fa-long-arrow-down"></i></a>
                          </span>
                        </th>
                        <th>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      { tableLoader(props.loading, list) }
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="col-lg-5 col-lg-offset-1 col-md-6" style={{paddingTop: 5}}>
                {
                  props.edit_size
                    ? <SizeDetail {...props.edit_size} add={props.is_add} actions={props.actions} />
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
    this.props.actions.getAllSizeData().fail( (msg) => Noty('error', msg || '网络繁忙，请稍后再试'));
  }
}

function mapStateToProps({operationProductSizeManage}){
  return {...operationProductSizeManage};
}

/* 这里可以使用 bindActionCreators , 也可以直接写在 connect 的第二个参数里面（一个对象) */
function mapDispatchToProps(dispatch){
  return { actions: bindActionCreators({...Actions, onFormChange}, dispatch) };
}

export default connect(mapStateToProps, mapDispatchToProps)(Main);


class FormCol extends Component {
  constructor(props){
    super(props);
    this.state = {
      focus: false,
    }
  }
  render(){
    var { props } = this;
    var label = props.label.split('');
    //默认4个汉字长度
    var str = new Array(props.length || 4).fill('　');
    str.splice(0, label.length, ...label);
    return (
      !props.editable
        ? <div className="form-group form-inline">
            <label><span>{str.join('')}</span>：</label>
            <input
              value={props.value}
              onChange={props.onChange}
              className="form-control input-xs long-input"
            />
            <i
              onClick={props.delProperty}
              className="fa fa-lg fa-times space-left cursor-pointer hover-effect"
              ></i>
          </div>
        : <div ref="main" className="form-group form-inline relative">
            <input
              type="text"
              ref="editKey"
              value={props.label}
              className="form-control input-xs v-top"
              onChange={props.propertyChange.bind(null, -1)}
            />
            ：
            <input
              type="text"
              ref="editValue"
              value={props.value}
              className="form-control input-xs long-input"
              onChange={props.onChange}
            />
            <div className="inline-block">
              <i
                style={{marginRight: 2}}
                onClick={this.propertyOk.bind(this)}
                className="fa fa-check fa-lg space-left cursor-pointer hover-effect"
              ></i>
              <i
                onClick={props.delProperty}
                className="fa fa-times fa-lg space-left cursor-pointer hover-effect"
              ></i>
            </div>
          </div>
    )
  }
  componentDidMount(){
    if(this.props.editable){
      this.refs.editKey.style.width = $(this.refs.main).prev().find('label span').width() + 'px';
    }
  }
  propertyOk(){
    if(this.refs.editKey.value.trim() && this.refs.editValue.value.trim()){
      this.props.propertyOk();
    }
  }
}

const SizeDetail = props => {
  return (
    <div>
      <div className="clearfix">
        <span className="theme font-lg">规格配置</span>
        <p className="inline-block font-sm">（展示在商品详情页页面，非必填项，若不填则不显示）</p>
        <button
          disabled={props.data.length >= 5 || props.data.some( n => n.editable )}
          onClick={props.actions.addProperty}
          className="btn btn-xs btn-default pull-right">
          <i className="fa fa-plus"></i> 添加属性
        </button>
      </div>
      <FormGroup>
        <label>规格名称：</label>
        <input
          type="text"
          value={props.name}
          className="form-control input-xs long-input"
          onChange={props.actions.onFormChange.bind(null, 'size_name')}
        />
      </FormGroup>
      <p className="gray">
        { props.data.length >= 5 ? '最多5条' : <span>&nbsp;</span>}
      </p>
      {
        props.data.map( (n, i) => 
          <FormCol
            key={i}
            label={n.key}
            value={n.value}
            editable={n.editable}
            propertyOk={props.actions.propertyOk}
            propertyChange={props.actions.propertyChange}
            onChange={props.actions.propertyChange.bind(null, i)}
            delProperty={props.actions.delProperty.bind(null, i)}
          />
        )
      }
      <div className="mgt-20">
        <button className="btn btn-theme btn-sm">{props.add ? '创建' : '保存'}</button>
      </div>
    </div>
  )
}