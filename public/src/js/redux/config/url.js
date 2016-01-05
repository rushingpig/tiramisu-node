import { ajax } from './app.config';

function SiteUrl(s){
  this.url = decodeURIComponent(s);
}

//ajax根路径
SiteUrl.prototype._url_base = ajax;

/*
 * 无参数： 直接返回相应url
 * 有参数： 将参数解析到url并返回(注意是按顺序解析)
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

    //订单
    orders: '/orders',
    order_add: '/order',
    order_detail: '/order/:orderId',
    save_order: '/order/:orderId',
    submit_order: '/order/:orderId/submit',
    provinces: '/provinces',
    cities: '/province/:provinceId/cities',
    districts: '/city/:cityId/districts',
    delivery_stations: '/stations',
    order_srcs: '/order/srcs',
    pay_modes: '/pay/modes',

    //产品
    categories: '/product/categories',
    products: '/products',
  };

  for(var a in url){
    url[a] = new SiteUrl(url[a]);
  }
  return url;

})();

export default URL;