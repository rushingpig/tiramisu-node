import { Noty, core } from 'utils/index';

function MyMap(){
  this.map = null;
  this.init_flag = 0;
  this.points = [];
  this.markers = [];
  this.oldPolygon = null;
  this.polygon = null;
  this.geocoder = null; //可以获取指定地址的准确坐标
  this.LocalSearch = null;

  this.d = $.Deferred();
}

export const oldPolygonStyle = {strokeWeight: '2',strokeColor: '#1215A0',fillColor: ''};
export const newPolygonStyle = {strokeWeight: '3',strokeColor: '#FF0000',fillColor: ''};
export const getLabelStyle = index => ({
  width: '17',
  textAlign: 'center',
  margin: `2px ${ 4 - parseInt(index / 10) * 2 }px`,
  backgroundColor: 'transparent',
  color: '#fff',
  fontSize: '12px',
  border: 'none'
});

export function changeToPoint(coord) {
  var lng = coord.lng;
  var lat = coord.lat;
  return new BMap.Point(lng, lat);
}

export function outputPonits(points){
  return JSON.stringify(points).replace(/lat/g,'latitude').replace(/lng/g,'longitude');
}

export function changeToPonits(points){
  if(core.isString(points)){
    var p = JSON.parse(points.replace(/latitude/g,'lat').replace(/longitude/g,'lng'));
    if(core.isArray(p)){
      return p.map( changeToPoint ); //转化为标准Point对象
    }
  }
  return null;
}

export function addInfoWindow(map,point,station_info){
  // var opts = {title: station_info.name, width: 0, height:0, offset: new BMap.Size(15,-20)}
  var opts = {title: station_info.name || '-', width: 0, height:0}
  var sContent =
      "<p> 配送站地址：" + (station_info.address || '-') + "</p>" 
  var infoWindow = new BMap.InfoWindow(sContent, opts);
  var center = new BMap.Marker(point);
  var icon = new BMap.Icon('/images/point_blue.png', new BMap.Size(24, 35), {
    anchor: new BMap.Size(12, 22),
    infoWindowAnchor: new BMap.Size(20, 3)
  });
  center.setIcon(icon);
  center.setAnimation(BMAP_ANIMATION_DROP);
  map.addOverlay(center);
  center.openInfoWindow(infoWindow)
  center.addEventListener('mouseover', function(){
    center.openInfoWindow(infoWindow);
  });
  return center;
}

export function addMarker(point){
  var self = this;
  var marker = new BMap.Marker( point );
  marker.id = this.markers.length;
  marker.enableDragging();

  var label = new BMap.Label(marker.id + 1);
  label.setStyle(getLabelStyle(marker.id + 1));
  marker.setLabel(label);

  marker.addEventListener('dragging', function(event){
    self.points[this.id] = event.point;
    self.polygon.setPath(self.points);
  });

  this.markers.push(marker);
  this.map.addOverlay(marker);
}
MyMap.prototype.addMarker = addMarker;

MyMap.prototype.createNewScope = function(){
  var self = this;
  this.points = this.points || [];

  //已有多边形
  this.points.forEach( n => this.addMarker(n) );
  var polygon = new BMap.Polygon(this.points, newPolygonStyle);
  this.map.addOverlay(polygon);
  this.polygon = polygon;

  //新添加多边形点
  this._clickHandler = function( event ){
    self.points.push( event.point );
    polygon.setPath( self.points );
    self.addMarker.call(self, event.point );
  }
  this.map.addEventListener('click', this._clickHandler);
}

MyMap.prototype.saveStationScope = function(){
  var points = outputPonits(this.points);
  return points;
}

export const locationCenter = function(province, city, district, address, station_info){
  var self = this;
  if(BMap){
    let map = this.map;
    var geocoder = new BMap.Geocoder();
    var fnCenter = function(poi){
      map.panTo(poi);
      map.setZoom(13);
      addInfoWindow(map, poi, station_info);
    }
    geocoder.getPoint(province + city + district + address, function(poi){
      if(!poi)
        geocoder.getPoint(province + city + district, function(poi){
          poi ? fnCenter(poi) : map.centerAndZoom( city, 12 );
        })
      else
        fnCenter(poi);
    })
    this.geocoder = geocoder;
  }else{
    console.log('error');
  }
}

MyMap.prototype.locationCenter = locationCenter;

MyMap.prototype.clearMap = function(){
  this.points = [];
  this.markers = [];
  this.map.clearOverlays();
}

MyMap.prototype.stopEditScope = function(){
  this.markers.forEach(n => n.hide());
  this.map.removeEventListener('click', this._clickHandler);
}
MyMap.prototype.continueEditScope = function(){
  this.markers.forEach(n => n.show());
}
MyMap.prototype.resetScope = function(){
  this.polygon.setPath([]);
  this.points = [];
  this.markers.forEach( n => this.map.removeOverlay(n) );
  this.markers = [];
}

MyMap.prototype.drawScope = function(points){
  var map = this.map;
  var self = this;
  this.points = [];
  this.markers = [];
  if(points != undefined){
    this.points = changeToPonits(points);
    this.oldPolygon = new BMap.Polygon(this.points, oldPolygonStyle);
    this.map.addOverlay(this.oldPolygon);
  }
}

export function _initialize() {
  var self = this;
  var index = 0;
  this.map = new BMap.Map('map_container');
  var point = new BMap.Point(113.949964, 22.587609);
  this.map.enableAutoResize();
  this.map.centerAndZoom(point, 12);
  var top_right_navigation = new BMap.NavigationControl({
    anchor: BMAP_ANCHOR_TOP_RIGHT,
    type: BMAP_NAVIGATION_CONTROL_SMALL
  }); //右上角，仅包含平移和缩放按钮
  this.map.addControl( top_right_navigation );
  this.map.enableScrollWheelZoom();
  this.map.enableDragging();
  this.d.resolve();
}
MyMap.prototype._initialize = _initialize;

export function create(callback) {
  if(!window.BMap){
    var script = document.createElement("script");
    window._bmap_callback = this._initialize.bind(this);
    script.src = "http://api.map.baidu.com/api?v=2.0&ak=dxF5GZW6CHlR4GCQ9kKynOcc&callback=_bmap_callback";//此为v2.0版本的引用方式  
    // http://api.map.baidu.com/api?v=1.4&ak=您的密钥&callback=initialize"; //此为v1.4版本及以前版本的引用方式  
    document.body.appendChild(script);
    this.d.done(callback);
  }else{
    this._initialize.call(this);
    callback && callback();
  } 
}

MyMap.prototype.create = create;

export function search( place ){
  if(!this.LocalSearch){
    var map = this.map;
    this.LocalSearch = new BMap.LocalSearch(map, {
      renderOptions: {map}
    });
  }
  return this.LocalSearch.search( place );
}
MyMap.prototype.search = search;

export default new MyMap;


