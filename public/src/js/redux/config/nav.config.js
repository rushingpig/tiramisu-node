export default [
{
  "key": "order_management",
  "name": "订单管理",
  "short_name": "订单",
  "icon": "clipboard",
  "link": [{
      "key": "OrderManageAccess", //key值，主要用来进行访问权限控制
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
      "key": "DeliveryChangeAccess",
      "name": "订单转送货单",
      "icon": "",
      "link": "/dm/change"
  }, {
      "key": "DeliveryManageAccess",
      "name": "送货单管理",
      "icon": "",
      "link": "/dm/delivery",
  }, {
      "key": "DistributeManageAccess",
      "name": "订单完成管理",  //以前叫：配送单管理
      "icon": "",
      "link": "/dm/distribute",
  }, {
      "key": "PrintReviewAccess",
      "name": "打印审核",
      "icon": "",
      "link": "/dm/review",
  }]
},{
  "key": "station_management",
  "name": "配送管理",
  "short_name": "配送",
  "icon": "",
  "link": [{
     "key": "StationManageAccess",
     "name": "配送站管理",
     "icon": "",
     "link": "/sm/station"
  },{
     "key": "StationScopeManageAccess",
     "name": "配送区域管理",
     "icon": "",
     "link": "/sm/scope"
  }]
}, {
  "key": "central_management",
  "name": "集合管理",
  "short_name": "集合",
  "icon": "",
  "link": [{
      "key": "SrcChannelManageAccess",
      "name": "订单来源渠道",
      "icon": "",
      "link": "/cm/src"
  }]
},{
  "key":"authority_manage",
  "name":"权限管理",
  "short_name":"权限",
  "icon":"",
  "link": [{
      "key":"UserManageAccess",
      "name":"用户管理",
      "icon":"",
      "link":"/am/user"
      },{
        "key":"DeptRoleManageAccess",
        "name":"部门角色管理",
        "icon":"",
        "link":"/am/deptrole"
      },{
        "key":"role_authority_management",
        "name":"角色权限管理",
        "icon":"",
        "link":"/am/roleauthority"        
      },{
        "key":"system_authority_management",
        "name":"系统权限管理",
        "icon":"",
        "link":"/am/systemauthority"        
      }]
}];
