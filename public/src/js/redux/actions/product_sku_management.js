import Req from 'utils/request';
import Url from 'config/url';
import { clone } from 'utils/index';

import { ActionTypes as CitiesSelectorActionTypes } from './cities_selector';

const ActionTypes = {
    LOADED_BASIC_DATA: Symbol('LOADED_BASIC_DATA'),
    CHANGE_PRODUCT_NAME: Symbol('CHANGE_PRODUCT_NAME'),
    CHANGE_BUY_ENTRY: Symbol('CHANGE_BUY_ENTRY'),
    CHANGE_SELECTED_PRIMARY_CATEGORY: Symbol('CHANGE_SELECTED_PRIMARY_CATEGORY'),
    CHANGE_SELECTED_SECONDARY_CATEGORY: Symbol('CHANGE_SELECTED_SECONDARY_CATEGORY'),
    CHANGE_ORIGINAL_PRICE: Symbol('CHANGE_ORIGINAL_PRICE'),
    CHANGE_ACTIVE_CITIES: Symbol('CHANGE_ACTIVE_CITIES'),
    CHANGE_APPLY_RANGE: Symbol('CHANGE_APPLY_RANGE'),

    CHANGE_SELECTED_PROVINCE: Symbol('CHANGE_SELECTED_PROVINCE'),
    CHANGE_SELECTED_CITY: Symbol('CHANGE_SELECTED_CITY'),

    CHANGE_PRESALE_STATUS: Symbol('CHANGE_PRESALE_STATUS')
};

const es6promisify = function(func) {
    return function(...args) {
        let ctx = this;
        return new Promise((resolve, reject) => {
            func.apply(ctx, args).done(resolve).fail(reject);
        });
    }
};

const get = es6promisify(Req.get);

const loadCategories         = () => get(Url.categories.toString());
const loadAllGeographiesData = () => get(Url.allGeographies.toString());
const loadEnableCities       = id => get(Url.activatedCity.toString(id));

const transformPrice = num => (
    num <= 0 ? 0.01 : Number(num.toFixed(2))
);

const loadBasicData = () => (
    (dispatch, getState) => {

        dispatch({ type: CitiesSelectorActionTypes.RESET_SELECTOR });

        return Promise.all([
            loadCategories(),
            loadAllGeographiesData()
        ]).then(([
            categoriesData,
            geographiesData
        ]) => {
            return loadEnableCities(categoriesData[0].id).then(
                enableList => {
                    dispatch({
                        type: CitiesSelectorActionTypes.LOAD_DATA,
                        geographiesData,
                        enableList
                    });

                    dispatch({
                        type: ActionTypes.LOADED_BASIC_DATA,
                        categoriesData
                    });

                    const sid = getState().productSKUManagement.selectSecondaryCategory;

                    return changeSelectedSecondaryCategory(sid)(dispatch, getState)
                }
            ).then(() => {
                dispatch({
                    type: CitiesSelectorActionTypes.CHECK_ALL_CITIES
                });

                dispatch({
                    type: CitiesSelectorActionTypes.CHANGED_CHECK_CITIES,
                    citiesSelectorState: clone(getState().citiesSelector)
                });
            });
        });
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

const changeSelectedPrimaryCategory = id => (
    (dispatch, getState) => {
        const pid = Number(id);
        const sid = getState().productSKUManagement.secondaryCategories.get(pid)[0].id;

        dispatch({
            type: ActionTypes.CHANGE_SELECTED_PRIMARY_CATEGORY,
            id: Number(pid)
        });

        changeSelectedSecondaryCategory(sid)(dispatch, getState);
    }
);

const changeSelectedSecondaryCategory = id => (
    (dispatch, getState) => {
        return loadEnableCities(id).then(
            enableList => {
                dispatch({
                    type: CitiesSelectorActionTypes.SET_ENABLE_LIST,
                    enableList
                });

                dispatch({
                    type: ActionTypes.CHANGE_SELECTED_SECONDARY_CATEGORY,
                    id: Number(id)
                });

                return 1;
            }
        );
    }
);

const changeOriginalPrice = num => {
    const price = transformPrice(Number(num));

    return {
        type: ActionTypes.CHANGE_ORIGINAL_PRICE,
        price
    };
}

const changeActiveCitiesOption = option => (
    (dispatch, getState) => {
        dispatch({
            type: ActionTypes.CHANGE_ACTIVE_CITIES,
            option: Number(option)
        });

        if (Number(option) === 0) {
            dispatch({
                type: CitiesSelectorActionTypes.CHECK_ALL_CITIES
            });

            dispatch({
                type: CitiesSelectorActionTypes.CHANGED_CHECK_CITIES,
                citiesSelectorState: clone(getState().citiesSelector)
            });
        }
    }
);

const changeCitiesOptionApplyRange = option => {
    return {
        type: ActionTypes.CHANGE_APPLY_RANGE,
        option: Number(option)
    };
}

const changeSelectedProvince = pid => {
    return {
        type: ActionTypes.CHANGE_SELECTED_PROVINCE,
        id: pid
    };
}

const changeSelectedCity = cid => {
    return {
        type: ActionTypes.CHANGE_SELECTED_CITY,
        id: cid
    };
}

// City options

const changePreSaleStatus = () => {
    return {
        type: ActionTypes.CHANGE_PRESALE_STATUS
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
    changeCitiesOptionApplyRange,
    changeSelectedProvince,
    changeSelectedCity,

    changePreSaleStatus
}