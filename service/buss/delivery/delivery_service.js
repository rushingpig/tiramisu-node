/**
 * @des    :
 * @author : pigo.can
 * @date   : 15/12/17 上午9:39
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
"use strict";
var dao = require('../../../dao'),
    deliveryDao = dao.delivery,
    res_obj = require('../../../util/res_obj'),
    systemUtils = require('../../../common/SystemUtils'),
    toolUils = require('../../../common/ToolUtils');
function DeliveryService(){
    
}
/**
 * get all delivery station list
 * @param req
 * @param res
 * @param next
 */
DeliveryService.prototype.getDeliveryStationList = (req,res,next)=>{

    systemUtils.wrapService(next,deliveryDao.findAllStations().then(results=>{
        if(toolUils.isEmptyArray(results)){
            res.api(res_obj.NO_MORE_RESULTS);
            return;
        }
        let data = {};
        results.forEach((curr)=>{
            data[curr.id] = curr.name;
        });
        res.api(data);
    }));
}

module.exports = new DeliveryService();