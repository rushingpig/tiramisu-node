/**
 * Created by pisces on 16-3-29.
 */
module.exports = {
    'parent_id': {
        optional: true,
        isInt : true
    },
    'name': {
        notEmpty: true
    },
    'remark':{
        optional: true
    }
};
