'use strict';
var imageService = require('../../../../service/buss/image/image_service');
module.exports = function(router){
//*********************
//******** GET ********
//*********************
//*********************
//******** POST *******
//*********************
    router.post('/image',imageService.addImage);
    router.post('/image/dir',imageService.addDir);
//*********************
//******** PUT ********
//*********************
//*********************
//******** DELETE *****
//*********************
};
