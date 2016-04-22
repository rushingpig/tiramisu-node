import { Noty } from 'utils/index';

function MyMap(){
  this.map = null;
  this.init_flag = 0;
  this.points = [];
  this.markers = [];
  this.oldPolygon = null;
  this.polygon = null;
  this.geocoder = null; //可以获取指定地址的准确坐标

  this.d = $.Deferred();
}

const oldPolygonStyle = {strokeWeight: '2',strokeColor: '#1215A0',fillColor: ''};
const newPolygonStyle = {strokeWeight: '3',strokeColor: '#FF0000',fillColor: ''};
const getLabelStyle = index => ({
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

export function changePonits(points){
  return JSON.parse(points.replace(/latitude/g,'lat').replace(/longitude/g,'lng'));
}

export function addInfoWindow(map,point,station_info){
  var opts = {title: station_info.name, width: 0, height:0, offset: new BMap.Size(15,-20)}
  var sContent =
      "<p> 配送站地址：" + station_info.address + "</p>" 
  var infoWindow = new BMap.InfoWindow(sContent, opts);
  var center = new BMap.Marker(point);
  var icon = new BMap.Icon('/images/point.png', new BMap.Size(24, 40));
  center.setIcon(icon);
  center.setAnimation(BMAP_ANIMATION_BOUNCE);
  map.addOverlay(center);
  center.openInfoWindow(infoWindow)
  center.addEventListener('mouseover', function(){
    center.openInfoWindow(infoWindow);
  })
}

MyMap.prototype.addMarker = function(point){
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

MyMap.prototype.createNewScope = function(){
  var self = this;
  this.points = this.points || [];

  //已有多边形
  this.points.forEach( n => this.addMarker(n) );
  var polygon = new BMap.Polygon(this.points, newPolygonStyle);
  this.map.addOverlay(polygon);
  this.polygon = polygon;

  //新添加多边形点
  this.map.addEventListener('click',function(event){
    self.points.push( event.point );
    polygon.setPath( self.points );
    self.addMarker.call(self, event.point );
  });
}

MyMap.prototype.saveStationScope = function(){
  var points = outputPonits(this.points);
  return points;
}

MyMap.prototype.locationCenter = function(city, address, station_info){
  var self = this;
  if(BMap){
    let map = this.map;
    this.geocoder = new BMap.Geocoder();
    this.geocoder.getPoint(city && address, function(poi){
      console.log('poi: ', poi);
      if(poi){
        // map.centerAndZoom( poi, 14);
        map.panTo(poi);
        map.setZoom(14);
        addInfoWindow(map, poi, station_info);
      }else{
        map.centerAndZoom( city, 12 );
      }
    })
  }else{
    console.log('error');
  }
}

MyMap.prototype.clearMap = function(){
  this.points = [];
  this.markers = [];
  this.map.clearOverlays();
}

MyMap.prototype.stopEditScope = function(){
  this.markers.forEach(n => n.hide());
}
MyMap.prototype.continueEditScope = function(){
  this.markers.forEach(n => n.show());
}

MyMap.prototype.drawScope = function(points){
  var map = this.map;
  this.points = [];
  this.markers = [];
  if(points != undefined){
    this.points = changePonits(points);
    this.oldPolygon = new BMap.Polygon(this.points, oldPolygonStyle);
    this.oldPolygon.setFillColor('');
    this.map.addOverlay(this.oldPolygon);
  }
}

MyMap.prototype._initialize = function() {
  var self = this;
  var index = 0;
  var stationMap = document.getElementById('stationMap');
  var container = document.createElement('div');
  container.setAttribute('id','container');
  $(container).css({
    width: '100%',
    height: '500px'
  });
  stationMap.appendChild(container);
  this.map = new BMap.Map('container');
  var point = new BMap.Point(113.949964, 22.587609);
  this.map.centerAndZoom(point, 12);
  this.map.enableScrollWheelZoom(true);
  this.map.enableDragging();
  this.d.resolve();
}

MyMap.prototype.create = function(callback) {
  if(!window.BMap){
    var script = document.createElement("script");
    window._bmap_callback = this._initialize.bind(this);
    script.src = "http://api.map.baidu.com/api?v=2.0&ak=dxF5GZW6CHlR4GCQ9kKynOcc&callback=_bmap_callback";//此为v2.0版本的引用方式  
    // http://api.map.baidu.com/api?v=1.4&ak=您的密钥&callback=initialize"; //此为v1.4版本及以前版本的引用方式  
    document.body.appendChild(script);
    this.d.done(callback);
  }else{
    this._initialize.call(this);
    callback();
  } 
}

export default new MyMap;


