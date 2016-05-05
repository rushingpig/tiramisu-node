import Noty from 'utils/_noty';
import { outputPonits, changeToPonits, addInfoWindow, addMarkerToMap, _initialize, create, addMarker,
  locationCenter, oldPolygonStyle, newPolygonStyle, getLabelStyle, search, createAutocomplete } from 'utils/create_visiable_map';
import clone from 'clone';

var MyMap = function(list){
  this.map = null;
  this.centerPoint = null;
  this.list = list;
  this.markers = [];
  this.infoCenter = null;
  this.onEditIndex = -1;
  this.editting = false;
  this.polygon = null; //正在编辑中的polygon
  this.geocoder = null; //可以获取指定地址的准确坐标
  this.LocalSearch = null;

  this.d = $.Deferred();
  this.searchMarker = null;
}
MyMap.prototype.changeToPonits = changeToPonits;

MyMap.prototype.locationCenter = locationCenter;

MyMap.prototype.addMarker = function( point ){
  var self = this;
  var marker = new BMap.Marker( point );
  marker.id = this.markers.length;
  marker.enableDragging();

  var label = new BMap.Label(marker.id + 1);
  label.setStyle(getLabelStyle(marker.id + 1));
  marker.setLabel(label);

  marker.addEventListener('dragging', function(event){
    var points = self.list[ self.onEditIndex ].coords;
    points[this.id] = event.point;
    self.polygon.setPath(points);
  });

  this.markers.push(marker);
  this.map.addOverlay(marker);
}

MyMap.prototype.createNewScope = function( points ){
  var { onEditIndex } = this;
  points = points || [];
  this.markers = [];
  //已有多边形
  points.forEach( n => this.addMarker(n) );

  var polygon = new BMap.Polygon(points, newPolygonStyle);
  this.map.addOverlay(polygon);
  this.polygon = polygon;

  //新添加多边形点
  this._clickHandler =function(event){
    var coords = this.list[ onEditIndex ].coords || []
    coords.push( event.point );
    polygon.setPath( coords );
    this.list[ onEditIndex ].coords = coords;
    this.addMarker.call(this, event.point );
  }.bind(this);
  this.map.addEventListener('click', this._clickHandler);
}

MyMap.prototype.initialScope = function(){
  let self = this;
  let map = this.map;
  map.clearOverlays();
  map.removeOverlay(this.polygon);
  this.polygon = null;
  this.list.map(n => {
    if(n.coords){
      let oldPolygon = new BMap.Polygon(n.coords, oldPolygonStyle);
      map.addOverlay(oldPolygon);
    }
  })
}

MyMap.prototype.enableEdit = function(station_id){
  let self = this;
  let map = this.map;
  let _on = this.list.filter((n, index) => {
    if(n.station_id == station_id){
      this.onEditIndex = index;
    }
    return n.station_id == station_id;
  })[0];

  this.createNewScope( _on.coords );

  this.editting = true;
  this.map.removeOverlay(this.infoCenter);
  var { name, province_name, city_name, regionalism_name, address } = _on;
  self.locationCenter( province_name, city_name, regionalism_name, address, { name, address});
}

MyMap.prototype.stopEditScope = function(){
  this.onEditIndex = -1;
  this.editting = false;
  this.markers.forEach( n => this.map.removeOverlay(n) );
  this.map.removeEventListener('click', this._clickHandler);
}

MyMap.prototype.resetScope = function(){
  this.polygon.setPath([]);
  this.list[ this.onEditIndex ].coords = [];
  this.markers.forEach( n => this.map.removeOverlay(n) );
  this.markers = [];
}

MyMap.prototype.getCoords = function(){
  var all_coords = clone(this.list);
  all_coords.forEach( n => {
    n.coords = n.coords && outputPonits( n.coords );
  });
  return all_coords;
}

MyMap.prototype.reset = function(){
  this.list = [];
  this.markers = [];
  this.onEditIndex = -1;
  this.polygons = [];
}

MyMap.prototype._initialize = _initialize;
MyMap.prototype.create = create;
MyMap.prototype.search = search;
MyMap.prototype.createAutocomplete = createAutocomplete;

export default new MyMap;