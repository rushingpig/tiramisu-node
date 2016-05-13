import Req from 'utils/request';
import Url from 'config/url';
import { clone } from 'utils/index';

import { ActionTypes as CitiesSelectorActionTypes } from './cities_selector';

const ActionTypes = {
    LOADED_BASIC_DATA:                  Symbol('LOADED_BASIC_DATA'),
    CHANGE_PRODUCT_NAME:                Symbol('CHANGE_PRODUCT_NAME'),
    CHANGE_BUY_ENTRY:                   Symbol('CHANGE_BUY_ENTRY'),
    CHANGE_SELECTED_PRIMARY_CATEGORY:   Symbol('CHANGE_SELECTED_PRIMARY_CATEGORY'),
    CHANGE_SELECTED_SECONDARY_CATEGORY: Symbol('CHANGE_SELECTED_SECONDARY_CATEGORY'),
    CHANGE_ORIGINAL_PRICE:              Symbol('CHANGE_ORIGINAL_PRICE'),
    CHANGE_ACTIVE_CITIES:               Symbol('CHANGE_ACTIVE_CITIES'),
    CHANGE_APPLY_RANGE:                 Symbol('CHANGE_APPLY_RANGE'),

    CHANGE_SELECTED_PROVINCE: Symbol('CHANGE_SELECTED_PROVINCE'),
    CHANGE_SELECTED_CITY:     Symbol('CHANGE_SELECTED_CITY'),

    CHANGE_PRESALE_STATUS: Symbol('CHANGE_PRESALE_STATUS'),
    CHANGE_PRESALE_TIME:   Symbol('CHANGE_PRESALE_TIME'),
    CHANGE_BOOKING_TIME:   Symbol('CHANGE_BOOKING_TIME'),

    CHANGE_SECONDARY_BOOKINGTIME_STATUS: Symbol('CHANGE_SECONDARY_BOOKINGTIME_STATUS'),
    CHANGE_SECONDARY_BOOKINGTIME:        Symbol('CHANGE_SECONDARY_BOOKINGTIME'),
    CHANGE_SECONDARY_BOOKINGTIME_RANGE:  Symbol('CHANGE_SECONDARY_BOOKINGTIME_RANGE'),

    CREATE_SHOP_SPECIFICATIONS:               Symbol('CREATE_SHOP_SPECIFICATIONS'),
    CHANGE_SHOP_SPECIFICATIONS:               Symbol('CHANGE_SHOP_SPECIFICATIONS'),
    CHANGE_SHOP_SPECIFICATIONS_ORIGINAL_COST: Symbol('CHANGE_SHOP_SPECIFICATIONS_ORIGINAL_COST'),
    CHANGE_SHOP_SPECIFICATIONS_COST:          Symbol('CHANGE_SHOP_SPECIFICATIONS_COST'),
    CHANGE_SHOP_SPECIFICATIONS_EVENT_STATUS:  Symbol('CHANGE_SHOP_SPECIFICATIONS_EVENT_STATUS'),
    CHANGE_SHOP_SPECIFICATIONS_EVENT_COST:    Symbol('CHANGE_SHOP_SPECIFICATIONS_EVENT_COST'),
    CHANGE_SHOP_SPECIFICATIONS_EVENT_TIME:    Symbol('CHANGE_SHOP_SPECIFICATIONS_EVENT_TIME'),
    REMOVE_SHOP_SPECIFICATIONS:               Symbol('REMOVE_SHOP_SPECIFICATIONS'),

    ADD_SOURCE:              Symbol('ADD_SOURCE'),
    REMOVE_SOURCE:           Symbol('REMOVE_SOURCE'),
    CHANGE_SELECTED_SOURCE:  Symbol('CHANGE_SELECTED_SOURCE'),
    ADD_SOURCE_SPEC:         Symbol('ADD_SOURCE_SPEC'),
    REMOVE_SOURCE_SPEC:      Symbol('REMOVE_SOURCE_SPEC'),
    CHANGE_SOURCE_SPEC:      Symbol('CHANGE_SOURCE_SPEC'),
    CHANGE_SOURCE_SPEC_COST: Symbol('CHANGE_SOURCE_SPEC_COST'),

    SAVE_CITIY_OPTION:       Symbol('SAVE_CITIY_OPTION')
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
const loadDistricts          = id => get(Url.districts.toString(id));

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

const changePreSaleTime = (beginTime, endTime) => {
    return {
        type: ActionTypes.CHANGE_PRESALE_TIME,
        beginTime,
        endTime
    };
}

const changeDeliveryTime = (beginTime, endTime) => {
    return {
        type: ActionTypes.CHANGE_DELIVERY_TIME,
        beginTime,
        endTime
    }
}

const changeBookingTime = hour => {
    return {
        type: ActionTypes.CHANGE_BOOKING_TIME,
        hour
    };
}

const changeSecondaryBookingTimeStatus = () => (
    (dispatch, getState) => {
        const state = getState().productSKUManagement;
        const { tempOptions } = state;

        if (state.districtsData.has(tempOptions.selectedCity)) {
            return dispatch({
                type: ActionTypes.CHANGE_SECONDARY_BOOKINGTIME_STATUS
            });
        }

        return loadDistricts(state.selectedCity).then(
            districtsData => {
                dispatch({
                    type: ActionTypes.CHANGE_SECONDARY_BOOKINGTIME_STATUS,
                    districtsData
                });
            }
        )
    }
);

const changeSecondaryBookingTime = hour => {
    return {
        type: ActionTypes.CHANGE_SECONDARY_BOOKINGTIME,
        hour
    };
}

const changeSecondaryBookingTimeRange = districtCode => {
    return {
        type: ActionTypes.CHANGE_SECONDARY_BOOKINGTIME_RANGE,
        districtCode
    };
}

const createShopSpecifications = () => {
    return {
        type: ActionTypes.CREATE_SHOP_SPECIFICATIONS
    }
}

const changeShopSpecifications = (index, spec) => {
    return {
        type: ActionTypes.CHANGE_SHOP_SPECIFICATIONS,
        index,
        spec
    }
}

const changeShopSpecificationsOriginalCost = (index, money) => {
    return {
        type: ActionTypes.CHANGE_SHOP_SPECIFICATIONS_ORIGINAL_COST,
        index,
        money
    }
}

const changeShopSpecificationsCost = (index, money) => {
    return {
        type: ActionTypes.CHANGE_SHOP_SPECIFICATIONS_COST,
        index,
        money
    }
}

const changeShopSpecificationsEventStatus = index => {
    return {
        type: ActionTypes.CHANGE_SHOP_SPECIFICATIONS_EVENT_STATUS,
        index
    }
}

const changeShopSpecificationsEventCost = (index, money) => {
    return {
        type: ActionTypes.CHANGE_SHOP_SPECIFICATIONS_EVENT_COST,
        index,
        money
    }
}

const changeShopSpecificationsEventTime = (index, beginTime, endTime) => {
    return {
        type: ActionTypes.CHANGE_SHOP_SPECIFICATIONS_EVENT_TIME,
        index,
        beginTime,
        endTime
    }
}

const removeShopSpecifications = index => {
    return {
        type: ActionTypes.REMOVE_SHOP_SPECIFICATIONS,
        index
    }
}

const addSource = sourceId => {
    return {
        type: ActionTypes.ADD_SOURCE,
        sourceId: Number(sourceId),
    }
}

const removeSource = sourceId => {
    return {
        type: ActionTypes.REMOVE_SOURCE,
        sourceId: Number(sourceId)
    }
}

const changeSelectedSource = sourceId => {
    return {
        type: ActionTypes.CHANGE_SELECTED_SOURCE,
        sourceId: Number(sourceId),
    }
}

const addSourceSpec = () => {
    return {
        type: ActionTypes.ADD_SOURCE_SPEC
    }
}

const removeSourceSpec = index => {
    return {
        type: ActionTypes.REMOVE_SOURCE_SPEC,
        index
    }
}

const changeSourceSpec = (index, spec) => {
    return {
        type: ActionTypes.CHANGE_SOURCE_SPEC,
        index,
        spec
    }
}

const changeSourceSpecCost = (index, money) => {
    return {
        type: ActionTypes.CHANGE_SOURCE_SPEC_COST,
        index,
        money
    }
}

const saveCityOption = () => {
    return {
        type: ActionTypes.SAVE_CITIY_OPTION
    }
}

export { ActionTypes }

export default {
    loadBasicData,
    changeProductName,
    changeBuyEntry,
    changeSelectedPrimaryCategory,
    changeSelectedSecondaryCategory,
    changeActiveCitiesOption,
    changeCitiesOptionApplyRange,
    changeSelectedProvince,
    changeSelectedCity,

    changePreSaleStatus,
    changePreSaleTime,
    changeDeliveryTime,
    changeBookingTime,
    changeSecondaryBookingTimeStatus,
    changeSecondaryBookingTime,
    changeSecondaryBookingTimeRange,

    createShopSpecifications,
    changeShopSpecifications,
    changeShopSpecificationsOriginalCost,
    changeShopSpecificationsCost,
    changeShopSpecificationsEventStatus,
    changeShopSpecificationsEventCost,
    changeShopSpecificationsEventTime,
    removeShopSpecifications,

    addSource,
    removeSource,
    changeSelectedSource,
    addSourceSpec,
    removeSourceSpec,
    changeSourceSpec,
    changeSourceSpecCost,

    saveCityOption
}