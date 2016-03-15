import MyMap from 'utils/MyMap';
import {findDOMNode} from 'react-dom';
import { SELECT_DEFAULT_VALUE } from 'config/app.config';
import Promise from 'utils/promise';
import { Noty } from 'utils/index';
import { triggerFormUpdate } from 'actions/form';

//完整封装
export default function autoMatchDeliveryStations(success_cb, fail_cb){
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
        autoMatch.call(self, city, district + detail).done(success_cb).fail(fail_cb);
      }
    }
  });
}
//step: 1
export function createMap(t){
  //初始化地图
  MyMap.create( (map, geocoder) => {
    t._bmap = geocoder; //解析地址貌似只需要 geocoder就够了
  });
}
//step: 2
export function autoMatch(city, address){
  var self = this;
  var { autoGetDeliveryStations } = this.props.actions;
  if(!city || !address){
    Noty('error', '地址数据有误');
  }
  
  return new Promise((resolve, reject) => {
    if(BMap){
      let map = self._bmap;
      map.getPoint(address, function(poi){
        if(poi){
          autoGetDeliveryStations({
            lng: poi.lng,
            lat: poi.lat
          })
          .done(function(data){
            setTimeout(function(){
              if(data && data.delivery_id){
                resolve(data.delivery_id); //成功，且有数据
              }else{
                reject('服务器异常');
              }
            }, 0);
          })
          .fail(function(msg, code){
            setTimeout(function(){
              if(code && code == '3001'){
                reject(); //成功，但没有数据
              }else{
                reject('自动检索配送中心异常，请重试');
              }
            }, 0);
          })
        }else{
          reject();
        }
      }, city);
    }else{
      reject('地图服务加载失败，请稍后再试');
    }
  })
  .done(autoMatchSuccess.bind(this))
  .fail(autoMatchFail.bind(this))
  .done(addEffect.bind(this, 'alert-success'))
  .fail(addEffect.bind(this, 'alert-danger'))
}

function addEffect(animate_name){
  var $dc = $(findDOMNode(this.refs.delivery_center)).removeClass('alert-success alert-danger').addClass(animate_name);
  // setTimeout(function(){
  //   $dc.removeClass(animate_name);
  // }, 1000);
}

export function autoMatchSuccess(){
  this.setState({auto_match_delivery_center: true, auto_match_msg: '已成功匹配！'});
}

export function autoMatchFail(msg){
  this.setState({auto_match_delivery_center: false, auto_match_msg: msg || '无法准确定位配送中心，请与客户联系后手动选择！'});
}