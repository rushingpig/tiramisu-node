/**
 * @des    :
 * @author : pigo
 * @date   : 16/3/24
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
var roleService = require('../../../../service/sys/role_service');
module.exports = function(router){
//*********************
//******** GET ********
//*********************
    router.get('/role/dataScopes',roleService.getRoleDataScopes);
    router.get('/roles',roleService.listRoles);
    router.get('/role/:roleId',roleService.getRoleDetail);

//**********************
//******** POST ********
//**********************
    router.post('/role',roleService.addRole);



//*********************
//******** PUT ********
//*********************
    router.put('/role/:roleId',roleService.editRole);
    router.put('/role/:roleId/privileges',roleService.allocatePrivileges);

//************************
//******** DELETE ********
//************************
    router.delete('/role/:roleId',roleService.deleteRole);

};
