/**
 * @des    : the service module of user
 * @author : pigo.can
 * @date   : 15/12/9 下午4:19
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
"use strict";
var dao = require('../../dao');
var userDao = dao.user;

function UserService(){

}
UserService.prototype.getUserInfo = (username,password)=>{
    return userDao.findByUsername(username,password).then(
        (results) =>{
            if(results.length == 0){
                return null;
            }else{
                let user = results[0];
                return user;
            }
        }
    ).catch(
        (err)=>{
            return err;
        }
    );
};

module.exports = new UserService();

