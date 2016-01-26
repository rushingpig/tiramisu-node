/**
 * @des    : the definition of the api response json object
 * @author : pigo.can
 * @date   : 15/12/11 下午1:29
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
"use strict";
// TODO according to need to decorate these hints
module.exports = {
    OK : {
        code : '0000',
        msg  : 'everything goes well -> enjoy yourself...'
    },
    INVALID_USERNAME_OR_PASSWORD : {
        code : '1000',
        msg  : '用户名或密码输入有误,请重新输入...'
    },
    SESSION_TIME_OUT : {
        code : '1001',
        msg : '长时间未操作,请重新登录...'
    },
    ERROR_VALIDATE_CODE : {
        code : '1002',
        msg : '验证码输入有误,请重新输入...'
    },
    ORDER_AUDITING : {
        code : '2000',
        msg : '有订单打印正在审核中,请等待审核通过...'
    },
    ORDER_NO_PRINT : {
        code : '2001',
        msg : '有订单打印不被允许,请重新申请打印...'
    },
    ORDER_COMPLETED : {
        code : '2002',
        msg : '订单已签收,请勿重复签收...'
    },
    ORDER_EXCEPTION : {
        code : '2003',
        msg : '订单已被未签收,请勿重复签收...'
    },
    ORDER_NO_STATION : {
        code : '2004',
        msg : '订单不处于分配配送站状态,不能被转换...'
    },
    NO_MORE_PAGE_RESULTS : {
        code : '9998',
        msg : 'no more results...',
        data : {
            list : [],
            total : 0
        },
        page_no : -1
    },
    OPTION_EXPIRED : {
        code : '9995',
        msg : '啊哈,有人捷足先登了,重新获取最新记录吧...'
    },
    INVALID_UPDATE_ID : {
        code : '9996',
        msg : '指定的更新记录无效...'
    },
    INVALID_PARAMS : {
        code : '9997',
        msg : '非法请求参数...'
    },
    NO_MORE_RESULTS : {
        code : '9998',
        msg : 'no more results...'
    },
    FAIL : {
        code : '9999',
        msg  : '服务器开小差了...'
    },
    GET_LOST : {
        code : '404',
        msg : '迷路了,换条道吧...'
    }

};

