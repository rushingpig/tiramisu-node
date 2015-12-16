/**
 * @des    :
 * @author : pigo.can
 * @date   : 15/12/16 下午3:40
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
"use strict";
module.exports = {
    wrapService: (next,promise)=> {
        promise.catch((err)=> {
            next(err);
        });
    },
};
