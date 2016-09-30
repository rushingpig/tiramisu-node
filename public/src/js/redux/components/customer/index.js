import React, { Component }     from 'react';
import { connect }              from 'react-redux';
import { bindActionCreators }   from 'redux';
import LinkedStateMixin         from 'react-addons-linked-state-mixin';

import * as actions             from 'actions/customer_manage';
import area                     from 'actions/area';

import Pagination               from 'common/pagination';
import { tableLoader, get_normal_loading, get_normal_empty } from 'common/loading';
import Select                   from 'common/select';
import V                        from 'utils/acl';
import StdModal                 from 'common/std_modal';
import { SELECT_DEFAULT_VALUE } from 'config/app.config';
import { Noty } from 'utils/index';
import LazyLoad from 'utils/lazy_load';

const Form = props => (
  <div className="col-xs-4">
    <label>{props.label}</label>
    <span className="theme">{props.children}</span>
  </div>
)
const TR = props => <div className="text-center" style={{fontSize: 0, marginRight: -3, overflow: 'hidden'}}>{props.children}</div> ;
const TD = props => <div {...props} style={
  {display: 'inline-block', width: '291px', fontSize: 12, padding: 8, borderRight: '1px solid #ddd', borderBottom: '1px solid #ddd'}
}>{props.children || <span>&nbsp;</span> }</div> ;

class DetailModal extends Component {
  render(){
    var {props} = this;
    return (
      <StdModal ref="modal" title="客户详情" size="lg" footer={false} onCancel={this.onHide.bind(this)} >
        <div className="row">
          <div className="col-xs-8">
            <div className="row">
              <Form label="用户名：">{props.auth_id}</Form>
              <Form label="已设密码：">{props.passworded == 1 ? '是' : '否'}</Form>
              <Form label="　　生日：">{props.birthday}</Form>

              <Form label="　昵称：">{props.nick_name}</Form>
              <Form label="　　性别：">{props.sex}</Form>
            </div>
            <div className="row">
              <div className="col-xs-12">
                <label>所在地：</label>
                <span className="theme">{props.address}</span>
              </div>
            </div>
          </div>
          <div className="col-xs-4">
            <div className="pull-right">
              {
                props.avatar
                  ? <img width="80" src={props.avatar} alt="avatar"/>
                  : null
              }
            </div>
          </div>
        </div>
        <p />
        <div className="panel">
          <div className="panel-heading">登录日志</div>
          <table className="table table-bordered table-scripe" style={{borderBottom: '1px solid #ddd'}}>
            <thead>
              <tr>
                <th width="290">时间</th>
                <th width="291">访问IP</th>
                <th width="">访问来源</th>
              </tr>
            </thead>
          </table>
          <div className="table-bordered" style={{'maxHeight': 300, overflow: 'auto'}}>
            {
              props.list
                ? (
                    props.list.length == 0
                      ? get_normal_empty()
                      : props.list.map((n, i) => (
                          <TR key={i}>
                            <TD>{n.datetime}</TD>
                            <TD>{n.ip}</TD>
                            <TD>{n.visit_src == 'NONE' ? '-' : n.visit_src}</TD>
                          </TR>
                        )).concat(
                          props.list.length % 10 == 0
                            ? <TR key="more">
                                <a onClick={this.loadMore.bind(this)} href="javascript:;" style={{display: 'inline-block', fontSize: 12, padding: 8}}>更多>></a>
                              </TR>
                            : null
                        )
                  )
                : get_normal_loading()
            }
          </div>
        </div>
        <p />
        <div className="row">
          <div className="col-xs-12">
            <div className="pull-right">
              <button className="btn btn-default space-right disabled">发送密码重置短信</button>
              <button
                onClick={this.addToBlackList.bind(this)}
                className="btn btn-danger"
                disabled={props.uuid == props.uuid_black}
              >
                加入黑名单
              </button>
            </div>
          </div>
        </div>
      </StdModal>
    )
  }
  componentDidMount(){
    this.refs.modal.show();
  }
  loadMore(){
    this.props.actions.getCustomerLogs({
      uuid: this.props.uuid,
      last_id: this.props.last_id,
      page_size: 10,
      page_no: this.props.page_no,
    })
  }
  addToBlackList(){
    this.props.actions.addToBlackList(this.props.uuid)
      .done(() => {
        Noty('success', '加入黑名单成功！');
        this.props.callback();
      })
      .fail( msg => Noty('error', msg || '添加失败！'))
  }
  onHide(){
    this.props.actions.hideDetailModal();
  }
}

