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
    为地图添加点击事件   
  */
  // map.addEventListener('click', function(event) {
  //   var point = changeToPoint(event.point);
  //   points.push(point);
  //   Polyline.setPath(points);

  //   var marker = new BMap.Marker(point);
  //   markers.push(marker);
  //   marker.enableDragging();
  //   marker.id = index++;
  //   map.addOverlay(marker);

  //   marker.addEventListener('dragging', function() {
  //     var newPosition = this.getPosition();
  //     var point = changeToPoint(newPosition);
  //     points[this.id] = point;

  //     Polyline.setPath(points);
  //   });

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
   * 点击按钮生成闭合折线
   */
  $('#createPoline').click(function() {
    if (index >= 1) {
      Polyline.setPath(points.concat(points[0]));
    }
  });
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
   * 导出数据 
   */
  $('#createData').click(function() {
    if (confirm('请确认折线已闭合')) {
      Polyline.getPath().pop();
      document.getElementById('dataArray').value = JSON.stringify(Polyline.getPath());
      console.log(JSON.stringify(Polyline.getPath(), null, '  '));
    }
  });
  /**
   * 由数据生成地图区域
   */
  function drawPoline(dataArray) {
    if (Array.isArray(dataArray)) {
      dataArray.forEach(function(item) {
        var point = changeToPoint(item);
        points.push(point);
        var marker = new BMap.Marker(point);
        marker.id = index++;

        marker.enableDragging();
        map.addOverlay(marker);

        map.centerAndZoom(point, 13);
        marker.addEventListener('dragging', function() {
          var newPosition = this.getPosition();
          var point = changeToPoint(newPosition);
          points[this.id] = point;

          Polyline.setPath(points);
        });
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
   * 搜索定位
   */
  var searchBox = document.getElementById('searchBox');
  var searchControl = new BMapLib.SearchControl({
    container: "searchBox",
    map: map,
    type: LOCAL_SEARCH
  });

  /**
   * 获取所有配送站列表
   */
  var stations = [];
  $.ajax({
    url: 'http://localhost:3001/v1/a/stations',
    type: 'GET',
    dataType: 'json',
    success: function(data) {
      for (key in data.data) {
        stations.push(data.data[key]);
      }
    },
    error: function() {
      console.log('error')
    }
  });

  $('#findStation').focus(function(event) {
    $(this).autocomplete({
      source: stations
    });
  });
  /**
   * 获取配送站配送范围
   */

  $('#searchStation').click(function() {
    var value = $('#findStation').val();
    var stationId = stations.indexOf(value);
    if (value !== '') {
      $.ajax({
        url: 'http://localhost:3001/v1/a/station/' + stationId,
        type: 'GET',
        dataType: 'json',
        data: {
          station_name: value
        },
        success: function(data) {
          var dots = JSON.parse(data.data.coords);
          for (var key in dots) {

            dots[key].lng = dots[key].longitude;
            dots[key].lat = dots[key].latitude;
          }
          drawPoline(dots);
        }
      });
    }
  });


  /**
   * 获取省份
   */
  $.ajax({
    url: 'http://localhost:3001/v1/a/provinces',
    type: 'GET',
    dataType: 'json',
    success: function(data) {
      var provinces = data.data
      console.log(provinces)
      for (var key in provinces) {
        $('<option></option>').text(provinces[key]).attr('value', key).appendTo('#findProvince');
      }
    },
    error: function() {
      console.log('error');
    }
  });

  /**
   * 获取指定省份下的所有城市信息
   */
  $('#findProvince').change(function(event) {
    var provinceId = event.target.value;
    console.log(event.target.value);
    $.ajax({
      url: 'http://localhost:3001/v1/a/province/' + provinceId + '/cities',
      type: 'GET',
      dataType: 'json',
      success: function(data) {
        var cities = data.data;
        $('#findCities').empty();
        for (var key in cities) {
          $('<option></option>').text(cities[key]).attr('value', key).appendTo('#findCities');
        }
      },
      error: function() {
        console.log('error');
      }
    });

    $('#findProvince').each(function(index, el) {
      el.click(function() {
        provinceId = $(this).attr('value');
      });
    });
  });

  /**
   * 查询城市的配送站
   */
  $('#searchCityStation').click(function(event) {

    $('#tableStation tbody').empty();
    var cityId = $('#findCities option:selected').attr('value');
    $.ajax({
      url: 'http://localhost:3001/v1/a/city/' + cityId + '/stations',
      type: 'GET',
      dataType: 'json',
      data: {
        cityId: cityId,
        page_no: 0,
        page_size: 15
      },
      success: function(data) {
        var stations = data.data.pagination_result;
        var html = '';
        stations.forEach(function(item, index) {
          html += '<tr>' +
            '<td><input type="checkbox"/></td>' +
            '<td class="district-name">' + item.district_name + '</td>' +
            '<td class="station-name">' + item.station_name + '</td>' +
            '<td class="address">' + item.address + '</td>' +
            '<td><a class="edit" href="">编辑</a></td>' +
            '</tr>';
        });
        $(html).appendTo('#tableStation tbody');


        /**
         * 为配送站开启编辑
         */
        $('.edit').each(function(index, el) {
          $(el).click(function(event) {

            event.preventDefault();
            event.stopPropagation();

            var stationName = $(this).parent('td').siblings('.station-name').text();
            var stationId = stations.indexOf(stationName);
            console.log(stationName)

            if (stationName !== '') {
              $.ajax({
                url: 'http://localhost:3001/v1/a/station/' + stationId,
                type: 'GET',
                dataType: 'json',
                data: {
                  station_name: stationName
                },
                success: function(data) {
                  var dots = JSON.parse(data.data.coords);
                  for (var key in dots) {

                    dots[key].lng = dots[key].longitude;
                    dots[key].lat = dots[key].latitude;
                  }
                  drawPoline(dots);
                  openMarkerEdit();
                }
              });
            };

          });
        });

      }
    })

  });

  /**
   * 修改配送站
   */
  $('#modifiyStation').click(function(event) {

    Polyline.setPath(points.concat(points[0]));
    Polyline.getPath().pop();
    var newData = Polyline.getPath();
    newData.forEach(function(item, index) {
      item.longitude = item.lng;
      item.latitude = item.lat;
    });
    var newData = JSON.stringify();

    $.ajax({
      url: 'http://localhost:3001/v1/a/station/' + 1 + '/coords',
      type: 'put',
      dataType: 'json',
      data: {
        coords: newData
      },
      success: function() {
        console.log('修改配送站成功')
      }
    })



  });



});