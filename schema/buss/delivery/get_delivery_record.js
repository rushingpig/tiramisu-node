"use strict";

module.exports = {
    'begin_time': {
        optional: true,
        isDate: true,
        errorMessage: 'Invalid begin_time'
    },
    'end_time': {
        optional: true,
        isDate: true,
        errorMessage: 'Invalid end_time'
    },
    'deliveryman_id': {
        optional: true,
        isInt: true
    },
    'isCOD': {
        optional: true,
        isInt: true
    }
};