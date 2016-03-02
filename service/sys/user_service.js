/**
 * @des    : the service module of user
 * @author : pigo.can
 * @date   : 15/12/9 下午4:19
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
"use strict";
var dao = require('../../dao'),
    UserDao = dao.user,
    userDao = new UserDao();

function UserService() {

}
UserService.prototype.getUserInfo = (username, password)=> {
    return userDao.findByUsername(username, password).then((results) => {
        if (results.length == 0) {
            return null;
        } else {
            let user = {
                is_admin : false,
                permissions : [],
                role : {}
            };
            for(let i = 0;i < results.length;i++){
                let curr = results[i];
                if(i === 0){
                    if(user.id == 1){
                        user.is_admin = true;
                    }
                    user.id = curr.id;
                    user.office_id = curr.office_id;
                    user.username = curr.username;
                    user.city_id = curr.city_id;
                    user.station_id = curr.station_id;
                    user.user_type = curr.user_type;
                    user.no = curr.no;
                    user.role.data_scope = curr.data_scope;
                    user.name = curr.name;
                }
                user.permissions.push(curr.permission);
            }
            return user;
        }
    });
};

module.exports = new UserService();

