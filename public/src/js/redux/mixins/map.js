import MyMap from 'utils/MyMap';
import {findDOMNode} from 'react-dom';
import { SELECT_DEFAULT_VALUE } from 'config/app.config';
import Promise from 'utils/promise';
import { Noty } from 'utils/index';
import { triggerFormUpdate } from 'actions/form';
import LazyLoad from 'utils/lazy_load';

//step: 1
export function createMap(t, callback){
  //初始化地图
  MyMap.create( (map, geocoder) => {
    t._bmap = geocoder; //解析地址貌似只需要 geocoder就够了
    getPointByGeocoder = getPointByGeocoder.bind(geocoder);
    callback && callback();
  });
  LazyLoad('GeoUtils');
}
//step: 2
export function startMatchDeliveryStations(success_cb, fail_cb){
  if( this == window ){
    throw new Error('should call like this : startMatchDeliveryStations.call(this, success_cb, fail_cb)')
  }
  if( !this._bmap ){
    MyMap.create( (map, geocoder) => {
      t._bmap = geocoder; //解析地址貌似只需要 geocoder就够了
      start.call(this, success_cb, fail_cb);
    });
  }else{
    start.call(this, success_cb, fail_cb);
  }
}
function start(success_cb, fail_cb){
  var detail = $(this.refs.recipient_address).val();
  var province = this.findSelectedOptionText('province');
  var city = this.findSelectedOptionText('city');
  var district = this.findSelectedOptionText('district');
  var default_text = this.refs.province.props['default-text'];
  if(detail && province != default_text && city != default_text && district != default_text){
    if( detail.indexOf(district) == -1 ){
      detail = district + detail;
    }
    if( detail.indexOf(city) == -1 ){
      detail = city + detail;
    }
    //保证精准度，detail = city + district + address
    autoMatch.call(this, city, district, detail).done(success_cb.bind(this)).fail(fail_cb.bind(this));
  }else{
    Noty('warning', '地址无效')
  }
}
//step: 3
export function autoMatch(city, district, address){
  var self = this;
  var { autoGetDeliveryStations } = this.props.actions;
  if(!city || !address){
    Noty('error', '地址数据有误');
  }
  
  // 1. geocoder 适用于解析详细地址（带街道，道路，门牌号的）
  // 2. localsearch 适用于一些关键字搜索（宽泛的场所，如xx银行，xx酒店）
  return new Promise((resolve, reject) => {
    if(BMap){
      let map = self._bmap;

      //方案1
      // let LS = new BMap.LocalSearch(city, {
      //   onSearchComplete: function( result ){
      //     if(result.getPoi(0)){
      //       getStation(result.getPoi(0).point);
      //     }else{
      //       map.getPoint(address, function(poi){
      //         if(poi){
      //           getStation(poi);
      //         }else{
      //           reject('解析改地址失败');
      //         }
      //       }, city);
      //     }
      //   }
      // });
      // LS.search(address);
      
      //方案2
      // map.getPoint(address, function(poi){
      //   if(poi){
      //     map.getPoint(district, function(poi_district){
      //       //当详细地址搜索失败时，则会显示区的中心坐标
      //       //(当两者相等时，意味着搜索失败, 然后启用localsearch)
      //       if(poi_district.lng == poi.lng && poi_district.lat == poi.lat){
      //         let LS = new BMap.LocalSearch(city, {
      //           onSearchComplete: function( result ){
      //             if(result.getPoi(0)){
      //               getStation(result.getPoi(0).point);
      //             }else{
      //               reject();
      //             }
      //           }
      //         });
      //         LS.search(address);
      //       }else{
      //         getStation(poi);
      //       }
      //     }, city);
      //   }else{
      //     reject();
      //   }
      // }, city);

      //方案3
      $.when(
        getPointByGeocoder(address, city),
        getPointByGeocoder(district, city),
        getPointByLocalSearch(address, city)
      ).done(function(poi_gc, poi_di, poi_ls){
        console.log(poi_gc, poi_di, poi_ls);
        if(
          poi_gc && poi_di && poi_ls
          &&
          (poi_gc.lng != poi_di.lng || poi_gc.lat != poi_di.lat)
          &&
          BMapLib.GeoUtils.getDistance(poi_gc, poi_ls) < 1000 //1公里
        ){
          getStation(poi_gc);
        }else if((poi_gc && !poi_ls) || poi_ls){
          autoGetDeliveryStations( poi_ls || poi_gc ) //poi_ls必须在前
          .done(function(data){
            if(data && data.delivery_id){
              Noty('warning', '可能的配送中心为：' + data.delivery_name + '，请手动确认！');
            }
            reject();
          })
          .fail(function(msg){
            reject(msg || '自动检索配送中心异常，请重试');
          })
        }else{
          reject();
        }
      }).fail(function(err){
        reject();
      })

      function getStation( poi ){
        autoGetDeliveryStations( poi )
          .done(function(data){
            if(data && data.delivery_id){
              resolve(data.delivery_id); //成功，且有数据
            }else{
              reject('服务器异常');
            }
          })
          .fail(function(msg, code){
            reject(msg || '自动检索配送中心异常，请重试');
          })
      }
    }else{
      reject('地图服务加载失败，请稍后再试');
    }
  })
  .done(autoMatchSuccess.bind(this))
  .fail(autoMatchFail.bind(this))
  .done(addEffect.bind(this, 'alert-success'))
  .fail(addEffect.bind(this, 'alert-danger'))
}

function getPointByGeocoder(address, city){
  var geo = this;
  return new Promise(function(resolve, reject){
    geo.getPoint(address, function(poi){
      resolve(poi);
    }, city)
  })
}

function getPointByLocalSearch(address, city){
  return new Promise(function(resolve, reject){
    new BMap.LocalSearch(city, {
      onSearchComplete: function( result ){
        resolve(result.getPoi(0) && result.getPoi(0).point);
      }
    }).search(address);
  })
}

function addEffect(animate_name){
  var $dc = $(findDOMNode(this.refs.delivery_center)).removeClass('alert-success alert-danger').addClass(animate_name);
}

function autoMatchSuccess(){
  this.setState({auto_match_delivery_center: true, auto_match_msg: '已成功匹配！'});
}

function autoMatchFail(msg){
  this.setState({auto_match_delivery_center: false, auto_match_msg: msg || '无法准确定位配送中心，请与客户联系后手动选择！'});
}