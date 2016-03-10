export default [
{
  "key": "order_management",
  "name": "订单管理",
  "short_name": "订单",
  "icon": "clipboard",
  "link": [{
      "key": "OrderManage", //key值，主要用来进行访问权限控制
      "name": "订单管理",
      "icon": "",
      "link": "/om/index"
  }, {
      "key": "OrderRefund",
      "name": "退款管理",
      "icon": "",
      "link": "/om/refund",
  }, {
      "key": "om_invoice",
      "name": "发票管理",
      "icon": "",
      "link": "/om/invoice",
  }, {
      "key": "om_winning",
      "name": "中奖管理",
      "icon": "",
      "link": "/om/winning",
  }]
}, {
  "key": "delivery_management",
  "name": "送货管理",
  "short_name": "送货",
  "icon": "truck",
  "link": [{
      "key": "DeliveryChange",
      "name": "订单转送货单",
      "icon": "",
      "link": "/dm/change"
  }, {
      "key": "DeliveryManage",
      "name": "送货单管理",
      "icon": "",
      "link": "/dm/delivery",
  }, {
      "key": "DistributeManage",
      "name": "配送单管理",
      "icon": "",
      "link": "/dm/distribute",
  }, {
      "key": "PrintReview",
      "name": "打印审核",
      "icon": "",
      "link": "/dm/review",
  }]
}, {
  "key": "station_management",
  "name": "配送管理",
  "short_name": "配送",
  "icon": "",
  "link": [{
      "key": "sm_station",
      "name": "配送站管理",
      "icon": "",
      "link": "/sm/station"
  },{
      "key": "sm_scope",
      "name": "配送区域管理",
      "icon": "",
      "link": "/sm/scope"
  }]
}];
