/**
 * @des    :
 * @author : pigo
 * @date   : 16/5/18 10:55
 * @email  : zhenglin.zhu@xfxb.net
 */
'use strict';
module.exports = {
    new_password : {
        notEmpty : true,
        // isLength : {
        //     options : [{min : 6}],
        //     errorMessage : '密码长度至少为6位...'
        // },
        matches : {
            options : [/^[a-zA-Z0-9]{6,}$/],
            errorMessage : '密码只能是字母或数字 且 必须至少6位...'
        }
    },
    old_password : {
        notEmpty : true
    },
    verify_new_password : {
        notEmpty : true,
        // isLength : {
        //     options : [{min : 6}],
        //     errorMessage : '密码长度至少为6位...'
        // },
        matches : {
            options : [/^[a-zA-Z0-9]{6,}$/],
            errorMessage : '密码只能是字母或数字 且 必须至少6位...'
        }
    }
};
