import MyMap from 'utils/MyMap';
import {findDOMNode} from 'react-dom';
import { SELECT_DEFAULT_VALUE } from 'config/app.config';
import Promise from 'utils/promise';
import { Noty } from 'utils/index';

//完整封装
export default function autoMatchDeliveryStations(callback){
  var self = this;

  createMap(self);

  $(this.refs.recipient_address).on('blur', (e) => {
    var detail = e.target.value;
    if(detail){
      let province = self.findSelectedOptionText('province');
      let city = self.findSelectedOptionText('city');
      let district = self.findSelectedOptionText('district');
      let default_text = self.refs.province.props['default-text'];
      if(province != default_text && city != default_text && district != default_text){
        autoMatch.call(self, city, district + detail).done(callback).fail(function(msg){
          Noty('warning', msg || 'error');
        });
      }
    }
  });
}
//step: 1
export function createMap(t){
  //初始化地图
  MyMap.create( (map) => {
    t._bmap = map;
  });
}
//step: 2
export function autoMatch(city, address){
  var self = this;
  var { autoGetDeliveryStations } = this.props.actions;
  var { delivery_center } = this.refs;
  if(!city || !address){
    Noty('error', '地址数据有误');
  }
  return new Promise((resolve, reject) => {
    if(BMap){
      let map = self._bmap;
      map.centerAndZoom(city);
      let localSearch = new BMap.LocalSearch(map);
      localSearch.setSearchCompleteCallback( function(searchResult){
        var poi = searchResult && searchResult.getPoi(0);
        if(poi){
          console.log(poi.point.lng + "," + poi.point.lat);
          autoGetDeliveryStations({
            lng: poi.point.lng,
            lat: poi.point.lat
          })
          .done(function(data){
            setTimeout(function(){
              if(data && data.delivery_id){
                var $dc = $(findDOMNode(delivery_center))
                  .addClass('success-form-animate');
                resolve(data.delivery_id); //成功，且有数据
                setTimeout(function(){
                  $dc.removeClass('success-form-animate');
                }, 820)
              }else{
                reject('服务器异常');
              }
            }, 0);
          })
          .fail(function(msg, code){
            setTimeout(function(){
              if(code && code == '3001'){
                resolve(); //成功，但没有数据
              }else{
                reject('自动检索配送中心异常，请重试');
              }
            }, 0);
          })
        }else{
          reject('没有检索到该收货地址');
        }
      });
      localSearch.search(address);
    }else{
      reject('地图服务加载失败，请稍后再试');
    }
  })
}