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
                roles : [],
                data_scopes : []
            };
            //  ###     tips : 当给user属性赋值set类型时,存入session再取出来,属性值为空     ###
            let roles_set = new Set(),data_scopes_set = new Set();
            for(let i = 0;i < results.length;i++){
                let curr = results[i];
                if(i === 0){
                    // the admin id is fixed at 1
                    if(curr.id == 1){
                        user.is_admin = true;
                    }
                    user.id = curr.id;
                    user.office_id = curr.office_id;
                    user.username = curr.username;
                    user.city_id = curr.city_id;
                    user.station_id = curr.station_id;
                    user.user_type = curr.user_type;
                    user.no = curr.no;
                    user.name = curr.name;
                }
                if(curr.permission) user.permissions.push(curr.permission);
                if(curr.role_name) roles_set.add({id:curr.role_id,name:curr.role_name});
                if(curr.data_scope)  data_scopes_set.add(curr.data_scope);
            }
            user.roles = Array.from(roles_set.values());
            user.data_scopes = Array.from(data_scopes_set.values());
            return user;
        }
    });
};

module.exports = new UserService();