/**
 * @des    :
 * @author : pigo
 * @date   : 16/3/28
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
'use strict';
var orgService = require('../../../../service/sys/org_service');

module.exports = function (router) {
//*********************
//******** GET ********
//*********************

    router.get('/orgs',orgService.listAllOrgs);

//**********************
//******** POST ********
//**********************

    router.post('/org',orgService.addOrg);


//*********************
//******** PUT ********
//*********************

//************************
//******** DELETE ********
//************************
};
