/**
 * @des    : the config for dev environment
 * @author : pigo.can
 * @date   : 15/12/2 上午10:03
 * @email  : rushingpig@163.com
 * @version: v1.0
 */
"use strict";
//  express static config options
var exp_static_options = {
    dotfiles: "deny",
    etag: true,
    extensions: false,
    index: "/",     // 设定对根目录的映射
    lastModified: true,
    maxAge:0,
    redirect:true,
    setHeaders:null
};
//  express router config options
var exp_router_options = {
    caseSensitive:false,
    mergeParams:false,
    strict:false
};

//  the table list in database  ->  tiramisu
var tables = {
//================Sys=================
    sys_history: 'sys_history',
    sys_user : 'sys_user',
    sys_role : 'sys_role',
    sys_menu : 'sys_menu',
    sys_user_role : 'sys_user_role',
    sys_role_menu : 'sys_role_menu',
    sys_organization : 'sys_organization',
    sys_role_org : 'sys_role_org',
    sys_city: 'sys_city',
//=================Buss=================
    buss_city : 'buss_city',
    buss_delivery_station : 'buss_delivery_station',
    buss_order :'buss_order',
    buss_order_history : 'buss_order_history',
    buss_order_sku : 'buss_order_sku',
    buss_order_src : 'buss_order_src',
    buss_pay_modes : 'buss_pay_modes',
    buss_product : 'buss_product',
    buss_product_pic : 'buss_product_pic',
    buss_product_category : 'buss_product_category',
    buss_product_category_regionalism : 'buss_product_category_regionalism',
    buss_recipient : 'buss_recipient',
    buss_shop : 'buss_shop',
    buss_product_sku : 'buss_product_sku',
    buss_product_sku_booktime : 'buss_product_sku_booktime',
    buss_order_fulltext : 'buss_order_fulltext',
    buss_print_apply : 'buss_print_apply',
    buss_order_error: 'buss_order_error',
    buss_delivery_record: 'buss_delivery_record',
    buss_delivery_picture: 'buss_delivery_picture',
    buss_image: 'buss_image',
    buss_directory: 'buss_directory',
    buss_refund: 'buss_refund',
    buss_product_detail: 'buss_product_detail',
    buss_product_detail_spec: 'buss_product_detail_spec',
    buss_product_template: 'buss_product_template',
    buss_product_template_data: 'buss_product_template_data',
    buss_product_sku_size: 'buss_product_sku_size',
    buss_product_sku_size_spec: 'buss_product_sku_size_spec',
    buss_company: 'buss_company',
    buss_invoice: 'buss_invoice',
    buss_group_project: 'buss_group_project',
//=================Dict===================
    dict_regionalism : 'dict_regionalism',
    delivery_pay_rule: 'delivery_pay_rule',
//=================APP===================
    app_user_auths : 'app_user_auths',
    app_user_blacklist : 'app_user_blacklist',
    app_user_delivery_address : 'app_user_delivery_address',
    app_user_favorites : 'app_user_favorites',
    app_user_profiles : 'app_user_profiles',
    logs_user_login : 'logs_user_login'
};
//  mysql config options
var mysql_options = {
    acquireTimeout  : 10000,
    waitForConnections : true,
    queueLimit      : 2000,
    connectionLimit : 50,
    host            : 'rds6612933l1ooqks2sj.mysql.rds.aliyuncs.com',
    port            : 3306,
    user            : 'tiramisu_pro',
    password        : 'Tiramisupro2016',
    database        : 'tiramisu',
    charset         : 'utf8mb4',
    timezone        : 'local',
    supportBigNumbers : true,
    multipleStatements : true,  //  if in the production recommend to be false
    dateStrings     : true, //  Force date types (TIMESTAMP, DATETIME, DATE) to be returned as strings rather then inflated into JavaScript Date objects.
    debug           : false //  when in production or test environment ,it should be set to false. it just be used in dev

};
//  express session config options
var exp_session_options = function(store){
    return {
        secret : 'tiramisu cake',
        resave : true,
        saveUninitialized : false,
        name : 'tiramisu.sid',
        unset : 'keep',
        store : new store({
            host : mysql_options.host,
            port : mysql_options.port,
            user : mysql_options.user,
            password : mysql_options.password,
            database : mysql_options.database,
            checkExpirationInterval : 3600000,
            expiration : 72000000,
            createDatabaseTable : true,
            schema: {
                tableName: 'sys_user_session',
                columnNames: {
                    session_id: 'session_id',
                    expires: 'expires',
                    data: 'data'
                }
            }
        }),
        cookie : {
            secure : false,
            // maxAge : 72000000
            //expires : new Date(Date.now() + 1000000)
            // expires : false
        }
    };
};

//  exclude path arrays of login filter
var exclude_paths = ['/','/v1/a/login','/payment'];
const global_paths = [
    /\/v1\/a\/provinces/,
    /\/v1\/a\/province\/\d+\/cities/,
    /\/v1\/a\/city\/\d+\/districts/,
    /\/v1\/a\/cities/,
    /\/v1\/a\/district\/\d+\/shops/
];
var white_ips = [
    // localhost
    '1',
    '127.0.0.1',
    // internal xfxb_ecommerce
    '10.45.185.126',
    // internal xfxb_qa
    // '10.46.89.45',
    // internal production
    '10.45.190.193',
    // 聚石塔LANIP
    '10.132.164.32'
];

var log4js_options = {
    reloadSecs: 3000 ,   // the interval to reload the log4js config file
    cwd : '/xfxb/logs/tiramisu'
};

var ping_xx = {
    apiKey: 'sk_test_ibbTe5jLGCi5rzfH4OqPW9KC'
};

var sms_host = "http://127.0.0.1:3000/sms/internal";
var use_sms = true;

var coupon_host = "http://120.76.101.107:3000";

var tartetatin_host = 'http://127.0.0.1:3007';

var img_host = 'http://qn.blissmall.net/';

var login_required = true;

var base_excel_host = 'http://localhost:8888/excel';
// 导出excel的远程host
var excel_export_host = base_excel_host + '/order/';

var backup_host = 'http://localhost:3001';
var mongodb_uri = 'mongodb://tiramisu_qa:2VMIfXEdACzj@10.46.89.45:27017/tiramisu';
var mongodb_backup_schema_name = 'order';
var express_host = 'http://exp.blissmall.net/express/get';

module .exports = {
    exp_static_options : exp_static_options,
    exp_session_options : exp_session_options,
    exp_router_options : exp_router_options,
    tables : tables,
    login_required: login_required,
    mysql_options : mysql_options,
    log4js_options : log4js_options,
    exclude_paths : exclude_paths,
    global_paths: global_paths,
    white_ips : white_ips,
    sms_host : sms_host,
    coupon_host : coupon_host,
    tartetatin_host: tartetatin_host,
    img_host: img_host,
    excel_export_host : excel_export_host,
    backup_host: backup_host,
    mongodb_uri: mongodb_uri,
    express_host : express_host,
    base_excel_host : base_excel_host,
    mongodb_backup_schema_name: mongodb_backup_schema_name
};
