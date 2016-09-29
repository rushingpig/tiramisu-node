import { ajax } from './app.config';

function SiteUrl(s) {
  this.url = decodeURIComponent(s);
}

//ajax根路径
SiteUrl.prototype._url_base = ajax;

/*
 * 无参数： 直接返回相应url
 * 有参数： 将参数解析到url并返回(注意是按顺序解析)
 */
SiteUrl.prototype.toString = function() {
  var u = this.url;
  if (arguments.length) {
    for (let i = 0, len = arguments.length; i < len; i++) {
      u = u.replace(/:\w+/, arguments[i]);
    }
  }
  return this._url_base + u;
}

const URL = (function() {
  /*********************************/
  /****** app url global config ****/
  /*********************************/
  var url = {
    login: '/login',

    //订单
    orders:                   '/orders',
    order_add:                '/order',
    order_detail:             '/order/:orderId',
    save_order:               '/order/:orderId',
    submit_order:             '/order/:orderId/submit',
    provinces:                '/provinces',
    cities:                   '/province/:provinceId/cities',
    districts:                '/city/:cityId/districts',
    districts_and_city:       '/city/:cityId/cities',
    pay_modes:                '/pay/modes',
    order_sign:               '/order/:orderId/signin',
    order_unsign:             '/order/:orderId/unsignin',
    order_sign_edit:          '/delivery/order/:orderId/signrecord',
    order_opt_record:         '/order/:orderId/history',
    order_exception:          '/order/:orderId/exception',
    cancel_order:             '/order/:orderId/cancel',
    alter_delivery:           '/order/:orderId/delivery',
    alter_station:            '/order/:orderId/station',
    alter_order_remarks:      '/order/:orderId/remarks',
    check_groupbuy_psd:       '/coupon', //验券
    abnormal_order:           '/error/orders',
    change_error_deal_status: '/error/order/:merchantId/:srcId',
    orders_export:            '/orders/export', //导出的唯一接口（根据参数转化）

    order_srcs:       '/order/srcs',
    add_order_src:    '/order/src',
    delete_order_src: '/order/src/:srcId',
    update_order_src: '/order/src/:srcId',

    //退款
    refund_apply:             '/refund',  //申请退款
    get_refund_apply_data:    '/order/:orderId/refund/option',  //获取申请退款需要的数据
    get_refund_detail:        '/refund/:refundId',  //获取退款详情
    bind_orders:              '/order/:orderId/relate/list',  //获取订单关联历史记录
    refund_history:           '/refund/:refundId/history',  //获取退款历史记录
    handle_refund:            '/refund/:refundId',  //编辑/审核/完成退款
    cancel_refund:            'refund/:refundId',  //取消退款
    refund_list:              '/refund/list',  //获取退款列表
    edit_refund_remark:       '/refund/:refundId/remarks',  //修改退款备注
    refund_reasons:           '/refund/reason/type', //获取退款原因
    refund_export:            '/refunds/export', //退款导出

    //发票
    company_review: '/company/:companyId/review', //公司审核
    company_del:    '/company/:companyId', //删除公司
    get_invoice_list: '/invoice/list',    //获取发票列表
    invoice_apply:    '/invoice',         //发票申请
    invoice_edit:     '/invoice/:invoiceId', //发票编辑
    order_invoice_data: '/order/:orderId/invoice/option',  //根据订单获取发票所需数据
    invoice_data: '/invoice/:invoiceId',  //获取发票信息
    invoice_get_company: '/invoice/company/list', //添加发票时获取公司
    invoice_opt_history: '/invoice/:invoiceId/history', //获取发票历史记录
    invoice_del:         '/invoice/:invoiceId',         //删除发票
    add_invoice_remarks: '/invoice/:invoiceId/remarks', //添加备注
    invoice_express_edit: '/invoice/:invoiceId/express', //编辑物流
    invoice_delivery_trace: '/express/info', //追踪物流
    invoice_export: '/invoices/export', //导出发票信息

    add_company:       '/company',   //添加开发票的公司
    edit_company:      '/company/:companyId', // 编辑开发票公司
    get_company_list:  '/company/list', //获取公司列表
    company_opt_history: '/company/:companyId/history', //获取公司操作记录
    company_invoice_history: '/company/:companyId/invoice/history', //公司开票历史记录

    //产品
    categories: '/product/categories',
    products:   '/products',

    // 类目管理
    allGeographies:           '/provinces/cities',
    searchCategories:         '/product/categories/search',
    searchCategoriesWithName: '/product/categories/name',
    getCategoryComment:       '/product/category/:id/remarks',
    addPrimaryCategory:       '/product/categories/primary',
    editPrimaryCategory:      '/product/category/primary',
    addSecondaryCategory:     '/product/categories/secondary',
    editSecondaryCategory:    '/product/category/secondary',
    deleteSecondaryCategory:  '/product/categories/:id',
    getCategoryDetail:        '/product/category/:id/details',
    sortCategories:           '/product/categories/sort',
    activatedCity:            '/product/category/:id/regions/pc',
    getAllSkuSize:            '/product/sku/size',
    addSku:                   '/product/sku',
    saveEditSku:              '/product/sku',
    getSku:                   '/product/skus/details',
    searchSku:                '/product/details',
    viewSku:                  '/product/skus',
    viewSkuSpec:              '/product/skus/price',
    deleteSku:                '/product/skus',
    exportSkuDetail:          '/product/skus/details',
    product_cities:           '/product/info/cities',
    product_info:             '/product/info',
    
    //送货管理
    order_exchange:     '/orders/exchange', //订单转送单列表
    order_delivery:     '/orders/delivery', //送货单管理列表
    order_distribute:   '/orders/signin', //配送单管理列表
    print:              '/orders/print',
    apply_print:        '/order/reprint/apply', //申请打印
    print_review_list:  '/order/reprint/applies',
    review_print_apply: '/order/reprint/apply/:apply_id', //审核申请
    reprint_validate: '/order/:orderId/validate',
    reprint: '/order/:orderId/reprint', //重新打印
    order_deliverymans: '/order/:orderId/deliverymans',  //获取订单可选的的配送员列表
    accessory_list: '/product/accessory/order/:orderId',  //配件列表
    order_accessory_list: '/order/:orderId/products', //订单的配件列表

    //配送员
    deliveryman:       '/delivery/deliverymans',
    deliveryman_apply: '/delivery/deliveryman', //分配配送员
    deliveryman_city: '/city/:cityId/deliverymans', //获取指定城市的配送员

    //地址
    stations: '/stations', //配送站
    shops:    '/district/:districtId/shops', //门店
    auto_loc: '/delivery/autoAllocate', //自动分配配送站

    //配送站管理
    station_list: '/stations/search', //配送站列表
    station_get: '/station/',//获取配送站
    station_add: '/station/',//添加配送站
    station_change:'/station/:stationId',//修改配送站
    station_delete: '/station/:station_id',
    //配送区域管理
    station_scope: '/station/scope/:stationId', //配送范围
    station_multiple_scope_change: '/stations/scope', //批量修改配送站范围
    station_scope_change:'station/:stationId/coords',//修改配送范围
    delivery_export: '/delivery/record/export', //导出配送记录
    delivery_proof: '/delivery/order/:orderId/proof', //获取配送凭证
    delivery_record: '/delivery/record', //获取配送记录
    delivery_opt_record: '/delivery/order/:orderId/history/record', //获取配送操作记录
    update_delivery_record: '/delivery/order/:orderId/record', //修改配送记录

    //权限
    dept_list_info: '/orgs',   //所有部门信息
    user_list_info: '/users',  //用户列表信息
    user_usable_alter:'/user/:userId/usable',  //改变用户状态
    
    user_delete:'/user/:userId', //删除用户
    user_detail: '/user/:userId',  //
    submit_user:'/user/:userId',  // 用户编辑
    user_add:'/user',   //添加用户

    role_detail:'/role/:roleId',   //角色详情
    role_list_info: '/roles',  //角色信息
    role_add:'/role',     //角色添加
    role_del:'/role/:roleId',  //删除角色
    role_edit:'/role/:roleId', //角色编辑
    station_merge_list:'/stations',  //获取多个城市下配送站
    all_cities:'/cities',  //获取所有城市
    
    role_data_access:'/role/dataScopes',       //角色数据权限
    dept_add:'/org',      //添加部门

    role_list: '/roles',//角色列表
    authority_list: '/privileges',//权限列表
    authority_role_distribute: '/role/:roleId/privileges',//角色权限分配
    authority_role: '/role/dataScopes',//角色权限获取
    authority_delete: '/privilege/:privilegeId',//删除权限
    authority_add: '/privilege',//添加权限
    authority_change: '/privilege/:privilegeId',//修改权限
    authority_detail:'/privilege/:privilegeId',//获取权限详情
    module_add: '/module',//添加模块
    module_edit: '/module/:moduleId', //编辑模块
    module_list:'/privileges/modules',

    //顾客账户管理
    customer_list: '/app/users',
    customer: '/app/user/:uuid', //用户详情
    customer_logs: '/app/user/:uuid/loginLogs', //登录日志
    customer_black: '/app/user/:uuid', //加入黑名单
    customer_export: '/app/users/export',

    //城市管理
    open_city_add : '/city',  //添加开通城市
    open_city_update: '/city/:cityId/info', //修改开通城市
    open_city_delete: '/city/:cityId',
    open_city_list: '/citys', //获取开通城市列表
    regionalism_list: '/regionalisms', //获取地区列表
    open_city_detail: '/city/:cityId/info',

    //后台用户管理
    alter_psd: '/user/:username/password', //修改密码

    //图片管理
    images: '/image',
    create_img_dir: '/image/dir',
    delete_img: '/image/delete',
    move_img: '/image/move',
    rename_img: '/image/name',
    all_img_dir: '/image/dir',

    //团购
    sku_size: '/product/sku/size', //所有已存在size
    add_groupbuys_sku: '/group/buying/sku', //添加团购sku,
    get_groupbuys_sku_list: '',
    groupbuy_sku_off_shelf: '/group/buying/sku/:skuId',
    groupbuy_pg_add_sku_list: '/group/buying/sku/list',

    add_program : '/group/buying/project', //添加团购项目,
    edit_program: '/group/buying/project/:projectId', //编辑团购项目，
    del_program:  '/group/buying/project/:projectId', //下架团购项目，
    get_program_list : '/group/buying/project/list', //获取团购项目列表,
    get_product_spu_list: '/group/buying/product/list', //获取团购可供选择商品列表，
    get_groupbuys_program_detail: '/group/buying/project/:projectId', //获取团购项目详情
    edit_groupbuy_pd: '/group/buying/sku/:skuId', //编辑团购商品
    get_groupbuy_sku_list: '/group/buying/sku/list', //获取团购商品列表

    //运营管理
    manage_product_sizes: '/product/skus/sizes', //获取产品所有规格
    manage_size_add: '/product/skus/sizes', //新增管理规格
    manage_size_edit: '/product/skus/sizes/specs', //编辑规格管理
    manage_product_sizes_by_name: '/product/skus/sizes/name', //根据名字获取产品规格
    manage_size_online: '/product/skus/sizes/online', //上架
    manage_size_move: '/product/skus/sizes/sort', //规格移动
  };

  for (var a in url) {
    url[a] = new SiteUrl(url[a]);
  }
  return url;

})();

export default URL;
