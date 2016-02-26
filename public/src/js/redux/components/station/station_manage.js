import React from 'react';
import ReactDom from 'react-dom';
import { bindActionCreators } from 'redux';
import { reduxForm } from 'redux-form';
import { connect } from 'react-redux';

import LineRouter from 'common/line_router';
import SearchInput from 'common/search_input';
import Select from 'common/select';

import AreaActions from 'actions/area';

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
    var content = this.props.stationList.map(n => (
      <tr key={n.id}>
        <th>
          <input type="checkbox" />
        </th>
        <th>
          {n.district_name}
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
class FilterHeader extends React.Component{
 

  render(){
    var { 
      fields: {
        province_id,
        city_id,
      },
      area:{
        provinces,
        cities,
      }
    } = this.props;
    return (
      <div className="form-inline">
        <SearchInput placeholder="请输入您要查询的配送站" className="pull-left"/>
        <Select {...province_id} onChange={this.onProvinceChange.bind(this, province_id.onChange)} options={[provinces]} ref="province" default-text="选择省份" className="space-right"/>
        <Select {...city_id} options={cities} default-text="选择城市" ref="city" className="space-right"/>
        <button className="btn btn-sm btn-theme">查找<i className="fa fa-search" style={{paddingLeft:'5px'}}></i></button>
        <StationRow stationList={[{district_name:'jks',station_name:'dsf',address:'sdf',id:'100'}]}/>
      </div>
    );
  }

  componentDidMount(){
    setTimeout(function(){
      var { getProvinces, getAllDeliveryStations } = this.props;
      getProvinces();
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
  return bindActionCreators({...AreaActions()}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(StationManagePanel);