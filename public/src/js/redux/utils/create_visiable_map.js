import autoMatch from 'mixins/map';
import Noty from 'utils/_noty'

function MyMap(){
  this.map = null;
  this.init_flag = 0;
  this.points = [];
  this.markers = [];
  this.oldPolygon = null;
  this.polygon = null;
}

function addMarkerToMap(map,point){
  var marker = new BMap.Marker(point);
  map.addOverlay(marker);
  return marker;
}

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
  var stationCenter = new BMap.Marker(point);
  var icon = new BMap.Icon('/images/point.png', new BMap.Size(24, 40));
  stationCenter.setIcon(icon);
  stationCenter.setAnimation(BMAP_ANIMATION_BOUNCE);
  map.addOverlay(stationCenter);
  stationCenter.openInfoWindow(infoWindow)
  stationCenter.addEventListener('mouseover', function(){
    stationCenter.openInfoWindow(infoWindow);
  })
}

MyMap.prototype.createNewScope = function(){
  var self = this;
  var index = 0;
  this.points = [];
  this.markers = [];
  var opts = {strokeWeight: '2',strokeColor: '#FF0000',fillColor: ''};
  var polygon = new BMap.Polygon(self.points);
  this.map.addOverlay(polygon);

  this.map.addEventListener('click',function(event){
    self.points.push(event.point);
    var marker = addMarkerToMap(self.map,event.point);
    self.markers.push(marker);
    marker.id = index++;
    marker.enableDragging();
    polygon.setPath(self.points);

    marker.addEventListener('dragging', function(event) {
      self.points[this.id] = event.point;
      polygon.setPath(self.points);
    });
  });
}

MyMap.prototype.saveStationScope = function(){
  var points = outputPonits(this.points);
  return points;
}

MyMap.prototype.locationCenter = function(city, address, station_info){
  var self = this;
  if(!city || !address){
    Noty('error', '地址数据有误');
  }
  if(BMap){
    let map = self.map;
    map.centerAndZoom(city);
    let localSearch = new BMap.LocalSearch(map);
    localSearch.setSearchCompleteCallback( function(searchResult){
      var poi = searchResult && searchResult.getPoi(0);
      if(poi){
        map.panTo(poi.point);
        addInfoWindow(map, poi.point, station_info)
        console.log(poi.point.lng + "," + poi.point.lat);
      }else{
        console.log('error');
      }
    });
    localSearch.search(address);
  }else{
    console.log('error');
  }
}

MyMap.prototype.insertPoints = function(points){
  this.points = changePonits(points);
}

MyMap.prototype.clearMap = function(){
  this.points = [];
  this.markers = [];
  this.map.clearOverlays();
}

MyMap.prototype.editScope = function(){
  var self = this;
  if(this.points.length === 0){
    this.createNewScope();
  }else{
    this.points.forEach((n, index) => {
      var marker = new BMap.Marker(n);

      self.markers.push(marker);
      marker.enableDragging();
      marker.id = index++;
      self.map.addOverlay(marker);
      if(!self.polygon){
        let opts = {strokeWeight: '2',strokeColor: '#1215a0',fillColor: ''};
        self.polygon = new BMap.Polygon(self.points, opts);
      }
      self.map.addOverlay(self.polygon);

      marker.addEventListener('dragging', function(event) {
        self.points[this.id] = event.point;
        self.polygon.setStrokeColor('red');
        self.polygon.setPath(self.points);
      });
    })
  }
}

MyMap.prototype.stopEditScope = function(){
  var map = this.map;
  this.markers.forEach(n => {
    map.removeOverlay(n);
  });
}

MyMap.prototype.drawScope = function(points){
  var map = this.map;
  this.points = [];
  if(points != undefined){
    this.points = changePonits(points);
    var opts = {strokeWeight: '2',strokeColor: '#1215a0',fillColor: ''};
    this.oldPolygon = new BMap.Polygon(this.points, opts);
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
};

MyMap.prototype.create = function(callback) {
  if(!this.init_flag){
    this.init_flag = 1;
    var script = document.createElement("script");
    window._bmap_callback = this._initialize.bind(this);
    script.src = "http://api.map.baidu.com/api?v=2.0&ak=dxF5GZW6CHlR4GCQ9kKynOcc&callback=_bmap_callback";//此为v2.0版本的引用方式  
    // http://api.map.baidu.com/api?v=1.4&ak=您的密钥&callback=initialize"; //此为v1.4版本及以前版本的引用方式  
    document.body.appendChild(script);
  }else{
    this._initialize();
  } 
}

export default new MyMap;


