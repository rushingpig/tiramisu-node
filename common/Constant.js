/**
 * @des    :
 * @author : pigo.can
 * @date   : 15/12/23 下午2:11
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
"use strict";
const Constant = {};
/**
 * the order status
 * @type {{}}
 */
Constant.OS = {
    CANCEL : 'CANCEL',  // 取消
    UNTREATED : 'UNTREATED',    // 未处理
    STATION : 'STATION',    // 已分配配送站
    CONVERT : 'CONVERT',    // 已转换
    INLINE : 'INLINE',  // 生产中
    DELIVERY : 'DELIVERY',  // 已分配配送员
    COMPLETED : 'COMPLETED',    // 订单完成
    EXCEPTION : 'EXCEPTION' //订单异常
};
/**
 * delivery type description
 * @type {{TAKETHEIR: string, DELIVERY: string}}
 */
Constant.DTD = {
    TAKETHEIR : '门店自提',
    DELIVERY : '送货上门'
};
/**
 * is deal or is submit description
 * @type {{0: string, 1: string}}
 */
Constant.YESORNOD = {
    0 : '否',
    1 : '是'
};
/**
 * order status description
 * @type {{}}
 */
Constant.OSD = {
    'CANCEL' : '已取消',
    'UNTREATED' : '未处理',
    'STATION' : '已分配配送站',
    'CONVERT' : '已转换',
    'INLINE' : '生产中',
    'DELIVERY' : '配送中',
    'COMPLETED' : '已完成',
    'EXCEPTION' : '订单异常'
};
/**
 * pay status description
 */
Constant.PSD = {
    'COD' : '货到付款',
    'REFUNDING' : '退款中',
    'REFUNDED' : '退款完成',
    'PAYED' : '已付款'
};
/**
 * the order sorted rules
 * @type {{}}
 */
Constant.OSR = {
    LIST : 'LIST',  // 订单列表
    DELIVERY_EXCHANGE : 'DELIVERY_EXCHANGE',    // 订单转送单
    DELIVERY_LIST : 'DELIVERY_LIST'     // 配送管理列表
};



module.exports = Constant;
