import { ajax } from './app.config';

function SiteUrl(s){
  this.url = decodeURIComponent(s);
}

//ajax根路径
SiteUrl.prototype._url_base = ajax;

/*
 * 无参数： 直接返回相应url
 * 有参数： 将参数解析到url并返回
 */
SiteUrl.prototype.toString = function(){
  var u = this.url;
  if(arguments.length){
    for(let i=0,len=arguments.length; i<len; i++){
      u = u.replace(/:\w+/, arguments[i]);
    }
  }
  return this._url_base + u;
}

const URL = (function(){
  /*********************************/
  /****** app url global config ****/
  /*********************************/
  var url = {
    login: '/login',
    provinces: '/provinces',
    cities: '/province/:provinceId/cities',
    districts: '/city/:cityId/districts',
    delivery_stations: '/stations',
    order_srcs: '/srcs',
  };

  for(var a in url){
    url[a] = new SiteUrl(url[a]);
  }
  return url;

})();

export default URL;