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
    buss_company: 'buss_company',
    buss_invoice: 'buss_invoice',
//=================Dict===================
    dict_regionalism : 'dict_regionalism',
    delivery_pay_rule: 'delivery_pay_rule'
};
//  mysql config options
var mysql_options = {
    acquireTimeout  : 10000,
    waitForConnections : true,
    queueLimit      : 100,
    connectionLimit : 5,
    host            : 'localhost',
    port            : 3306,
    user            : 'root',
    password        : '',
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
            checkExpirationInterval : 60000,
            expiration : 360000000,
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
            // maxAge : 30000
            //expires : new Date(Date.now() + 1000000)
            // expires : false
        }
    };
};

//  exclude path arrays of login filter
var exclude_paths = ['/','/v1/a/login'];

var white_ips = ['1','127.0.0.1'];
var log4js_options = {
    reloadSecs: 3000 ,   // the interval to reload the log4js config file
    cwd : './log/'
};

var sms_host = "http://127.0.0.1:3000/sms/internal";

var coupon_host = "http://120.76.101.107:3000";

var tartetatin_host = 'http://127.0.0.1:3007';

var img_host = 'http://rs.blissmall.net/';

var login_required = true;
// 导出excel的远程host
var excel_export_host = 'http://localhost:8080/excel/order/';

module .exports = {
    exp_static_options : exp_static_options,
    exp_session_options : exp_session_options,
    exp_router_options : exp_router_options,
    tables : tables,
    login_required: login_required,
    mysql_options : mysql_options,
    log4js_options : log4js_options,
    exclude_paths : exclude_paths,
    white_ips : white_ips,
    sms_host : sms_host,
    coupon_host : coupon_host,
    tartetatin_host: tartetatin_host,
    img_host: img_host,
    excel_export_host : excel_export_host
};

