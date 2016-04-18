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
    pay_modes: '/pay/modes',
    order_sign: '/order/:orderId/signin',
    order_unsign: '/order/:orderId/unsignin',
    order_opt_record: '/order/:orderId/history',
    order_exception: '/order/:orderId/exception',
    cancel_order: '/order/:orderId/cancel',
    alter_delivery: '/order/:orderId/delivery',
    alter_station: '/order/:orderId/station',
    check_groupbuy_psd: '/coupon', //验券
    orders_export: '/orders/export', //导出的唯一接口（根据参数转化）

    order_srcs: '/order/srcs',
    add_order_src: '/order/src',
    delete_order_src: '/order/src/:srcId',
    update_order_src: '/order/src/:srcId',

    //产品
    categories: '/product/categories',
    products: '/products',

    //送货管理
    order_exchange: '/orders/exchange', //订单转送单列表
    order_delivery: '/orders/delivery', //送货单管理列表
    order_distribute: '/orders/signin', //配送单管理列表
    print: '/orders/print',
    apply_print: '/order/reprint/apply', //申请打印
    print_review_list: '/order/reprint/applies',
    review_print_apply: '/order/reprint/apply/:apply_id', //审核申请
    reprint_validate: '/order/:orderId/validate',
    reprint: '/order/:orderId/reprint', //重新打印

    //配送员
    deliveryman: '/delivery/deliverymans',
    deliveryman_apply: '/delivery/deliveryman', //分配配送员

    //地址
    stations: '/stations', //配送站
    shops: '/district/:districtId/shops', //门店
    auto_loc: '/delivery/autoAllocate', //自动分配配送站

   //配送站管理
    station_single: '/stations/getStationsByName', //单个配送站
    station_list: '/stations/getStationsByDistrictId', //配送站列表
    station_get: '/station/',//获取配送站
    station_add: '/station/',//添加配送站
    station_change:'/station/:stationId',//修改配送站
    station_delete: '/station/:station_id',
    //配送区域管理
    station_scope: '/station/scope/:stationId', //配送范围
    station_multiple_scope_change: '/stations/scope', //批量修改配送站范围
    station_scope_change:'station/:stationId/coords',//修改配送范围
  };

  for(var a in url){
    url[a] = new SiteUrl(url[a]);
  }
  return url;

})();

export default URL;