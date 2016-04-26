import Noty from 'utils/_noty';
import { outputPonits, changePonits, addInfoWindow, addMarkerToMap } from 'utils/create_visiable_map';

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

var MyMap = function(list){
  this.map = null;
  this.list = list;
  this.markers = [];
  this.onEditIndex = -1;
  this.polygons = [];
  this.station_centers = {};
  this.init_flag = 0;
}

MyMap.prototype.centerAndZoomStation = function(name, city_name, address){
  let map = this.map;
  this.searchStationAdress(city_name, address, name);
  map.setZoom(14);
}

MyMap.prototype.addPointHandler = function( event ){

}
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
MyMap.prototype.stopEditScope = function(){
  this.map.removeEventListener('click', this._addPointHandler);
}

MyMap.prototype.searchStationAdress = function(city, address, name){
  let map = this.map;
  if(!city || !address){
    // Noty('error', '地址未找到');
  }
  if(BMap){
    let localSearch = new BMap.LocalSearch(map);
    localSearch.setSearchCompleteCallback( function(searchResult){
      var poi = searchResult && searchResult.getPoi(0);
      if(poi){
        map.panTo(poi.point);
        addInfoWindow(map, poi.point, {name, address})
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

MyMap.prototype.initialScope = function(){
  let self = this;
  let map = this.map;
  map.clearOverlays();
  this.list.map(n => {
    if(n.coords){
      let points = changePonits(n.coords);
      let oldPolygon = new BMap.Polygon(points, oldPolygonStyle);
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
  if(_on.coords){
    let points = changePonits(_on.coords);
    points.forEach(function(n, index){
      let marker = new BMap.Marker(n);
      self.markers.push(marker);
      marker.enableDragging();
      marker.id = index++;
      map.addOverlay(marker);
      var label = new BMap.Label(marker.id + 1);
      label.setStyle(getLabelStyle(marker.id + 1));
      marker.setLabel(label);
      if(!self.polygons[self.onEditIndex]){
        self.polygons[self.onEditIndex] = new BMap.Polygon(points, newPolygonStyle);
      }
      map.addOverlay(self.polygons[self.onEditIndex]);
      marker.addEventListener('dragging', function(event) {
        points[this.id] = event.point;
        self.polygons[self.onEditIndex].setPath(points);
      });
    })
  }else{
    self.drawNewScope(_on.station_id);
  }
  self.centerAndZoomStation(_on.name,_on.city_name,_on.address)
}

MyMap.prototype.getPath = function(){
  let map = this.map;
  this.markers.forEach(n => {
    map.removeOverlay(n);
  });
  if(this.onEditIndex === -1){return;}
  let newPath = outputPonits(this.polygons[this.onEditIndex].getPath());
  this.list[this.onEditIndex].coords = newPath;

  return [...this.list.slice(0, this.onEditIndex),
    Object.assign({}, this.list[this.onEditIndex]),
    ...this.list.slice(this.onEditIndex + 1)
  ];
} 

MyMap.prototype.getCoords = function(){
  let newPath = outputPonits(this.polygons[this.onEditIndex].getPath());
  return newPath;
}

MyMap.prototype.reset = function(){
  this.list = [];
  this.markers = [];
  this.onEditIndex = -1;
  this.polygons = [];
  this.station_centers = {};
}

MyMap.prototype._initialize = function() {
  var self = this;
  var stationMap = document.getElementById('stationMap');
  var container = document.createElement('div');
  container.setAttribute('id','container');
  $(container).css({
    width: '100%',
    height: '500px'
  });
  stationMap.appendChild(container);
  this.map = new BMap.Map('container');
  this.map.centerAndZoom('深圳', 11);
  var top_right_navigation = new BMap.NavigationControl({
    anchor: BMAP_ANCHOR_TOP_RIGHT,
    type: BMAP_NAVIGATION_CONTROL_SMALL
  }); //右上角，仅包含平移和缩放按钮
  this.map.addControl( top_right_navigation );
  this.map.enableScrollWheelZoom(true);
  this.map.enableDragging();
}

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