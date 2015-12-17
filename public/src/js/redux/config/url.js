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
  if(arguments.length){
    for(let a in arguments){
      this.url = this.url.replace(/:\w/, arguments[a]);
    }
  }
  return this._url_base + this.url;
}

const URL = (function(){

  var url = {
    login: '/login',
    provinces: '/provinces',
    cities: '/province/:provinceId/cities',
    districts: '/city/:cityId/districts',
  };

  for(var a in url){
    url[a] = new SiteUrl(url[a]);
  }
  return url;

})();

export default URL;