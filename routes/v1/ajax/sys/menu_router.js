/**
 * @des    :
 * @author : pigo
 * @date   : 16/3/24
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
var menuService = require('../../../../service/sys/menu_service');
module.exports = function(router){
//*********************
//******** GET ********
//*********************
    router.get('/privileges',menuService.listMenus);
    router.get('/privilege/:privilegeId',menuService.getMenuDetail);
    router.get('/privileges/modules',menuService.listAllModules);

//**********************
//******** POST ********
//**********************
    router.post('/privilege',menuService.addMenu);
    router.post('/module',menuService.addModule);


//*********************
//******** PUT ********
//*********************
    router.put('/privilege/:privilegeId',menuService.editMenu);

//************************
//******** DELETE ********
//************************
    router.delete('/privilege/:privilegeId',menuService.deleteMenu);

};
