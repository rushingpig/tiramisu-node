module.exports = {
    'name': {
        notEmpty: true
    },
    'remarks': {
        optional : true
    },
    'cities': {
        optional: true
    },
    'isAll': {
        optional: true,
        isBoolean: true
    },
    'isAddition': {
        notEmpty : true,
        isIn: {
            options: [
                [0, 1]
            ]
        },
        errorMessage: 'isAddition must in [0,1]'
    }
};