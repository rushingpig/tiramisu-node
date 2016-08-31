/**
 * @des    : the router of module order
 * @author : pigo
 * @date   : 16/3/24
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
var service = require('../../../../service'),
    appUserService = service.appUser;
module.exports = function (router) {
//*********************
//******** GET ********
//*********************

    router.get('/app/users',appUserService.listAppUsers);   // 获取app用户列表
    router.get('/app/user/:uuid',appUserService.getAppUserInfo);    //  获取app用户详情
    router.get('/app/user/:uuid/loginLogs',appUserService.getUserLoginLogs);    // 获取app用户登录日志
    router.get('/app/users/export',appUserService.exportExcel);

//**********************
//******** POST ********
//**********************

    router.post('/app/user/:uuid',appUserService.addBlackList);     // 将用户加入到黑名单

//*********************
//******** PUT ********
//*********************


//************************
//******** DELETE ********
//************************
};
