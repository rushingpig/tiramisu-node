export default [{
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
    "key": "OrderRefundAccess",
    "name": "退款管理",
    "icon": "",
    "link": "/om/refund",
  }, {
    "key": "OrderInvoiceAccess",
    "name": "发票管理",
    "icon": "",
    "link": "/om/invoice",
  }, {
    "key": "OrderVATInvoiceAccess",
    "name": "专用发票信息管理",
    "icon": "",
    "link": "/om/VATinvoice",
  },{
    "key": "om_winning",
    "name": "中奖管理",
    "icon": "",
    "link": "/om/winning",
  }, {
    "key": "OrderAbnormalManageAccess",
    "name": "错误订单管理",
    "icon": "",
    "link": "/om/ao",
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
    "name": "订单完成管理", //以前叫：配送单管理
    "icon": "",
    "link": "/dm/distribute",
  }, {
    "key": "PrintReviewAccess",
    "name": "打印审核",
    "icon": "",
    "link": "/dm/review",
  },{
    "key": "DeliveryManSalaryManageAccess",
    "name": "配送员工资管理",
    "icon": "",
    "link": "/dm/salary"
  }]
}, {
  "key": "station_management",
  "name": "配送管理",
  "short_name": "配送",
  "icon": "",
  "link": [{
    "key": "StationManageAccess",
    "name": "配送站管理",
    "icon": "",
    "link": "/sm/station"
  }, {
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
  }, {
    "key": "CityManageAccess",
    "name": "城市管理",
    "icon": "",
    "link": "/cm/city",    
  }, {
    "key": "ImageManageAccess",
    "name": "图片文件管理",
    "icon": "",
    "link": "/cm/img"
  }]
}, {
  "key": "ProductionManage",
  "name": "产品管理",
  "short_name": "产品",
  "icon": "",
  "link": [{
    "key": "ProductionManageAccess",
    "name": "商品管理",
    "icon": "",
    "link": "/pm/sku_manage"
  }, {
    "key": "CategoryManageAccess",
    "name": "类型管理",
    "short_name": "类型",
    "icon": "",
    "link": "/pm/cam"
  }]
}, {
  "key": "operation_manage",
  "name": "运营管理",
  "short_name": "运营",
  "icon": "",
  "link": [{
    "key": "HomePageControlAccess",
    "name": "首页运营控制",
    "icon": "",
    "link": "/opm/hpc"
  }, {
    "key": "ProductSizeManageAccess",
    "name": "规格配置管理",
    "icon": "",
    "link": "/opm/psm"
  }]
}, {
  "key": 'GroupbuyManageAccess',
  'name': '团购管理',
  'short_name': '团购',
  'icon': '',
  'link': [{
    'key': 'GroupbuyProgramManageAccess',
    'name': '团购项目管理',
    'icon': '',
    'link': '/gm/pg',
  }, {
    'key': 'GroupbuyProductManageAccess',
    'name': '团购商品管理',
    'icon': '',
    'link': '/gm/pd',
  },{
    'key': 'GroupbuyCouponManageAccess',
    'name': '团购券管理',
    'link': '/gm/cp',
  }]
}, {
  "key": "authority_manage",
  "name": "权限管理",
  "short_name": "权限",
  "icon": "",
  "link": [{
    "key": "UserManageAccess",
    "name": "用户管理",
    "icon": "",
    "link": "/am/user"
  }, {
    "key": "DeptRoleManageAccess",
    "name": "部门角色管理",
    "icon": "",
    "link": "/am/deptrole"
  }, {
    "key": "RoleAuthorityManageAccess",
    "name": "角色权限管理",
    "icon": "",
    "link": "/am/roleauthority"
  }, {
    "key": "SystemAuthorityManageAccess",
    "name": "系统权限管理",
    "icon": "",
    "link": "/am/systemauthority"
  }]
}, {
  "key": "custom_manage",
  "name": "客户管理",
  "short_name": "客户",
  "icon": "",
  "link":"/cosm"
}];
