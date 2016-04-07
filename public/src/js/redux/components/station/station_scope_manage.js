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
import history from 'history_instance';

import Autocomplete from './autocomplete';

import AreaActions from 'actions/area';
import * as StationsAction from 'actions/station_manage';
import * as StationFormActions from 'actions/station_manage_form';

import { SELECT_DEFAULT_VALUE } from 'config/app.config';
import LazyLoad from 'utils/lazy_load';
import Noty from 'utils/_noty';
import MyMap from 'utils/station_group_scope';

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
      },
      area: {
        provinces,
        cities,
      },
      stations: {
        name_list,
      },
    } = this.props;

    return (
      <div className="panel search">
        <div className="panel-body form-inline">
          <Autocomplete ref="autocomplete" placeholder={'请输入配送站名称'} searchHandler={this.props.getStationByName}  list={name_list} className='pull-left'/>
          <Select {...province_id} options={provinces} default-text="选择省份" onChange={this.onProvinceChange.bind(this, province_id.onChange)} ref="province" className={`space-left space-right ${city_id.error}`}/>
          <Select {...city_id} options={cities} default-text="选择城市" ref="city" className={`space-right ${city_id.error}`}/>
          <button disabled={this.state.search_ing} onClick={handleSubmit(this.search)} className="btn btn-theme btn-xs">
            <i className="fa fa-search" style={{'padding': '0 5px'}}></i>
            查询
          </button>
        </div>
      </div>
    )
  }
  componentDidMount(){
    var { getProvinces, getAllStationsName, getStationList} = this.props;
    getProvinces();
    var {params ,getStationListById} = this.props;
    if(params && params.id){
      getStationListById(params.id)
    }else{
      getStationList({page_no: 0, page_size: 10})
    }
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
  search(){
    setTimeout(() => {
      var { errors } = this.props;
      if(Object.keys(errors).length){
        Noty('warning', '请选择城市');
        return;
      }
      this.setState({search_ing: true});
      this.props.getStationList({page_no: 0, page_size: 10})
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
  ],
  validate,
})( FilterHeader );

class StationRow extends Component{
  constructor(props){
    super(props);
    this.state = {actived: false};
    this.editScope = this.editScope.bind(this);
    this.closeActive = this.closeActive.bind(this);
    this.checkStationHandler = this.checkStationHandler.bind(this);
    this.doubleClickHandler = this.doubleClickHandler.bind(this);
  }
  render(){
    var { props } = this;
    return (
      <tr ref="station_row" className={this.state.actived ? 'active':''} >
        <td><input type="checkbox" checked={props.checked}  onChange={this.checkStationHandler}/></td>
        <td>{props.regionalism_name}</td>
        <td>{props.name}</td>
        <td>{props.address}</td>
        <td>
          <a onClick={this.editScope} href="javascript:;">{props.coords?'[ 编辑配送区域 ]': '[ 添加配送区域 ]'}</a>
        </td>
      </tr>
    )
  }
  componentWillReceiveProps(nextProps) {
    if(!nextProps.editable){
      this.setState({
        actived: nextProps.editable
      });
    }
  }
  checkStationHandler(e){
    const { station_id, checkStationHandler } = this.props;
    checkStationHandler(station_id, e.target.checked);
  }
  editScope(e){
    const { station_id, editable, openEdit, closeEdit,editStationScope } = this.props;
    this.setState({actived: !editable});
    openEdit(editable);
    editStationScope(station_id);
    e.stopPropagation();
  }
  closeActive(){
    this.setState({actived: false});
  }
  doubleClickHandler(){
    const { station_id, name, address, city_name } = this.props;
    MyMap.centerAndZoomStation(name, city_name, address);
  }
}

class StationManagePannel extends Component {
  constructor(props){
    super(props);
    this.state = {page_size: 10,page_no:0};
    this.search = this.search.bind(this);
    this.closeActive = this.closeActive.bind(this);
    this.onPageChange = this.onPageChange.bind(this);
    this.checkStationHandler = this.checkStationHandler.bind(this);
    this.checkAllStationsHandler = this.checkAllStationsHandler.bind(this);
    this.editStationScope = this.editStationScope.bind(this);
  }
  render(){
    var { list, total, page_no, total,checked_station_ids, editable } = this.props.stations;
    var { openEdit, closeEdit, putMultipleStationScope } = this.props;
    var { viewStationDetail, viewDeleteStation, checkStationHandler, editStationScope, closeActive } = this;
    var content = list.map((n, i) => {
      return <StationRow ref="station_row" key={n.station_id}
        {...{...n, ...this.props, editable, openEdit, closeEdit, viewStationDetail, viewDeleteStation, checkStationHandler, editStationScope }} />
    });    
    return (
      <div className="station-manage">
        <TopHeader/>
        <FilterHeader {...this.props}/>
        <div className="row">
          <div className="col-md-5">
            <div className="panel">
              <header className="panel-heading">送货列表</header>
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
                      {content}
                    </tbody>
                  </table>
                </div>

                <Pagination 
                  page_no={this.state.page_no}
                  total_count={total} 
                  page_size={this.state.page_size}
                  onPageChange={this.onPageChange}/>
              </div>
            </div>
          </div>
          <div className="col-md-7">
            <StationGroupMap ref="stationGroupMap" 
              list={list}
              openEdit={openEdit} 
              closeEdit={closeEdit}
              closeActive={closeActive}
              putMultipleStationScope={putMultipleStationScope} 
              editable={editable}/>
          </div>
        </div>
      </div>
    )
  }
  onPageChange(page){
    this.setState({
      page_no: page
    });
    this.search(page);
  }
  search(page){
    var { getStationList, stations } = this.props;
    getStationList({page_no: page, page_size: this.state.page_size});
  }
  checkStationHandler(station_id, checked){
    this.props.checkStation(station_id, checked);
  }
  checkAllStationsHandler(e){
    this.props.checkAllStations(e.target.checked);
  }
  editStationScope(station_id){
    this.refs.stationGroupMap.editStationScope(station_id);
  }
  closeActive(){
    this.refs.station_row.closeActive();
  }
} 

class StationGroupMap extends Component {
  constructor(props){
    super(props);
    this.state = {
      list: [],

    };
    this.stopEditScope = this.stopEditScope.bind(this);
    this.saveNewScope = this.saveNewScope.bind(this);
  }
  render(){
    return (
      <div className="panel">
        <div className="panel-heading">
          <button disabled={this.props.editable?'':'disabled'} onClick={this.stopEditScope} className="btn btn-theme btn-xs" style={{"marginRight": "35px"}}>停止当前修改</button>
          <button onClick={this.saveNewScope} className="btn btn-theme btn-xs">保存并提交</button>
        </div>``
        <div className="panel-body">
          <div ref="map" id="stationMap"/>
        </div>
      </div>
    );
  }
 
  componentDidMount(){
    MyMap.create();
  }
  componentWillUnmount() {
    MyMap.reset();
  }
  componentWillReceiveProps(nextProps) {
    if(nextProps.list !== this.state.list){
      this.setState({
        list: nextProps.list 
      });
    }
  }
  componentDidUpdate (prevProps) {
    if(prevProps.list !== this.state.list){
      MyMap.reset();
      MyMap.list = this.state.list;
      setTimeout(() => {
        MyMap.initialScope();
      },1000)
    }
  }
  editStationScope(station_id){
    if(MyMap.onEditIndex == -1){
      MyMap.enableEdit(station_id);
    }else{
      Noty('warning','请确定已停止当前修改操作或已提交');
    }
  }
  stopEditScope(){
    if(MyMap.onEditIndex === -1){return;}
    const { editable, closeEdit, closeActive } = this.props;
    closeEdit();
    closeActive();
    MyMap.getPath();
    MyMap.onEditIndex = -1;
  }
  saveNewScope(){
    var self = this;
    var { putMultipleStationScope } = this.props;
    var data = this.state.list.map(n => {
      let id = n.station_id;
      let coords = n.coords;
      return {id: id, coords: coords};
    });
    putMultipleStationScope(data)
    .done(function(){
        Noty('success', '保存成功');
        MyMap.initialScope();
      })
    .fail(function(msg, code){
      Noty('error', msg || '保存异常');
    });
  }
}

function mapStateToProps({stationManage}){
  return stationManage;
}
function mapDispatchToProps(dispatch){
  return bindActionCreators({...AreaActions(),...StationsAction,...StationFormActions},dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(StationManagePannel);
