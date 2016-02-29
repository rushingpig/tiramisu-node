var script = document.createElement("script");
script.src = "http://api.map.baidu.com/api?v=2.0&ak=dxF5GZW6CHlR4GCQ9kKynOcc&callback=_bmap_callback"; //此为v2.0版本的引用方式  
// http://api.map.baidu.com/api?v=1.4&ak=您的密钥&callback=initialize"; //此为v1.4版本及以前版本的引用方式  
document.body.appendChild(script);
}

$(document).ready(function($) {
  var map = new BMap.Map("container");
  var point = new BMap.Point(113.949964, 22.587609);
  map.centerAndZoom(point, 13);
  map.enableScrollWheelZoom(true);
  map.enableDragging();

  var index = 0;
  var points = [];
  var markers = [];
  var attr = {
    fillColor: '',
    strokeColor: 'red',
    strokeWeight: 2,
    strokeOpacity: 0.8,
  };

  var Polyline = new BMap.Polyline(points, attr);
  map.addOverlay(Polyline);

  /**
    为地图添加点击事件   添加配送站时会用到
  */
  // map.addEventListener('click', function(event) {

  //   var point = changeToPoint(event.point);
  //   points.push(point);
  //   Polyline.setPath(points);

  //   addMarker(point);
  //   openMarkerEdit();
  // });

  /**
   * 由地理坐标转化为Point
   */

  function changeToPoint(coord) {
    var lng = coord.lng;
    var lat = coord.lat;
    return new BMap.Point(lng, lat);
  }

  /**
   * 开启标志maker编辑功能
   */

  function openMarkerEdit() {
    markers.forEach(function(item, index) {
      item.enableDragging();
    });
  }
  /**
   * 开启标志maker禁止编辑功能
   */

  function closeMarkerEdit() {
    markers.forEach(function(item, index) {
      item.disableDragging();
    });
  }
  /**
   * 添加标志marker
   */
  function addMarker(point) {
    var marker = new BMap.Marker(point);
    markers.push(marker);
    marker.id = index++;
    map.addOverlay(marker);

    marker.addEventListener('dragging', function() {
      var newPosition = this.getPosition();
      var point = changeToPoint(newPosition);
      points[this.id] = point;

      Polyline.setPath(points);
    });

  }
  /**
   * 清除所有标记
   */

  $('#clearMark').click(function() {
    if (confirm('确认已导出数据!是否要清除标记')) {
      map.clearOverlays();
      index = 0;
      markers = [];
      points = [];
      Polyline = new BMap.Polyline(points, attr);
      map.addOverlay(Polyline);
    }
  });

  /**
   * 由数据生成地图区域
   */
  function drawPoline(dataArray) {
    if (Array.isArray(dataArray)) {
      dataArray.forEach(function(item) {
        var point = changeToPoint(item);
        map.centerAndZoom(point, 12);
        points.push(point);

        addMarker(point);
      });
      Polyline.setPath(points.concat(points[0]));
    }
  }
  /**
   *点击确认输入
   */
  $('#confirm').click(function() {
    var testData = document.getElementById('dataArray').value;
    drawPoline(JSON.parse(testData));
  });

  /**
   * 获取所有配送站列表
   */
  var stations = [];

  var getStations = function(data) {
    for (key in data.data) {
      stations.push(data.data[key]);
    }
  };

  ajax('http://localhost:3001/v1/a/stations', 'GET', null, getStations);

  $('#findStation').focus(function(event) {
    $(this).autocomplete({
      source: stations
    });
  });
  /**
   * 获取配送站配送范围
   */

  var getStationScope = function(data) {
    var dots = JSON.parse(data.data.coords);
    for (var key in dots) {

      dots[key].lng = dots[key].longitude;
      dots[key].lat = dots[key].latitude;
    }
    drawPoline(dots);
    openMarkerEdit();
  };

});