var Main = React.createClass({
  getInitialState: function() {
    return {
      province_id: SELECT_DEFAULT_VALUE,
      city_id: SELECT_DEFAULT_VALUE,
      keywords: '', 
      page_size: 10,
    };
  },
  mixins: [LinkedStateMixin],
  render() {
    var { props, props: { state } } = this;
    var check = <span className="fa fa-check" /> ;
    var list = state.main.list.map(n => (
      <tr key={n.uuid} style={{cursor: 'pointer'}} onClick={this.viewDetail.bind(this, n.uuid)}>
        <td>{n.nick_name}</td>
        <td>{n.auth_id}</td>
        <td>{n.passworded ? check : undefined }</td>
        <td>{n.is_in_blackList == 1 ? check : '-'}</td>
        <td>{n.address}</td>
        <td>{n.birthday}</td>
        <td>{n.sex}</td>
      </tr>
    ))
    return (
      <div className="wrapper">
        <div className="form-inline">
          搜索：
          <Select
            className="space-right"
            default-text="省份"
            options={state.area.provinces}
            value={this.state.province_id}
            onChange={this.onProvinceChange}
          />
          <Select
            className="space-right"
            default-text="城市"
            options={state.area.cities}
            value={this.state.city_id}
            onChange={this.onCityChange}
          />
          <input valueLink={this.linkState('keywords')} type="text" className="form-control input-xs space-right" placeholder="用户名" />
          <button onClick={this.search.bind(this, 0)} className="btn btn-theme btn-xs space-right">搜索</button>
          <button onClick={this.exportExcel} className="btn btn-theme btn-xs">导出</button>
        </div>
        <p />
        <div className="panel">
          <div className="panel-heading">搜索结果</div>
          <table className="table table-bordered table-hover">
            <thead>
              <tr>
                <th>昵称</th>
                <th>用户名</th>
                <th>已设密码</th>
                <th>封禁</th>
                <th>所在地</th>
                <th>生日</th>
                <th>性别</th>
              </tr>
            </thead>
            <tbody>
              { tableLoader( state.main.loading, list ) }
            </tbody>
          </table>
          <div className="panel-footer" style={{backgroundColor: "#fff"}}>
            <Pagination
              page_no={state.main.page_no}
              total_count={state.main.total}
              page_size={this.state.page_size}
              onPageChange={this.serach}
            />
          </div>
        </div>
        {
          state.main.customer_info
            ? <DetailModal 
                {...state.main.customer_info}
                actions={props.actions}
                uuid={state.main.selected_uuid}
                callback={this.refresh}
              />
            : undefined
        }
      </div>
    )
  },
  componentDidMount(){
    this.props.actions.getCustomerList({
      page_no: this.props.state.main.page_no,
      page_size: this.state.page_size,
    });
    this.props.actions.getProvincesSignal('authority');
    LazyLoad('noty');
  },
  onProvinceChange(e){
    var {value} = e.target;
    this.props.actions.resetCities();
    this.setState({ province_id: value, city_id: SELECT_DEFAULT_VALUE });
    if(value != SELECT_DEFAULT_VALUE)
      this.props.actions.getCities(value);
  },
  onCityChange(e){
    var {value} = e.target;
    this.setState({city_id: value})
  },
  viewDetail(uuid){
    this.props.actions.getCustomerInfo(uuid);
    this.props.actions.getCustomerLogs({uuid, page_size: 10})
  },
  search(page){
    var { state } = this;
    this.props.actions.getCustomerList({
      province_id: state.province_id != SELECT_DEFAULT_VALUE ? state.province_id : undefined,
      city_id: state.city_id !=SELECT_DEFAULT_VALUE ? state.city_id : undefined,
      keywords: state.keywords || undefined,
      page_size: state.page_size,
      page_no: page === undefined ? 0 : page
    });
  },
  exportExcel(){
    var { state } = this;
    this.props.actions.exportCustomers({
      province_id: state.province_id != SELECT_DEFAULT_VALUE ? state.province_id : undefined,
      city_id: state.city_id !=SELECT_DEFAULT_VALUE ? state.city_id : undefined,
      keywords: state.keywords || undefined,
    });
  },
  refresh(){
    this.search(this.props.state.main.page_no);
  }
})

export default connect(
  ({ customerManage }) => ({ state: customerManage }),
  dispatch => ({ actions: bindActionCreators({...actions, ...area()}, dispatch) })
)(Main);