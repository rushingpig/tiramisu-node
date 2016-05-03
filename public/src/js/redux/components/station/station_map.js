import React , { Component, PropTypes } from 'react';
import { render, findDOMNode } from 'react-dom';
import MyMap from 'utils/create_visiable_map';
import { once } from 'utils/index';

export default class StationMap extends Component {
  constructor(props){
    super(props);
    this.state = {
      mapPrepared: false,
      fullScreen: false,
    }
    this.initScope = this.initScope.bind(this);
  }
  render(){
    var { fullScreen } = this.state;
    return (
      <div className="panel station-manage">
        <div className="panel-body">
          <div ref="map" className={`station-map ${fullScreen ? 'full-screen' : ''}`}>
            <a onClick={this.fullScreen.bind(this)} className="full-screen-btn" href="javascript:;">{fullScreen && '退出'}全屏</a>
            <div id="map_container" className="map-container"></div>
          </div>
          <div className="font-sm mgt-4" style={{marginTop: '3px'}}>( * 编辑状态时，您可以点击新地点来增加标记 )</div>
        </div>
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
  fullScreen(){
    this.setState({ fullScreen: !this.state.fullScreen });
  }
  saveStationScope(){
    return MyMap.saveStationScope();
  }
  stopEditScope(){
    MyMap.stopEditScope();
  }
  resetEditScope(){
    MyMap.resetScope();
  }
  continueEditScope(){
    MyMap.continueEditScope();
  }
  createNewScope(){
    MyMap.createNewScope();
  }
  locationCenter(province, city, district, address, station_info){
    MyMap.locationCenter(province, city, district, address, station_info);
  }
}