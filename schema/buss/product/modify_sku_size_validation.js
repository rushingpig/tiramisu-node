module.exports = {
    'id': {
        notEmpty: true
    },
    'isOnline': {
        notEmpty: true,
        isIn: {
            options: [
                [0, 1]
            ]
        },
    }
};