module.exports = {
    'delivery_type': {
        notEmpty: true
    },
    'owner_name': {
        notEmpty: true
    },
    'owner_mobile': {
        isMobilePhone: {
            options: ['zh-CN']
        }
    },
    'recipient_name': {
        notEmpty: true
    },
    'recipient_mobile': {
        isMobilePhone: {
            options: ['zh-CN']
        }
    },
    'regionalism_id': {
        notEmpty: true,
        isInt : true
    },
    'recipient_address': {
        notEmpty: true
    },
    //'delivery_id': {
        //notEmpty: true,
        //isInt : true
    //},
    'src_id': {
        notEmpty: true,
        isInt : true
    },
    'pay_modes_id': {
        notEmpty: true,
        isInt : true
    },
    'pay_status': {
        notEmpty: true
    },
    'delivery_time': {
        notEmpty: true
    },
    'total_amount': {
        notEmpty: true
    },
    'greeting_card' : {
        optional : true
    }
};
