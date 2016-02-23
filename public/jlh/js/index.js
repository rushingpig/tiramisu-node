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
  function clearMarkers(){
    map.clearOverlays();
      index = 0;
      markers = [];
      points = [];
      Polyline = new BMap.Polyline(points, attr);
      map.addOverlay(Polyline);
  }

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
   * 封装ajax
   * @param  {[string]} url     
   * @param  {[string]} type    
   * @param  {[object]} data    
   * @param  {[funtion]} success 
   * @param  {[function]} error   
   * @return {[null]}         
   */
  function ajax(url, type, data, success, error) {
    $.ajax({
      url: url,
      type: type,
      dataType: 'json',
      data: data,
      success: success,
      error: error,
    });
  }

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
    clearMarkers();
    var dots = JSON.parse(data.data.coords);
    for (var key in dots) {

      dots[key].lng = dots[key].longitude;
      dots[key].lat = dots[key].latitude;
    }
    drawPoline(dots);
    openMarkerEdit();
  };


  $('#searchStation').click(function() {

    var value = $('#findStation').val();
    var stationId = stations.indexOf(value);

    if (value !== '') {
      ajax('http://localhost:3001/v1/a/station/' + stationId, 'GET', {
        station_name: value
      }, getStationScope);
    }
  });


  /**
   * 获取省份
   */
  var getProvince = function(data) {
    var provinces = data.data
    for (var key in provinces) {
      $('<option></option>').text(provinces[key]).attr('value', key).appendTo('#findProvince');
    }
  };

  ajax('http://localhost:3001/v1/a/provinces', 'GET', null, getProvince);

  /**
   * 获取指定省份下的所有城市信息
   */
  var getCities = function(data) {
    var cities = data.data;
    $('#findCities').empty();
    for (var key in cities) {
      $('<option></option>').text(cities[key]).attr('value', key).appendTo('#findCities');
    }
  };

  $('#findProvince').change(function(event) {
    var provinceId = event.target.value;
    $('#findProvince').each(function(index, el) {
      el.click(function() {
        provinceId = $(this).attr('value');
      });
    });

    ajax('http://localhost:3001/v1/a/province/' + provinceId + '/cities', 'GET', null, getCities);

  });

  /**
   * 查询城市的配送站
   */

  var stationOfCity = function(data) {
    var html = '';
    var stations = data.data.pagination_result;
    stations.forEach(function(item, index) {
      html += '<tr>' +
        '<td><input type="checkbox"/></td>' +
        '<td class="district-name">' + item.district_name + '</td>' +
        '<td class="station-name">' + item.station_name + '</td>' +
        '<td class="address">' + item.address + '</td>' +
        '<td><a class="edit" data-toggle="modal" data-target="#mapContainer">编辑</a></td>' +
        '</tr>';
    });
    $(html).appendTo('#tableStation tbody');


    //为配送站开启编辑
    $('.edit').each(function(index, el) {
      $(el).click(function(event) {
        var stationName = $(this).parent('td').siblings('.station-name').text();
        var stationId = stations.indexOf(stationName);

        if (stationName !== '') {

          ajax('http://localhost:3001/v1/a/station/' + stationId, 'GET', {
            station_name: stationName
          }, getStationScope);

        }

      });
    });

  };


  $('#searchCityStation').click(function(event) {

    event.preventDefault();

    $('#tableStation tbody').empty();
    var cityId = $('#findCities option:selected').attr('value');

    ajax('http://localhost:3001/v1/a/city/' + cityId + '/stations', 'GET', {
      cityId: cityId,
      page_no: 0,
      page_size: 15
    }, stationOfCity)

  });

  /**
   * 修改配送站
   */
  $('#modifiyStation').click(function(event) {
    closeMarkerEdit();

    $(this).attr('disabled', 'disabled');
    
    Polyline.setPath(points.concat(points[0]));
    Polyline.getPath().pop();
    var newData = Polyline.getPath();
    newData.forEach(function(item, index) {
      item.longitude = item.lng;
      item.latitude = item.lat;
      delete item.lng;
      delete item.lat;
    });

    ajax('http://localhost:3001/v1/a/station/' + 1 + '/coords', 'put', {
      coords: JSON.stringify(newData)
    });

  });



});