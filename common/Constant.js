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
 * the delivery type
 * @type {{}}
 */
Constant.DT = {
    TAKETHEIR : 'TAKETHEIR',
    DELIVERY : 'DELIVERY'
};
/**
 * the order status
 * @type {{}}
 */
Constant.OS = {
    CANCEL : 'CANCEL',  // 取消
    UNTREATED : 'UNTREATED',    // 未处理
    TREATED : 'TREATED',    // 已处理
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
    DELIVER_LIST : 'DELIVERY_LIST',      // 送货单管理列表
    RECEIVE_LIST : 'RECEIVE_LIST'     // 配送管理列表
};
/**
 * the order print apply status
 * @type {{}}
 */
Constant.OPS = {
    UNAUDIT : 'UNAUDIT',    //  未审核
    AUDITED : 'AUDITED',    // 审核通过
    AUDITFAILED : 'AUDITFAILED' // 审核不通过
};
/**
 * print status
 * @type {{PRINTABLE: string, UNPRINTABLE: string, AUDITING: string, REPRINTABLE: string}}
 */
Constant.PS = {
    PRINTABLE : 'PRINTABLE',
    UNPRINTABLE : 'UNPRINTABLE',
    AUDITING : 'AUDITING',
    REPRINTABLE : 'REPRINTABLE'
};
/**
 * the type of pay for
 * @type {{}}
 */
Constant.PFT = {
    CASH : 'CASH',
    FULL_REFUND:'FULL_REFUND'
};



module.exports = Constant;
