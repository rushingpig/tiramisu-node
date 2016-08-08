import React, {Component, PropTypes} from 'react';
import { render, findDOMNode } from 'react-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { reduxForm } from 'redux-form';

import SearchInput from 'common/search_input';
import Select from 'common/select';
import Pagination from 'common/pagination';
import StdModal from 'common/std_modal';
import Alert from 'common/alert';
import LineRouter from 'common/line_router';
import { tableLoader } from 'common/loading';
import showMessageBox from 'common/message_box';
import AddressSelector from 'common/address_selector';
import history from 'history_instance';

import Autocomplete from './autocomplete';
import StationMapGroup from './station_map_group';

import AreaActions from 'actions/area';
import * as StationsAction from 'actions/station_manage';
import * as StationFormActions from 'actions/station_manage_form';
import { triggerFormUpdate, resetFormUpdate } from 'actions/form';

import { SELECT_DEFAULT_VALUE, ADDRESS } from 'config/app.config';
import LazyLoad from 'utils/lazy_load';
import {Noty, url} from 'utils/index';
import MyMap from 'utils/station_group_scope';
import V from 'utils/acl';

class TopHeader extends Component {
  render(){
    return (
      <div className="clearfix top-header">
        <LineRouter className="pull-right"
          routes={[{name: '配送管理', link: '/sm/station'}, {name: '配送站区域管理', link: ''}]} />
      </div>
    )
  }
}

const validate = (values, props) => {
  const errors = {};
  var msg = 'error';
  var { form } = props;
  function _v(key){
    // touched 为true 表示用户点击处理过
    if (!values[key])
      errors[key] = msg;
  }
  function _v_selsect(key){
    if(form[key] && form[key].touched && (!values[key] || values[key] == SELECT_DEFAULT_VALUE))
      errors[key] = msg;
  }
  // _v_selsect('province_id');
  _v_selsect('city_id');

  console.log(errors);
  // //errors为空对象才表明验证正确
  return errors;
};

class FilterHeader extends Component {
  constructor(props){
    super(props);
    this.search = this.search.bind(this);
    this.state = {
      search_ing :false,
      station_name: '',
      // address_data: {},
    };
    // this.AddressSelectorHook = this.AddressSelectorHook.bind(this);
  }
  render(){
    var {
      handleSubmit,
      fields: {
        // name,
        province_id,
        city_id,
        district_id,
      },
      area: {
        provinces,
        cities,
        districts,
      },
      stations: {
        name_list,
      },
    } = this.props;

    return (
      <div className="panel search">
        <div className="panel-body form-inline">
          <Autocomplete value={this.state.station_name} ref="autocomplete" placeholder={'请输入配送站名称'} onChange={this.stationInputHandler.bind(this)} list={name_list} className='pull-left space-right'/>
          <AddressSelector
            {...{ province_id, city_id, district_id, provinces, cities, districts, actions: this.props,
             AddressSelectorHook: this.AddressSelectorHook, form: 'station_scope_manage_filter' }}
          />
          <button disabled={this.state.search_ing} data-submitting={this.state.search_ing} onClick={handleSubmit(this.search)} className="btn btn-theme btn-xs">
            <i className="fa fa-search" style={{'padding': '0 5px'}}></i>
            查询
          </button>
        </div>
      </div>
    )
  }
  componentDidMount(){
    var { getAllStationsName, getStationListByScopeSignal, params ,getStationListById } = this.props;
    if(params && params.id){
      getStationListById(params.id);
    }else{
      this.search();
    }
    getAllStationsName();
    LazyLoad('noty');
  }
  stationInputHandler(station_name){
    this.setState({ station_name })
  }
  // AddressSelectorHook(e, data){
  //   this.setState({ address_data: data });
  // }
  search(){
    setTimeout(() => {
      var { station_name } = this.state;
      var { errors, fields: {province_id, city_id, district_id} } = this.props;
      if(Object.keys(errors).length){
        Noty('warning', '请选择城市');
        return;
      }
      this.setState({search_ing: true});
      var data = {
        isPage: false,
        station_name: station_name || undefined,
        province_id: province_id.value == SELECT_DEFAULT_VALUE ? undefined : province_id.value,
        city_id: city_id.value == SELECT_DEFAULT_VALUE ? undefined : city_id.value,
        is_standard_area: 1
      };
      if(district_id.value && district_id.value != SELECT_DEFAULT_VALUE){
        data.city_id = district_id.value;
        // delete data.is_standard_area; 禁止用删除
        data.is_standard_area = 0;
      }

      this.props.getStationListByScopeSignal(data).always(()=>{
        this.setState({search_ing: false});
      });
    }, 0);
  }
}

FilterHeader = reduxForm({
  form: 'station_scope_manage_filter',
  fields: [
    'province_id',
    'city_id',
    'district_id'
  ],
  //注意这里的初始化，移到了 FilterHeader 的props上
  // initialValues: {
  //   province_id: ADDRESS.GUANG_ZHOU,
  //   city_id: ADDRESS.SHEN_ZHENG
  // },
  // validate,
})( FilterHeader );

