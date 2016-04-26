import React, {Component, PropTypes} from 'react';
import { render, findDOMNode } from 'react-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getValues, reduxForm } from 'redux-form';

import SearchInput from 'common/search_input';
import Select from 'common/select';
import Pagination from 'common/pagination';
import StdModal from 'common/std_modal';
import Alert from 'common/alert';
import LineRouter from 'common/line_router';
import { tableLoader } from 'common/loading';

import Autocomplete from './autocomplete';

import AreaActions from 'actions/area';
import * as StationsAction from 'actions/station_manage';

import { SELECT_DEFAULT_VALUE } from 'config/app.config';
import LazyLoad from 'utils/lazy_load';
import V from 'utils/acl';
import history from 'history_instance';
import { Noty } from 'utils/index';

class TopHeader extends Component {
  render(){
    return (
      <div className="clearfix top-header">
        <LineRouter className="pull-right"
          routes={[{name: '配送管理', link: '/sm/station'}, {name: '配送站管理', link: ''}]} />
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

  console.log(errors);
  // //errors为空对象才表明验证正确
  return errors;
};

class FilterHeader extends Component {
  constructor(props){
    super(props);
    this.search = this.search.bind(this);
    this.state = {
      search_ing :false
    }
  }
  render(){
    var {
      handleSubmit,
      fields: {
        name,
        province_id,
        city_id,
        regionalism_id,
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
          <Autocomplete ref="autocomplete" placeholder={'请输入配送站名称'} searchHandler={this.props.getStationByName}  list={name_list} className="pull-left"/>
          <Select {...province_id} className={`space-left space-right ${province_id.error}`} options={provinces} default-text="选择省份" onChange={this.onProvinceChange.bind(this, province_id.onChange)} ref="province"/>
          <Select {...city_id} className={`space-right ${city_id.error}`} options={cities} default-text="选择城市" onChange={this.onCityChange.bind(this, city_id.onChange)} ref="city"/>
          <Select {...regionalism_id} className={`space-right ${regionalism_id.error}`} options={districts} default-text="选择区域" ref="district"/>
          <button disabled={this.state.search_ing} onClick={handleSubmit(this.search)} className="btn btn-theme btn-xs">
            <i className="fa fa-search" style={{'padding': '0 5px'}}></i>
            查询
          </button>
          {
            V('StationManageAdd')
              ? <a href="javascript:;"onClick={this.addStation.bind(this)} className="pull-right btn btn-theme btn-xs">
                  添加配送站
                </a>
              : null
          }
        </div>
      </div>
    )
  }
  componentDidMount(){
    var { getProvinces, getAllStationsName, getStationList} = this.props;
    getProvinces();
    getStationList({isPage: true, page_no: 0, page_size: 10})
    getAllStationsName();
    LazyLoad('noty');
  }
  onProvinceChange(callback, e){
    var {value} = e.target;
    this.props.resetCities();
    if(value != this.refs.province.props['default-value'])
      var $city = $(findDOMNode(this.refs.city));
      this.props.getCities(value).done(() => {
        $city.trigger('focus'); //聚焦已使city_id的值更新
      });
    callback(e);
  }
  onCityChange(callback, e){
    var {value} = e.target;
    this.props.resetDistricts();
    if(value != this.refs.city.props['default-value'])
      var $district = $(findDOMNode(this.refs.district));
      this.props.getDistricts(value).done(() => {
        $district.trigger('focus'); //聚焦已使city_id的值更新
      });
    callback(e);
  }
  addStation(){
    history.push('/sm/station/add');
  }
  search(){
    setTimeout(() => {
      var { errors } = this.props;
      if(Object.keys(errors).length){
        Noty('warning', '请选择省份');
        return;
      }
      this.setState({search_ing: true});
      this.props.search({page_no: 0})
        .always(()=>{
          this.setState({search_ing: false});
        });
    }, 0);
  }
}

FilterHeader = reduxForm({
  form: 'station_manage_filter',
  fields: [
    'name',
    'province_id',
    'city_id',
    'regionalism_id',
  ],
  validate,
})( FilterHeader );

class StationRow extends Component{
  render(){
    var { props } = this;
    return (
      <tr ref="station_row">
        <td><input type="checkbox" checked={props.checked} onChange={this.checkStationHandler.bind(this)}/></td>
        <td>{props.province_name}</td>
        <td>{props.city_name}</td>
        <td>{props.regionalism_name}</td>
        <td>{props.name}</td>
        <td>{props.address}</td>
        <td>
          {
            this.ACL(
              <a onClick={this.editScope.bind(this)} key="StationManageEditScope" href="javascript:;">[ 查看配送区域 ] </a>,
              <a onClick={this.viewStationDetail.bind(this)} key="StationManageViewRemark" href="javascript:;" className="no-wrap"> [ 查看备注 ] </a>,
              <a onClick={this.editStation.bind(this)} key="StationManageEdit" href="javascript:;" className="no-wrap"> [ 编辑 ] </a>,
              <a onClick={this.viewDeleteStation.bind(this)} key="StationManageDelete" href="javascript:;" className="no-wrap"> [ 删除 ] </a>
            )
          }
        </td>
      </tr>
    )
  }
  ACL(){
    var results = [];
    for(var i=0,len=arguments.length; i<len; i++){
      var ele = arguments[i];
      if( V( ele.key ) ){
        results.push(arguments[i]);
      }
    }
    return results;
  }
  checkStationHandler(e){
    var { station_id, checkStationHandler } = this.props;
    checkStationHandler(station_id, e.target.checked);
  }
  editScope(e){
    history.push('/sm/scope/' + this.props.station_id);
    e.stopPropagation();
  }
  viewStationDetail(e){
    this.props.viewStationDetail(this.props);
    e.stopPropagation();
  }
  editStation(e){
    history.push('/sm/station/' + this.props.station_id);
    e.stopPropagation();
  }
  viewDeleteStation(e){
    this.props.viewDeleteStation(this.props);
    e.stopPropagation();
  }
}

class StationManagePannel extends Component {
  constructor(props){
    super(props);
    this.state = {page_size: 10,page_no:0};
    this.search = this.search.bind(this);
    this.onPageChange = this.onPageChange.bind(this);
    this.viewStationDetail = this.viewStationDetail.bind(this);
    this.viewDeleteStation = this.viewDeleteStation.bind(this);
    this.viewDeleteMultiStation = this.viewDeleteMultiStation.bind(this);
    this.checkStationHandler = this.checkStationHandler.bind(this);
    this.checkAllStationsHandler = this.checkAllStationsHandler.bind(this);
  }
  render(){
    var { loading, list, total, page_no, total,checked_station_ids } = this.props.stations;
    var { viewStationDetail, viewDeleteStation, checkStationHandler } = this;
    var content = list.map((n, i) => {
      return <StationRow ref="station_row" key={n.station_id}
        {...{...n, ...this.props, viewStationDetail, viewDeleteStation, checkStationHandler }} />
    });
    return (
      <div className="station-manage">
        <TopHeader/>
        <FilterHeader {...this.props} search={this.search} />

        <div className="panel">
          <header className="panel-heading">配送站列表</header>
          <div className="panel-body">
            <div className="table-responsive">
              <table ref="station_table" className="table table-hover text-center">
                <thead>
                <tr>
                  <th><input type="checkbox" onChange={this.checkAllStationsHandler}/></th>
                  <th>省份</th>
                  <th>城市</th>
                  <th>区域</th>
                  <th>配送站名称</th>
                  <th>详细地址</th>
                  <th>操作</th>
                </tr>
                </thead>
                <tbody>
                  { tableLoader(loading, content) }
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <Pagination 
          page_no={this.state.page_no}
          total_count={total} 
          page_size={this.state.page_size}
          onPageChange={this.onPageChange}/>

        <DeleteStationModal {...this.props} ref="del_station"/>
        <DeleteMultiStationModal {...this.props} ref="del_multi_station"/>
        <StationDetailModal ref="detail_station"/>

      </div>
    )
  }
  onPageChange(page){
    this.search({ page_no: page });
  }
  search(opts){
    var { getStationList, stations } = this.props;
    var { page_no, page_size } = this.state;
    //还有省市区数据实在redux-form中
    opts && typeof opts.page_no != undefined && this.setState({ page_no: opts.page_no });
    return getStationList({isPage: true, page_no, page_size, ...opts});
  }
  viewStationDetail(station){
    this.refs.detail_station.show(station);
  }
  viewDeleteStation(station){
    this.refs.del_station.show(station);
  }
  viewDeleteMultiStation(){
    this.refs.del_multi_station.show();
  }
  checkStationHandler(station_id, checked){
    this.props.checkStation(station_id, checked);
  }
  checkAllStationsHandler(e){
    this.props.checkAllStations(e.target.checked);
  }
} 


class DeleteStationModal extends Component{
  constructor(props){
    super(props);
    this.state = {
      name: '',
      station_id: '',
    }
    this.onConfirm = this.onConfirm.bind(this);
  }
  render(){
    return (
      <StdModal ref="modal" title="确认删除" onConfirm={this.onConfirm}>
        <p>请确认是否删除{this.state.name}所以数据</p>
      </StdModal>
    )
  }
  show(station){
    this.setState(station);
    this.refs.modal.show();
  }
  onConfirm(){
    var station_id = this.state.station_id;
    this.props.deleteStation(station_id);
    this.refs.modal.hide();
  }
}

class DeleteMultiStationModal extends Component{
  constructor(props){
    super(props);
    this.onConfirm = this.onConfirm.bind(this);
  }
  render(){
    return (
      <StdModal ref="modal" title="确认删除" onConfirm={this.onConfirm}>
        <p>请确认是否批量删除当前所以配送站数据</p>
      </StdModal>
    )
  }
  show(){
    this.refs.modal.show();
  }
  onConfirm(){
    this.refs.modal.hide();
    this.props.deleteMultiStation();
  }
}

class StationDetailModal extends Component{
  constructor(props){
    super(props);
    this.state = {
      id: '',
      name: '',
      phone: '',
      capacity: '',
    }
  }
  render(){
    var station = this.state;
    return (
      <StdModal title={station.name + '备注'} onConfirm={this.onConfirm.bind(this)} ref="modal">
        <p>联系方式：{station.phone}</p>
        <p>生成产能：{station.capacity}</p>
        <p>　　备注：{station.remarks}</p>
      </StdModal>
    )
  }
  onConfirm(){
    this.refs.modal.hide();
  }
  show(station){
    this.setState(station);
    this.refs.modal.show();
  }
}

function mapStateToProps({stationManage}){
  return stationManage;
}
function mapDispatchToProps(dispatch){
  return bindActionCreators({...AreaActions(),...StationsAction},dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(StationManagePannel);