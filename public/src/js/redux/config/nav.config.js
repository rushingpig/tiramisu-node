export default [
{
  "key": "order_management",
  "name": "订单管理",
  "short_name": "订单",
  "icon": "clipboard",
  "link": [{
      "key": "om_index",
      "name": "订单管理",
      "icon": "",
      "link": "/om/index"
  }, {
      "key": "om_refund",
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
      "key": "dm_process",
      "name": "订单转送货单",
      "icon": "",
      "link": "/dm/process"
  }, {
      "key": "dm_refund",
      "name": "送货单管理",
      "icon": "",
      "link": "/dm/delivery",
  }, {
      "key": "dm_invoice",
      "name": "配送单管理",
      "icon": "",
      "link": "/dm/distribute",
  }, {
      "key": "dm_review",
      "name": "打印审核",
      "icon": "",
      "link": "/dm/review",
  }]
}];
