/**
 * @des    :
 * @author : pigo
 * @date   : 16/3/24
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
var userService = require('../../../../service/sys/user_service');
module.exports = function(router){
//*********************
//******** GET ********
//*********************
    router.get('/user/:userId',userService.getUserDetail);
    router.get('/users',userService.listUsers);

//**********************
//******** POST ********
//**********************
    router.post('/user',userService.addUser);


//*********************
//******** PUT ********
//*********************
    router.put('/user/:userId/usable',userService.enOrdisableUser);
    router.put('/user/:userId',userService.editUser);

//************************
//******** DELETE ********
//************************
    router.delete('/user/:userId',userService.deleteUser);
    
};
