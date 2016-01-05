/**
 * @des    :
 * @author : pigo.can
 * @date   : 15/12/16 下午3:40
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
"use strict";
var dateUtils = require('./DateUtils'),
    TiramisuError = require('../error/tiramisu_error'),
    toolUtils = require('./ToolUtils'),
    IncomingMessage = require('http').IncomingMessage,
    logger = require('./LogHelper').systemLog();
module.exports = {
    /**
     * wrap the service promise for catch error
     * @param next
     * @param promise
     */
    wrapService : (res,next,promise)=> {
        promise.catch((err)=> {
            if(err instanceof TiramisuError){
                res.api(err.getResObj(),null);
            }else{
                next(err);
            }
        });
    },
    /**
     * get the order id for display
     * @param id
     * @param date
     */
    getShowOrderId : (id,date)=>{
        if(!Number.isInteger(id)){
            throw new Error('the id must be an integer...');
        }
        return dateUtils.format(date,'YYYYMMDD') + id.toString();
    },
    /**
     * get the order id in db by the display order id
     * @param showOrderId
     * @returns {string}
     */
    getDBOrderId : (showOrderId) => {
        if(!showOrderId || typeof showOrderId !== 'string'){
            throw new Error('the order id for display must be an valid string...');
        }
        return showOrderId.substring(8);
    },
    assembleInsertObj : (req,obj) =>{
        if(!(req instanceof IncomingMessage)){
            logger.error('the req must be the instance of IncomingMessage...');
            throw new Error('the req must be the instance of IncomingMessage...');
        }
        if(toolUtils.isEmptyObject(obj)){
            logger.error('the obj param should be an instance of object and has it\'s own property...');
            throw new Error('the obj param should be an instance of object and has it\'s own property...');
        }
        obj.created_by = req.userId || 1;   //TODO it should not be null in the production environment
        obj.created_time = new Date();
        return obj;
    },
    assembleUpdateObj : (req,obj) => {
        if(!(req instanceof IncomingMessage)){
            throw new Error('the req must be the instance of IncomingMessage...');
        }
        if(toolUtils.isEmptyObject(obj)){
            throw new Error('the obj param should be an instance of object and has it\'s own property...');
        }
        obj.updated_by = req.userId;
        obj.updated_time = new Date();
        return obj;
    },
    encodeForFulltext : (obj) => {
        let str = '';
        if(!obj || typeof obj !== 'string' || obj.length === 0){
            logger.error('the object to be encode is not valid string ...');
        }else{
            for(let i = 0;i < obj.length;i++){
                str += (encodeURIComponent(obj.charAt(i)).replace(/%/g,'')+' ');
            }
        }
        return str;
    },
};


