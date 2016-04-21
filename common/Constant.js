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
    COLLECT : 'COLLECT',
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
 * @type {{COLLECT: string, DELIVERY: string}}
 */
Constant.DTD = {
    COLLECT : '门店自提',
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
Constant.PTSD = {
    PRINTABLE : '否',
    UNPRINTABLE : '是',
    AUDITING : '是',
    REPRINTABLE : '否'
};
/**
 * the type of pay for
 * @type {{}}
 */
Constant.PFT = {
    CASH : 'CASH',
    FULL_REFUND:'FULL_REFUND'
};
/**
 * the data scop for different role to see
 * @type {{}}
 */
Constant.DS = {
    ALLCOMPANY : {
        id : 1,
        name : '全公司'
    },
    OFFICEANDCHILD : {
        id : 2,
        name : '所属部门全部用户'
    },
    // OFFICE : {
    //     id : 3,
    //     name : '本部门'
    // },             
    STATION : {
        id : 4,
        name : '所属配送站所有订单'
    },
    CITY : {
        id : 5,
        name : '所属城市所有订单'
    },
    SELF_DELIVERY : {
        id : 6,
        name : '单个配送员的全部订单'
    },
    SELF_CHANNEL : {
        id : 7,
        name : '所属渠道的全部订单'
    },
    STATION_ALL_USERS : {
        id : 8,
        name : '所属配送站全部用户'
    }
};

Constant.BUSS_ORDER_ERROR = {
  TYPE: {
    GENERAL: 0,
    SYSTEM_ERROR: 1,
    NOTIFY_MANAGER: 2
  },
  STATUS: {
    OPEN: 0,
    CLOSE: 1
  }
};
/**
 * the role of deliveryman id in the db
 * @type {number}
 */
Constant.DELIVERYMAN_ID = 4;



module.exports = Constant;
