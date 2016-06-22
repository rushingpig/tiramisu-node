'use strict';
module.exports = {
    city_id: {
        notEmpty: true
    },
    delivery_time_range: {
        notEmpty: true
    },
    is_diversion: {
        isInt: true
    },
    manager_name: {
        optional: true
    },
    manager_mobile: {
        optional: true
    },
    online_time: {
        notEmpty: true
    },
    open_regionalisms: {
        optional: true
    },
    order_time: {
        notEmpty: true
    }
};