class StationRow extends Component{
  constructor(props){
    super(props);
    this.state = {
      added: false, //是否已点击添加配送区域
    }
    this.editScope = this.editScope.bind(this);
    this.viewScope = this.viewScope.bind(this);
    this.shareScope = this.shareScope.bind(this);
    this.checkStationHandler = this.checkStationHandler.bind(this);
  }
  render(){
    var { props } = this;
    return (
      <tr className={props.active_station_id == props.station_id ? 'active':''} >
        <td><input type="checkbox" checked={props.checked}  onChange={this.checkStationHandler}/></td>
        <td>{props.regionalism_name}</td>
        <td>{props.name}</td>
        <td>{props.address}</td>
        <td className="text-left">
          {
            V('StationScopeManageView') &&
            <a onClick={this.viewScope} href="javascript:;" className="nowrap">[ 查看 ] </a>
          }
          <a onClick={this.editScope} href="javascript:;" className="nowrap">
            { props.coords || this.state.added
                ? V('StationScopeManageEdit') && '[ 编辑 ]'
                : V('StationScopeManageAdd') && '[ 添加 ]'
            }
          </a>
          {
            V('StationScopeManageView') &&
            <a onClick={this.shareScope} href="javascript:;" className="nowrap">
              { props.coords || this.state.added
                  ? ' [ 分享 ]'
                  : null
              }
            </a>
          }
        </td>
      </tr>
    )
  }
  checkStationHandler(e){
    var { station_id, checkStationHandler } = this.props;
    checkStationHandler(station_id, e.target.checked);
  }
  editScope(){
    var { station_id, editStationScope } = this.props;
    editStationScope(station_id);
    this.setState({ added: true }); //主要考虑到添加之后，这个按钮的功能应该转换为编辑，
  }
  viewScope(){
    this.props.viewStationScope( this.props );
  }
  shareScope(){
    showMessageBox({
      title: '链接',
      text: location.origin + '/sm/scope_s/' + this.props.station_id
    })
  }
}

class StationManagePannel extends Component {
  constructor(props){
    super(props);
    this.state = {page_size: 10,page_no:0};
    this.closeActive = this.closeActive.bind(this);
    this.onPageChange = this.onPageChange.bind(this);
    this.checkStationHandler = this.checkStationHandler.bind(this);
    this.checkAllStationsHandler = this.checkAllStationsHandler.bind(this);
    this.editStationScope = this.editStationScope.bind(this);
    this.viewStationScope = this.viewStationScope.bind(this);
  }
  render(){
    var { loading, list, total, page_no, total, checked_station_ids, active_station_id } = this.props.stations;
    var { activeStation, unactiveStation, putMultipleStationScope } = this.props;
    var { viewStationScope, checkStationHandler, editStationScope, closeActive,
      state: { page_no, page_size } } = this;
    var content = list.slice(page_no * page_size, (page_no + 1) * page_size).map((n, i) => {
      return <StationRow key={n.station_id}
        {...{...n, ...this.props, active_station_id, viewStationScope, checkStationHandler, editStationScope }} />
    });
    var loc = url.parse( location.search || '');
    var initialValues = {province_id: ADDRESS.GUANG_ZHOU, city_id: ADDRESS.SHEN_ZHENG };
    if(this.props.params && this.props.params.id){
      initialValues = {province_id: loc.province_id || undefined, city_id: loc.city_id || undefined };
    }
    return (
      <div className="station-manage">
        <TopHeader/>
        <FilterHeader {...this.props} initialValues={initialValues} />
        <div className="row">
          <div className="col-md-5">
            <div className="panel">
              <header className="panel-heading">配送站列表</header>
              <div className="panel-body">
                <div className="table-responsive">
                  <table ref="station_table" className="table table-hover text-center">
                    <thead>
                    <tr>
                      <th><input type="checkbox" onChange={this.checkAllStationsHandler}/></th>
                      <th>区域</th>
                      <th>配送站名称</th>
                      <th>详细地址</th>
                      <th>操作</th>
                    </tr>
                    </thead>
                    <tbody>
                      {tableLoader(loading, content)}
                    </tbody>
                  </table>
                </div>

                <Pagination 
                  page_no={this.state.page_no}
                  total_count={total} 
                  page_size={this.state.page_size}
                  onPageChange={this.onPageChange}
                />
              </div>
            </div>
          </div>
          <div className="col-md-7">
            <StationMapGroup ref="stationMapGroup" 
              list={list}
              closeActive={closeActive}
              putMultipleStationScope={putMultipleStationScope} 
            />
          </div>
        </div>
      </div>
    )
  }
  onPageChange(page){
    this.setState({
      page_no: page
    });
  }
  checkStationHandler(station_id, checked){
    this.props.checkStation(station_id, checked);
  }
  checkAllStationsHandler(e){
    this.props.checkAllStations(e.target.checked);
  }
  viewStationScope(station_data){
    this.props.activeStation( station_data.station_id );
    this.refs.stationMapGroup.viewStationScope(station_data);
  }
  editStationScope(station_id){
    this.props.activeStation( station_id );
    //编辑时，传入station_id到stationMapGroup
    this.refs.stationMapGroup.editStationScope(station_id);
  }
  closeActive(station_id){
    this.props.unactiveStation();
  }
}

function mapStateToProps({stationManage}){
  return stationManage;
}
function mapDispatchToProps(dispatch){
  return bindActionCreators({...AreaActions(),...StationsAction,...StationFormActions},dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(StationManagePannel);
