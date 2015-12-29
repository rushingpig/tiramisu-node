module.exports = {
    'delivery_type': {
        optional : false,
        notEmpty: true
    },
    'owner_name': {
        optional : false,
        notEmpty: true
    },
    'owner_mobile': {
        optional : false,
        isMobilePhone: {
            options: ['zh-CN']
        }
    },
    'recipient_name': {
        optional : false,
        notEmpty: true
    },
    'recipient_mobile': {
        optional : false,
        isMobilePhone: {
            options: ['zh-CN']
        }
    },
    'regionalism_id': {
        optional : false,
        notEmpty: true,
        isInt : true
    },
    'recipient_address': {
        optional : false,
        notEmpty: true
    },
    'delivery_id': {
        optional : false,
        notEmpty: true,
        isInt : true
    },
    'src_id': {
        optional : false,
        notEmpty: true,
        isInt : true
    },
    'pay_modes_id': {
        optional : false,
        notEmpty: true,
        isInt : true
    },
    'pay_status': {
        optional : false,
        notEmpty: true
    },
    'delivery_time': {
        optional : false,
        notEmpty: true
    },
    'total_amount': {
        optional : false,
        notEmpty: true
    }
}