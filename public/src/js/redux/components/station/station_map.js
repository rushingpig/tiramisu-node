import React , { Component, PropTypes } from 'react';
import { render, findDOMNode } from 'react-dom';
import MyMap from 'utils/create_visiable_map';
import { once } from 'utils/index';

export default class StationMap extends Component {
  constructor(props){
    super(props);
    this.state = {
      mapPrepared: false,
    }
    this.initScope = this.initScope.bind(this);
  }
  render(){
    return (
      <div className="panel">
        <div className="panel-body" ref="map" id="stationMap">
        </div>
        <hr/>
      </div>
    );
  }
  componentWillReceiveProps(nextProps){
    // 编辑状态 且 假设 若地址存在 则代表以获取到数据，可以初始化了
    if(nextProps.editable && nextProps.address.defaultValue && !this._has_init){
      this._has_init = true;
      this.initScope();
    }
  }
  componentDidMount() {
    MyMap.create(() => {
      this.setState({ mapPrepared: true });
      MyMap.drawScope(this.props.coords.defaultValue);
    });
  }
  initScope(){
    this._map_load_timer = setInterval(() => {
      if( this.state.mapPrepared ){
        MyMap.drawScope(this.props.coords.defaultValue);
        clearInterval(this._map_load_timer);
      }
    }, 100)
  }
  saveStationScope(){
    return MyMap.saveStationScope();
  }
  stopEditScope(){
    MyMap.stopEditScope();
  }
  continueEditScope(){
    MyMap.continueEditScope();
  }
  createNewScope(){
    MyMap.createNewScope();
  }
  locationCenter(city, address, station_info){
    MyMap.locationCenter(city, address, station_info);
  }
}