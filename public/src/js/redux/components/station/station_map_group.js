import React, { Component } from 'react';
import SearchInput from 'common/search_input';
import MyMap from 'utils/station_group_scope';
import V from 'utils/acl';

export default class StationGroupMap extends Component {
  constructor(props){
    super(props);
    this.state = {
      mapPrepared: false, //地图是否已加载好
      edit_station_id: undefined,
      editable: false,
      submitable: false,
      fullScreen: props.share,
      callback: props.callback //初始化完毕后的回调
    };
  }
  render(){
    var { editable, submitable, fullScreen } = this.state;
    var { share } = this.props;
    return (
      <div className="panel">
        {
          !fullScreen
            ? V('StationScopeManageEdit') && 
              <div className="panel-heading">
                <button disabled={!editable} onClick={this.stopEditScope.bind(this)} className="btn btn-theme btn-xs" style={{"marginRight": "35px"}}>停止当前修改</button>
                <button disabled={!submitable} onClick={this.saveNewScope.bind(this)} className="btn btn-theme btn-xs">保存并提交</button>
                <button disabled={!editable} onClick={this.resetEditScope.bind(this)} className="btn btn-xs btn-theme pull-right">重置当前区域</button>
              </div>
            : null
        }
        <div className="panel-body">
          <div ref="map" className={`station-map ${fullScreen ? 'full-screen' : ''}`}>
            <div className="map-toolbar">
              <a onClick={this.fullScreen.bind(this)} className={`full-screen-btn ${share ? 'hidden' : ''} space-right`} href="javascript:;"></a>
              <SearchInput id="searchInput" searchHandler={this.searchHandler.bind(this)} type="text" className={fullScreen ? 'inline-block' : 'hidden' } style={{width: 188}} />
            </div>
            <div id="map_container" className="map-container"></div>
          </div>
          <div className={`font-sm gray ${share ? 'hidden' : ''}`} style={{marginTop: '3px'}}>( * 编辑状态时，您可以点击新地点来增加标记 )</div>
        </div>
      </div>
    );
  }
 
  componentDidMount(){
    MyMap.create(function(map){
      this.setState({ mapPrepared: true });
      
      this.autocomplete = MyMap.createAutocomplete('searchInput');
    }.bind(this));
  }
  componentWillUnmount() {
    MyMap.reset();
    this.autocomplete.dispose();
  }
  componentWillReceiveProps(nextProps) {
    if(nextProps.list !== this.props.list){
      this._mapInitTimer = setInterval( () => {
        if(this.state.mapPrepared){
          MyMap.reset();
          //服务器传来的数据coords是字符串形式的，需要转换
          MyMap.list = nextProps.list.map( n => {
            return {...n, coords: MyMap.changeToPonits(n.coords)};
          });
          MyMap.initialScope();
          clearInterval(this._mapInitTimer);
          this.state.callback && this.state.callback();
        }
      }, 100);
    }
  }
  fullScreen(){
    this.setState({ fullScreen: !this.state.fullScreen });
  }
  viewStationScope({name, province_name, city_name, regionalism_name, address}){
    MyMap.locationCenter(province_name, city_name, regionalism_name, address, {name, address});
  }
  editStationScope(station_id){
    if(!MyMap.editting){
      this.setState({ editable: true, edit_station_id: station_id, submitable: true });
      MyMap.enableEdit(station_id);
    }else{
      Noty('warning','请确定已停止当前修改操作或已提交');
    }
  }
  stopEditScope(){
    if(!MyMap.editting){return;}
    this.setState({ editable: false });
    MyMap.stopEditScope();
  }
  resetEditScope(){
    MyMap.resetScope();
  }
  saveNewScope(){
    var self = this;
    var { putMultipleStationScope, closeActive } = this.props;
    var data = MyMap.getCoords().map(n => {
      let id = n.station_id;
      let coords = n.coords;
      return {id: id, coords: coords};
    });
    putMultipleStationScope(data)
    .done(function(){
      Noty('success', '保存成功');
      this.stopEditScope();
      MyMap.initialScope();
      closeActive(this.state.edit_station_id);
    }.bind(this))
    .fail(function(msg, code){
      Noty('error', msg || '保存异常');
    })
    .always(function(){
      this.setState({ submitable: false })
    }.bind(this));
  }
  searchHandler( place ){
    MyMap.search( place );
  }
}