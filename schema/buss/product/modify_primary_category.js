module.exports = {
    'id' : {
        notEmpty: true
    },
    'name': {
        optional: true
    },
    'remarks': {
        optional : true
    },
    'isAddition': {
        optional : true,
        isIn: {
            options: [
                [0, 1]
            ]
        },
        errorMessage: 'isAddition must in [0,1]'
    },
    'cities_add': {
        optional: true,
        isArray : true
    },
    'cities_delete': {
        optional: true,
        isArray : true
    }
};