import Req from 'utils/request';
import Url from 'config/url';

import { ActionTypes as CitiesSelectorActionTypes } from './cities_selector';

const ActionTypes = {
    CHANGE_PRODUCT_NAME:                Symbol('CHANGE_PRODUCT_NAME'),
    CHANGE_BUY_ENTRY:                   Symbol('CHANGE_BUY_ENTRY'),
    CHANGE_SELECTED_PRIMARY_CATEGORY:   Symbol('CHANGE_SELECTED_PRIMARY_CATEGORY'),
    CHANGE_SELECTED_SECONDARY_CATEGORY: Symbol('CHANGE_SELECTED_SECONDARY_CATEGORY'),
    CHANGE_ORIGINAL_PRICE:              Symbol('CHANGE_ORIGINAL_PRICE'),
    CHANGE_ACTIVE_CITIES:               Symbol('CHANGE_ACTIVE_CITIES'),
    CHANGE_APPLY_RANGE:                 Symbol('CHANGE_APPLY_RANGE')
};

const es6promisify = function(func) {
    return function(...args) {
        let ctx = this;
        return new Promise((resolve, reject) => {
            func.apply(ctx, args).done(resolve).fail(reject);
        })
    }
};

const get  = es6promisify(Req.get);
const post = es6promisify(Req.post);
const put  = es6promisify(Req.put);

const transformPrice = num => (
    num <= 0 ? 0.01 : Number(num.toFixed(2))
);

const loadBasicData = () => (
    dispatch => {
        const loadCategories         = () => get(Url.categories.toString());
        const loadAllGeographiesData = () => get(Url.allGeographies.toString());
        const loadEnableCities       = id => get(Url.activatedCity.toString(id));

        return Promise.all([
            loadCategories(),
            loadAllGeographiesData()
        ]).then(([
            categoriesData,
            geographiesData
        ]) => {
            return loadEnableCities(categoriesData[0].parent_id).then(
                enableList => {
                    dispatch({
                        type: CitiesSelectorActionTypes.LOAD_DATA,
                        geographiesData,
                        enableList
                    });
                }
            )
        })
    }
);

const changeProductName = name => {
    return {
        type: ActionTypes.CHANGE_PRODUCT_NAME,
        name
    };
};

const changeBuyEntry = entry => {
    return {
        type: ActionTypes.CHANGE_BUY_ENTRY,
        entry: Number(entry)
    };
};

const changeSelectedPrimaryCategory = id => {
    return {
        type: ActionTypes.CHANGE_SELECTED_PRIMARY_CATEGORY,
        id
    };
};

const changeSelectedSecondaryCategory = id => {
    return {
        type: ActionTypes.CHANGE_SELECTED_SECONDARY_CATEGORY,
        id
    };
};

const changeOriginalPrice = num => {
    const price = transformPrice(Number(num));

    return {
        type: ActionTypes.CHANGE_ORIGINAL_PRICE,
        price
    };
}

const changeActiveCitiesOption = option => {
    return {
        type: ActionTypes.CHANGE_ACTIVE_CITIES,
        option: Number(option)
    };
};

const changeCitiesOptionApplyRange = option => {
    return {
        type: ActionTypes.CHANGE_APPLY_RANGE,
        option: Number(option)
    };
}

export { ActionTypes }

export default {
    loadBasicData,
    changeProductName,
    changeBuyEntry,
    changeSelectedPrimaryCategory,
    changeSelectedSecondaryCategory,
    changeOriginalPrice,
    changeActiveCitiesOption,
    changeCitiesOptionApplyRange
}