/**
 * @des    :
 * @author : pigo.can
 * @date   : 15/12/17 上午9:39
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
"use strict";
var res_obj = require('../../../util/res_obj'),
    systemUtils = require('../../../common/SystemUtils'),
    toolUils = require('../../../common/ToolUtils'),
    schema = require('../../../schema'),
    dao = require('../../../dao'),
    productDao = dao.product;

function ProductService(){
    
}
ProductService.prototype.getCategories = (req,res,next)=>{
    let promise = productDao.findAllCatetories().then((results)=>{
        if(toolUils.isEmptyArray(results)){
            res.api(res_obj.NO_MORE_RESULTS,null);
            return;
        }
        let data = [];
        results.forEach((curr)=>{
            let obj = {};
            obj.id = curr.id;
            obj.name = curr.name;
            obj.parent_id = curr.parent_id;
            data.push(obj);
        });
        res.api(data);
    });
    systemUtils.wrapService(next,promise);
};

module.exports = new ProductService();
