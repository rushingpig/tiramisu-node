import React, { PropTypes } from 'react';
import { render, findDOMNode } from 'react-dom';
import ReactDom from 'react-dom';
import { bindActionCreators } from 'redux';
import { reduxForm } from 'redux-form';
import { connect } from 'react-redux';

import Pagination from 'common/pagination';
import StdModal from 'common/std_modal';
import LineRouter from 'common/line_router';
import SearchInput from 'common/search_input';
import Select from 'common/select';

import AreaActions from 'actions/area';
import StationAction from 'actions/station_scope_manage';

import LazyLoad from 'utils/lazy_load';

class TopHeader extends React.Component {

  render(){
    return (
      <div className="clearfix top-header">
        <LineRouter 
          routes={[{name: '配送管理', link: '/sm/index'}, {name: '配送站管理', link: ''}]} />
      </div>
    );
  };
}

class StationRow extends React.Component {

  render(){
    var list = this.props.stationList;
    var content = list.map(n => (
      <tr key={n.id}>
        <td><input type="checkbox" /></td>
        <td>{n.district_name}</td>
        <td ref="station_name">{n.station_name}</td>
        <td>{n.address}
        </td>
        <td>
          <a href="javascript:;" id={n.id} ref="edit" onClick={this.stationScopeEdit.bind(this)}>编辑</a>
        </td>
      </tr>
    ));

    return (
      <div className="">
        <div className="panel">
          <header className="panel-heading">配送站列表</header>
          <div className="panel-body">
            <div className="table-responsive">
              <table className="table table-hover text-center">
                <thead>
                <tr>
                  <th><input type="checkbox" /></th>
                  <th>区域</th>
                  <th>名称</th>
                  <th>地址</th>
                  <th>操作</th>
                </tr>
                </thead>
                <tbody>
                { content }
                </tbody>
              </table>
            </div>

            <Pagination/>
          </div>
        </div>

        <MapModal ref="map" size="lg" title="编辑配送站范围"  />
      </div>
    );
  }

  stationScopeEdit(){
    var { getStationScope } = this.props;
    var station_id = $(findDOMNode(this.refs.edit)).attr('id');
    var station_name = $(findDOMNode(this.refs.station_name)).text();

    getStationScope(station_id,{'station_name':station_name})
    this.refs.map.show();
  }
  
}

class FilterHeader extends React.Component{
  constructor(props){
    super(props);
    this.state = {
     search_ing: false,
    }
  }
  render(){
    var { 
      fields: {
        province_id,
        city_id,
        station_id
      },
      area:{
        provinces,
        cities,
      },
      station: {
        stations,
        station_list_info,
      },
    } = this.props;
    var { search_ing } = this.state;
    return (
      <div className="panel search">
        <div className="panel-body form-inline">
          <input ref="inp" {...station_id} onFocus={this.focusHandler.bind(this)} placeholder={"请输入配送站"} className="form-control input-xs v-mg" style={{marginRight: '5px'}} options={stations} />
          <Select {...province_id} onChange={this.onProvinceChange.bind(this, province_id.onChange)} options={provinces} ref="province" default-text="选择省份" className="space-right"/>
          <Select ref="city" {...city_id} options={cities} default-text="选择城市" className="space-right"/>
          <button disabled={search_ing} data-submitting={search_ing} onClick={this.search.bind(this)} className="btn btn-theme btn-xs">
            查找<i className="fa fa-search" style={{'padding': '0 3px'}}></i>
          </button>
          <StationRow stationList={station_list_info} {...this.props }/>
        </div>
      </div>
    );
  }
  componentDidMount(){
    setTimeout(function(){
      var { getProvinces, getAllDeliveryStations, getStations,getStationByCity} = this.props;
      getProvinces();
      getStations();
      LazyLoad('noty');
    }.bind(this),0);
  }

  focusHandler(){
    var $inp = $(findDOMNode(this.refs.inp));
    var data = this.props.station.stations;
    var stations = [];
    data.forEach(function(n){
      stations.push(n['text']);
    });
    LazyLoad('autocomplete', () => {
      console.log('asnfostganeoganrsdgnaren');
      $inp.autocomplete({
        source: stations
      });
    });
  }

  searchHandler(){

  }

  onProvinceChange(callback, e){
    var {value} = e.target;
    this.props.provinceReset();
    if(value != this.refs.province.props['default-value'])
      var $city = $(findDOMNode(this.refs.city));
      this.props.getCities(value).done(() => {
        $city.trigger('focus'); //聚焦已使city_id的值更新
      });
    callback(e);
  }

  search(){
    var city_id = $(findDOMNode(this.refs.city)).children('option:selected').attr('value');
    this.setState({search_ing: true});
    this.props.getStationByCity(city_id)
      .always(()=>{
        this.setState({search_ing: false});
      });
  }

}

FilterHeader = reduxForm({
  form: 'station_scope_manage',
  fields: [
    'province_id',
    'city_id',
  ]
})( FilterHeader );

				

class stationScopeManagePannel extends React.Component{
  render(){
    return (
      <div>
        <TopHeader/>
        <FilterHeader {...this.props }/>
      </div>
    )
  }

}
function mapStateToProps({stationScopeManage}){
  return stationScopeManage;
}

/* 这里可以使用 bindActionCreators , 也可以直接写在 connect 的第二个参数里面（一个对象) */
function mapDispatchToProps(dispatch){
  return bindActionCreators({...AreaActions(), ...StationAction()}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(stationScopeManagePannel);




/***************   *******   *****************/
/***************   子模态框   *****************/
/***************   *******   *****************/

class MapModal extends React.Component {
  render(){
    return (
      <StdModal ref="modal" title="批量转换操作">
        <MapScope/>
      </StdModal>
    )
  }
  show(){
    this.refs.modal.show();
  }
  hide(){
    this.refs.modal.hide();
  }
};


class MapScope extends React.Component {
  render(){
    return (
      <div ref="map">
      </div>
    );
  }

}