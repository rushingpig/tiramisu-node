import Noty from 'utils/_noty';
import { outputPonits, changePonits, addInfoWindow, addMarkerToMap, _initialize, create, addMarker,
  oldPolygonStyle, newPolygonStyle, getLabelStyle } from 'utils/create_visiable_map';
import clone from 'clone';

var MyMap = function(list){
  this.map = null;
  this.list = list;
  this.markers = [];
  this.infoCenter = null;
  this.onEditIndex = -1;
  this.editting = false;
  this.polygon = null; //正在编辑中的polygon
  this.geocoder = null; //可以获取指定地址的准确坐标

  this.d = $.Deferred();
}
MyMap.prototype.changePonits = changePonits;

MyMap.prototype.centerAndZoomStation = function(name, city, address){
  if(BMap){
    let map = this.map;
    this.geocoder = new BMap.Geocoder();
    this.geocoder.getPoint(address || city, (poi) => {
      console.log('poi: ', poi);
      if(poi){
        map.panTo(poi);
        map.setZoom(14);
        this.infoCenter = addInfoWindow(map, poi, {name, address});
      }else{
        map.centerAndZoom( city, 12 );
      }
    })
  }else{
    console.log('error');
  }
}

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
/*
MyMap.prototype.drawNewScope = function(){
  let self = this;
  let map = this.map;
  let index = 0;
  let points = [];
  this.polygons[self.onEditIndex] = new BMap.Polygon(points, newPolygonStyle);
  map.addOverlay(this.polygons[self.onEditIndex]);

  this._addPointHandler = function(event){
    points.push(event.point);
    var marker = new BMap.Marker(event.point);
    map.addOverlay(marker);
    self.markers.push(marker);
    marker.id = index++;
    marker.enableDragging();
    var label = new BMap.Label(marker.id + 1);
    label.setStyle(getLabelStyle(marker.id + 1));
    marker.setLabel(label);
    self.polygons[self.onEditIndex].setPath(points);

    marker.addEventListener('dragging', function(event) {
      points[this.id] = event.point;
      self.polygons[self.onEditIndex].setPath(points);
    });
  };
  map.addEventListener('click', this._addPointHandler);
}
*/
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
  // if(_on.coords){
  //   let points = changePonits(_on.coords);
  //   points.forEach(function(n, index){
  //     let marker = new BMap.Marker(n);
  //     self.markers.push(marker);
  //     marker.enableDragging();
  //     marker.id = index++;
  //     map.addOverlay(marker);
  //     var label = new BMap.Label(marker.id + 1);
  //     label.setStyle(getLabelStyle(marker.id + 1));
  //     marker.setLabel(label);
  //     if(!self.polygons[self.onEditIndex]){
  //       self.polygons[self.onEditIndex] = new BMap.Polygon(points, newPolygonStyle);
  //     }
  //     map.addOverlay(self.polygons[self.onEditIndex]);
  //     marker.addEventListener('dragging', function(event) {
  //       points[this.id] = event.point;
  //       self.polygons[self.onEditIndex].setPath(points);
  //     });
  //   })
  // }else{
  //   self.createNewScope();
  // }
  this.editting = true;
  this.map.removeOverlay(this.infoCenter);
  var { name, city_name, regionalism_name, address } = _on;
  self.centerAndZoomStation( name, city_name, (regionalism_name || '') + (address || '') );
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
  // this.list[this.onEditIndex].coords = outputPonits(this.polygons[this.onEditIndex].getPath());
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

export default new MyMap;