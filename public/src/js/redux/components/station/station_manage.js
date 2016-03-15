import React, {Component, PropTypes} from 'react';
import { render, findDOMNode } from 'react-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { reduxForm } from 'redux-form';

import SearchInput from 'common/search_input';
import Select from 'common/select';
import Pagination from 'common/pagination';
import { tableLoader } from 'common/loading';
import history from 'history_instance';

import Autocomplete from './autocomplete';

import AreaActions from 'actions/area';
import StationScopeAction from 'actions/station_scope_manage';
// import * as StationAction from 'actions/station_manage';

import LazyLoad from 'utils/lazy_load';
import getTopHeader from '../top_header';

const TopHeader = getTopHeader([{name: '配送管理', link: '/sm/station'}, {name: '配送站管理', link: ''}]);

class FilterHeader extends Component {
  constructor(props){
    super(props);
    this.state = {
      search_ing :false
    }
  }

  render() {
    const {
      fields: {
        station_name,
        province_id,
        city_id,
        district_id,
      },
      area: {
        provinces,
        cities,
        districts,
      },
      station: {
        stations,
      },
    } = this.props;

    return (
      <div className="panel search">
        <div className="panel-body form-inline">
          <Autocomplete focusHandler={this.focusHandler}  placeholder={'请输入配送站名称'} searchHandler={this.props.getStationByName}  options={stations} className="pull-left"/>
          <Select {...province_id} options={provinces} no-default='true' onChange={this.onProvinceChange.bind(this, province_id.onChange)} ref="province" className="space-left space-right"/>
          <Select {...city_id} options={cities} no-default='true' onChange={this.onCityChange.bind(this, city_id.onChange)} ref="city" className="space-right"/>
          <Select {...district_id} options={districts} ref="district" className="space-right"/>
          <button disabled={this.state.search_ing} onClick={this.search.bind(this)} className="btn btn-theme btn-xs">
            <i className="fa fa-search" style={{'padding': '0 5px'}}></i>
            查询
          </button>
          <a className="pull-right btn btn-theme btn-xs">
            <i className="fa fa-plus-circle" style={{'padding': '0 5px'}}></i>
            添加
          </a>
        </div>
      </div>
    )
  }

  componentDidMount(){
    setTimeout(function(){
      var { getProvinces, getStations} = this.props;
      getProvinces();
      getStations();
      console.log('ok')
      LazyLoad('noty');
    }.bind(this),0)

    var intial_province_id = '110000';
    var intial_city_id = '110000';
    $(findDOMNode(this.refs.province)).children('option[value=' + intial_province_id + ']').attr('selected', 'true');
    var $city = $(findDOMNode(this.refs.city));
    this.props.getCities(intial_province_id);
    
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
  search(){
    var city_id = $(findDOMNode(this.refs.city)).children('option:selected').attr('value');
    this.setState({search_ing: true});
    this.props.getStationByCity(city_id).always(()=>{
      this.setState({search_ing: false});
    });
  }
}

FilterHeader = reduxForm({
  form: 'station_manage',
  fields: [
    'province_id',
    'city_id',
    'district_id',
  ]
})( FilterHeader );


class StationRow extends Component {
  render() {
    const thisProps = this.props;
    const { station_id } = thisProps;
    return (
      <tr>
        <td><input type="checkbox" /></td>
        <td>{thisProps.province_id}</td>
        <td>{thisProps.city_id}</td>
        <td>{thisProps.district_id}</td>
        <td>{thisProps.station_name}</td>
        <td>{thisProps.address}</td>
        <td>
        <a href="javascript:;" onClick={this.editScope}>[编辑配送区域]</a>
        <a href="javascript:;" onClick={this.viewDetail} className="no-wrap">[查看备注]</a>
        <a href="javascript:;" onClick={this.editStation} className="no-wrap">[编辑]</a>
        <a href="javascript:;" onClick={this.deleteStation} className="no-wrap">[删除]</a>
        </td>
      </tr>
    )
  }
  editScope(e) {
    e.stopPropagation();
    history.push('/sm/station' + this.props.station_id);
  }
  viewDetail(){}
  editStation(){}
  deleteStation(){}
}

const StationManagePannel = props => {
  return (
    <div className="station-manage">
      <TopHeader/>
      <FilterHeader {...props}/>
       <div className="panel">
        <header className="panel-heading">送货列表</header>
        <div className="panel-body">
          <div className="table-responsive">
            <table className="table table-hover text-center">
              <thead>
              <tr>
                <th></th>
                <th>省份</th>
                <th>城市</th>
                <th>区域</th>
                <th>配送站名称</th>
                <th>详细地址</th>
                <th>操作</th>
              </tr>
              </thead>
              <tbody>
                {
                  props.station.station_list_info.map((n, i) => (
                    <StationRow key={n.id} {...props} />
                  ))
                }
              </tbody>
            </table>
          </div>
          <button className="btn btn-theme btn-xs">
            <i className="fa fa-minus-square" style={{padding: '0 5px'}}></i>
            删除
          </button>
        </div>
      </div>
    </div>
  )
}

const mapStateToProps = ({ stationManage }) => stationManage;

/* 这里可以使用 bindActionCreators , 也可以直接写在 connect 的第二个参数里面（一个对象) */
const mapDispatchToProps = dispatch => bindActionCreators({...AreaActions(), ...StationScopeAction()},dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(StationManagePannel);