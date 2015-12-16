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
        msg  : 'everything goes well -> enjoy yourself...',
    },
    INVALID_USERNAME_OR_PASSWORD : {
        code : '1000',
        msg  : '用户名或密码输入有误,请重新输入',
    },
    SESSION_TIME_OUT : {
        code : '1001',
        msg : '长时间未操作,请重新登录...'
    },
    NO_MORE_RESULTS : {
        code : '9998',
        msg : 'no more results...'
    },
    FAIL : {
        code : '9999',
        msg  : '服务器开小差了...',
    },

};

