'use strict';
var imageService = require('../../../../service/buss/image/image_service');
module.exports = function(router){
//*********************
//******** GET ********
//*********************
    router.get('/image', imageService.getDirInfo);    //文件列表搜索
    router.get('/image/dir', imageService.getAllDir);    //获取完整目录
//*********************
//******** POST *******
//*********************
    router.post('/image', imageService.addImage);   //添加图片文件
    router.post('/image/dir', imageService.addDir); //添加文件夹
//*********************
//******** PUT ********
//*********************
    router.put('/image/delete', imageService.deleteDir);    //批量删除文件、文件夹
    router.put('/image/move', imageService.moveDir);    //批量移动文件、文件夹
    router.put('/image/name', imageService.renameDir);  //重命名文件、文件夹
//*********************
//******** DELETE *****
//*********************
};
