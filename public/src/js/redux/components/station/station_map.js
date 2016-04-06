import React , { Component, PropTypes } from 'react';
import { render, findDOMNode } from 'react-dom';
import MyMap from 'utils/create_visiable_map';

export default class StationMap extends Component {
  render(){
    return (
      <div className="panel">
        <div className="panel-body" ref="map" id="stationMap">
        </div>
        <hr/>
      </div>
    );
  }
  componentDidMount() {
    var self = this;
    MyMap.create();
    setTimeout(() => {
      self.initScope();
    }, 1500);
  }
  initScope(city, address){
    var { coords, city, capacity, phone, name, station_id, address } = this.props;
    var station_info = {
      name: name.defaultValue,
      phnoe: phone.defaultValue, 
      address: address.defaultValue
    };
    MyMap.drawScope(coords.defaultValue);
    if(typeof station_info.name === 'string'){
      MyMap.locationCenter(city, address.defaultValue, station_info)
    }
  }
  saveStationScope(){
    return MyMap.saveStationScope();
  }
  stopEditScope(){
    MyMap.stopEditScope();
  }
  editScope(){
    MyMap.editScope();
  }
  addScope(city, address){
    var { name, address} = this.props;
    if(!name.defaultValue){
      name.defaultValue = '配送站地址'
      MyMap.locationCenter(city, address.value, {name: name.defaultValue, address: address.value});
      MyMap.createNewScope();
    }
  }
}