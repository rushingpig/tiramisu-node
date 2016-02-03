'use strict';
//  express static config options
var exp_static_options = {
  dotfiles: "ignore",
  etag: true,
  extensions: false,
  index: "/",     // 设定对根目录的映射
  lastModified: true,
  maxAge: 0,
  redirect: true,
  setHeaders: null
};
//  express session config options
var exp_session_options = {
  secret: 'tiramisu cake',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false,
    //maxAge : 1000000,
    //expires : new Date(Date.now() + 1000000)
    expires: false
  }
};
//  express router config options
var exp_router_options = {
  caseSensitive: false,
  mergeParams: false,
  strict: false
};
const exp_validator_custom = {
  customValidators: {
    isArray: function (value) {
      return value && Array.isArray(value);
    },
    gte: function (param, num) {
      return param >= num;
    },
    isOrderId: function (orderId) {
      return typeof orderId === 'string' && orderId.length === 16 && orderId.substring(8) && !isNaN(parseInt(orderId.substring(8)))
    },
    isOrderIds: function (orderIds) {
      if (!orderIds || !Array.isArray(orderIds)) {
        return false;
      }
      let result = true;
      for (let i = 0; i < orderIds.length; i++) {
        let orderId = orderIds[i];
        result = typeof orderId === 'string' && orderId.length === 16 && orderId.substring(8) && !isNaN(parseInt(orderId.substring(8)));
        if (!result) {
          break;
        }
      }
      return result;
    }
  }
};
//  the table list in database  ->  tiramisu
var tables = {
  //================Sys=================
  sys_user: 'sys_user',
  sys_role: 'sys_role',
  sys_menu: 'sys_menu',
  sys_user_role: 'sys_user_role',
  sys_role_menu: 'sys_role_menu',
  //=================Buss=================
  buss_city: 'buss_city',
  buss_delivery_station: 'buss_delivery_station',
  buss_order: 'buss_order',
  buss_order_history: 'buss_order_history',
  buss_order_sku: 'buss_order_sku',
  buss_order_src: 'buss_order_src',
  buss_pay_modes: 'buss_pay_modes',
  buss_product: 'buss_product',
  buss_product_category: 'buss_product_category',
  buss_recipient: 'buss_recipient',
  buss_shop: 'buss_shop',
  buss_product_sku: 'buss_product_sku',
  buss_order_fulltext: 'buss_order_fulltext',
  buss_print_apply: 'buss_print_apply',
  //=================Dict===================
  dict_regionalism: 'dict_regionalism',
};
//  mysql config options
var mysql_options = {
  acquireTimeout: 10000,
  waitForConnections: true,
  queueLimit: 100,
  connectionLimit: 50,
  host: 'rds6612933l1ooqks2sj.mysql.rds.aliyuncs.com',
  port: 3307,
  user: 'tiramisu_qa',
  password: 'tiramisuqa',
  database: 'tiramisu',
  charset: 'utf8_general_ci',
  timezone: 'local',
  supportBigNumbers: true,
  multipleStatements: true,  //  if in the production recommend to be false
  dateStrings: true, //  Force date types (TIMESTAMP, DATETIME, DATE) to be returned as strings rather then inflated into JavaScript Date objects.
  debug: true, //  when in production ,it should be set to false. it just be used in dev/test
};

//  exclude path arrays of login filter
var exclude_paths = ['/', '/v1/a/login', '/payment'];

var white_ips = ['1', '127.0.0.1'];

var log4js_options = {
  reloadSecs: 3000,   // the interval to reload the log4js config file
  cwd: './log/'
};

var ping_xx = {
  apiKey: 'sk_test_ibbTe5jLGCi5rzfH4OqPW9KC'
};

var login_required = true;

module.exports = {
  exp_static_options: exp_static_options,
  exp_session_options: exp_session_options,
  exp_router_options: exp_router_options,
  exp_validator_custom: exp_validator_custom,
  tables: tables,
  ping_xx: ping_xx,
  login_required: login_required,
  mysql_options: mysql_options,
  log4js_options: log4js_options,
  exclude_paths: exclude_paths,
  white_ips: white_ips
};

