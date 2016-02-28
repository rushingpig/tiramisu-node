import React from 'react';
import { render, findDOMNode } from 'react-dom';
import { bindActionCreators } from 'redux';
import { reduxForm } from 'redux-form';
import { connect } from 'react-redux';

import LineRouter from 'common/line_router';
import SearchInput from 'common/search_input';
import Select from 'common/select';

import AreaActions from 'actions/area';
import StationAction from 'actions/stations';
class TopHeader extends React.Component {
  render(){
    return (
      <div className="clearfix top-header">
        <LineRouter 
          routes={[{name: '配送管理', link: '/sm/index'}, {name: '配送站管理', link: ''}]} />
      </div>
    );
  }
}

class StationRow extends React.Component {
  render(){
    var list = this.props.stationList;
    var content = list.map(n => (
      <tr key={n.id}>
        <th>
          <input type="checkbox" />
        </th>
        <th>
          {n}
        </th>
        <th>
          {n.station_name}
        </th>
        <th>
          {n.address}
        </th>
        <th>
          <a href="">编辑</a>
        </th>
      </tr>
    ));

    return (
      <div className="panel">
        <header className="panel-heading">送货列表</header>
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
        </div>
      </div>
    );
  }
}

class AutoComplete extends React.Component {
  constructor(props){
    super(props);
  }

  keyDownHandler(e){
    //enter键
    if(!this.props.searching && e.which == 13){
      this.searchHandler();
    }
  }

  searchHandler(){
    if(!this.props.searching){
      console.log('search: ' + this.refs.input.value);
      this.props.searchHandler(this.refs.input.value);
    }
  }

  filter(e){
    var stations = this.props.options;
    var matches = [];
    console.log(stations[0]);
    stations.map(function(item,index){
      var sign = item.text.indexOf(e.target.value);
      if(sign !== -1){
        matches.push(item.text);
      }
    });

  }

  render(){
    var { options, className, options, placeholder, searching } = this.props;
    var i_className = searching ? 'fa fa-spinner fa-spin disabled' : 'fa fa-search';
    return (
      <input ref="input" 
        className={className} 
        placeholder={placeholder} 
        style={{marginRight: '5px'}}
        onChange={this.filter.bind(this)}
        onKeyDown={this.keyDownHandler.bind(this)} />
    );
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
        stationsOfCity,
      },
    } = this.props;
    var { search_ing } = this.state;
    return (
      <div className="form-inline">
        <AutoComplete {...station_id} placeholder={"请输入配送站"} className="form-control input-xs v-mg" options={stations} />
        <Select {...province_id} onChange={this.onProvinceChange.bind(this, province_id.onChange)} options={provinces} ref="province" default-text="选择省份" className="space-right"/>
        <Select ref="city" {...city_id} options={cities} default-text="选择城市" className="space-right"/>
        <button disabled={search_ing} data-submitting={search_ing} onClick={this.search.bind(this)} className="btn btn-theme btn-xs">
          查找<i className="fa fa-search" style={{'padding': '0 3px'}}></i>
        </button>
        <StationRow stationList={stationsOfCity}/>
      </div>
    );
  }
  componentDidMount(){
    setTimeout(function(){
      var { getProvinces, getAllDeliveryStations, getStations,getStationByCity} = this.props;
      getProvinces();
      getStations();
      LazyLoad('noty');
    }.bind(this),0)
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
    var { getStationByCity } = this.props;
    // this.setState({search_ing: true});
    getStationByCity(city_id);

    console.log(this.props.stationsOfCity);
  }
}


FilterHeader = reduxForm({
  form: 'station_manage',
  fields: [
    'province_id',
    'city_id',
  ]
})( FilterHeader );

				

class StationManagePanel extends React.Component{
  render(){
    return (
      <div>
        <TopHeader/>
        <FilterHeader {...this.props }/>
      </div>
    )
  }

}
function mapStateToProps({stationManage}){
  return stationManage;
}

/* 这里可以使用 bindActionCreators , 也可以直接写在 connect 的第二个参数里面（一个对象) */
function mapDispatchToProps(dispatch){
  return bindActionCreators({...AreaActions(), ...StationAction()}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(StationManagePanel);