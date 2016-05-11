import { ActionTypes } from 'actions/product_sku_management';
import { ActionTypes as CitiesSelectorActionTypes } from 'actions/cities_selector';
import { clone, dateFormat, getDate } from 'utils/index';

const initialState = {
    basicDataLoadStatus: 'pending',

    productName: '',
    buyEntry: 0, // 0:商城可购买 1:外部渠道可购买

    primaryCategories:   new Map(),
    secondaryCategories: new Map(),

    selectPrimaryCategory:   0,
    selectSecondaryCategory: 0,

    activeProvices: new Set(),
    activeCities:   new Set(),

    activeCitiesOption: 0,

    citiesOptionApplyRange: 0, // 0:All 1:Independence
    citiesOptions: new Map(),

    orderSource:   new Map([[0, 'PC商城'], [1, '手机APP'], [2, '美团外卖']]),
    provincesData: new Map(),
    citiesData:    new Map(),

    selectedProvince: 0,
    selectedCity: 0,

    tempOptions: {
        isPreSale: true,
        onSaleTime: [],
        delivery: [],
        bookingTime: "",
        hasSecondaryBookingTime: false,
        secondaryBookingTime: "",
        applyDistrict: new Set(),
        shopSpecifications: [],
        sourceSpecifications: new Map(),
        selectedSource: ""
    }
};

const switchType = {
    [ActionTypes.LOADED_BASIC_DATA]: (state, { categoriesData }) => {

        let primaryCategoriesMap = new Map();
        let secondaryCategoriesMap = new Map();
        let firstID = 0;

        categoriesData.filter(
            obj => obj.parent_id === 0
        ).forEach(primaryCategory => {
            primaryCategoriesMap.set(primaryCategory.id, primaryCategory.name);
            secondaryCategoriesMap.set(primaryCategory.id, []);
        });

        firstID = [...primaryCategoriesMap.keys()][0];

        categoriesData.filter(
            obj => obj.parent_id !== 0
        ).forEach(secondaryCategory => {
            if (secondaryCategoriesMap.has(secondaryCategory.parent_id)) {
                secondaryCategoriesMap.get(secondaryCategory.parent_id).push({
                    id: secondaryCategory.id,
                    name: secondaryCategory.name
                });
            }
        });

        [...primaryCategoriesMap.keys()].forEach(pid => {
            if (secondaryCategoriesMap.get(pid).length === 0) {
                primaryCategoriesMap.delete(pid);
            }
        });

        return {
            ...state,
            basicDataLoadStatus: 'success',
            primaryCategories: primaryCategoriesMap,
            secondaryCategories: secondaryCategoriesMap,
            selectPrimaryCategory: firstID,
            selectSecondaryCategory: secondaryCategoriesMap.get(firstID)[0].id
        };
    },

    [ActionTypes.CHANGE_PRODUCT_NAME]: (state, { name }) => {
        return {
            ...state,
            productName: name
        };
    },

    [ActionTypes.CHANGE_BUY_ENTRY]: (state, { entry }) => {
        return {
            ...state,
            buyEntry: entry
        };
    },

    [ActionTypes.CHANGE_SELECTED_PRIMARY_CATEGORY]: (state, { id }) => {
        return {
            ...state,
            selectPrimaryCategory: id
        };
    },

    [ActionTypes.CHANGE_SELECTED_SECONDARY_CATEGORY]: (state, { id }) => {
        return {
            ...state,
            selectSecondaryCategory: id
        };
    },

    [ActionTypes.CHANGE_ACTIVE_CITIES]: (state, { option }) => {
        return {
            ...state,
            activeCitiesOption: option
        };
    },

    [ActionTypes.CHANGE_APPLY_RANGE]: (state, { option }) => {
        return {
            ...state,
            citiesOptionApplyRange: option
        };
    },

    [CitiesSelectorActionTypes.CHANGED_CHECK_CITIES]: (state, { citiesSelectorState }) => {
        const { checkedCities } = citiesSelectorState;

        const transformToMap = obj => [
            obj.id, {
                ...obj,
                checked: false,
                disabled: false
            }
        ];

        const citiesData = new Map(
            [...citiesSelectorState.citiesData.values()].filter(
                cityData => checkedCities.has(cityData.id)
            ).map(transformToMap)
        );

        const provincesData = new Map(
            [...citiesData.values()].map(
                cityData => citiesSelectorState.provincesData.get(cityData.province)
            ).map(transformToMap)
        );

        let { selectedProvince, selectedCity } = state;

        if (!provincesData.has(selectedProvince))
            selectedProvince = [...provincesData.keys()][0];
        if (!citiesData.has(selectedCity))
            selectedCity = [...citiesData.keys()][0];

        return {
            ...state,
            citiesData,
            provincesData,
            selectedProvince,
            selectedCity
        };
    },

    [ActionTypes.CHANGE_SELECTED_PROVINCE]: (state, { id }) => {
        return {
            ...state,
            selectedProvince: id
        };
    },

    [ActionTypes.CHANGE_SELECTED_CITY]: (state, { id }) => {
        return {
            ...state,
            selectedCity: id,
            tempOptions: {
                ...state.tempOptions,
                applyDistrict: new Set()
            }
        };
    },

    [ActionTypes.CHANGE_PRESALE_STATUS]: state => {
        return {
            ...state,
            tempOptions: {
                ...state.tempOptions,
                isPreSale: !state.tempOptions.isPreSale
            }
        };
    },

    [ActionTypes.CHANGE_PRESALE_TIME]: (state, { beginTime, endTime }) => {
        return {
            ...state,
            tempOptions: {
                ...state.tempOptions,
                onSaleTime: [ beginTime, endTime ]
            }
        }
    },

    [ActionTypes.CHANGE_DELIVERY_TIME]: (state, { beginTime, endTime }) => {
        return {
            ...state,
            tempOptions: {
                ...state.tempOptions,
                delivery: [ beginTime, endTime ]
            }
        }
    },

    [ActionTypes.CHANGE_BOOKING_TIME]: (state, { hour }) => {
        return {
            ...state,
            tempOptions: {
                ...state.tempOptions,
                bookingTime: hour <= 0 ? 0.1 : hour
            }
        }
    },

    [ActionTypes.CHANGE_SECONDARY_BOOKINGTIME_STATUS]: state => {
        return {
            ...state,
            tempOptions: {
                ...state.tempOptions,
                hasSecondaryBookingTime: !state.tempOptions.hasSecondaryBookingTime
            }
        }
    },

    [ActionTypes.CHANGE_SECONDARY_BOOKINGTIME]: (state, { hour }) => {
        return {
            ...state,
            tempOptions: {
                ...state.tempOptions,
                secondaryBookingTime: hour <= 0 ? 0.1 : hour
            }
        }
    },

    [ActionTypes.CHANGE_SECONDARY_BOOKINGTIME_RANGE]: (state, { districtCode }) => {
        let { applyDistrict } = state.tempOptions;

        applyDistrict[applyDistrict.has(districtCode) ? 'delete' : 'add'](districtCode);

        return {
            ...state,
            tempOptions: {
                ...state.tempOptions,
                applyDistrict
            }
        }
    },

    [ActionTypes.CREATE_SHOP_SPECIFICATIONS]: (state, { index }) => {
        let { shopSpecifications } = state.tempOptions;

        const now = new Date();

        let newShopSpecifications = {
            spec: "",
            originalCost: 0.01,
            cost: 0.01,
            hasEvent: false,
            eventCost: 0.01,
            eventTime: [now, new Date(getDate(now, 7))]
        }

        shopSpecifications.push(newShopSpecifications);

        return state;
    },

    [ActionTypes.CHANGE_SHOP_SPECIFICATIONS]: (state, { index, spec }) => {
        let { shopSpecifications } = state.tempOptions;

        shopSpecifications[index].spec = spec;

        return state;
    },

    [ActionTypes.CHANGE_SHOP_SPECIFICATIONS_ORIGINAL_COST]: (state, { index, money }) => {
        let { shopSpecifications } = state.tempOptions;

        shopSpecifications[index].originalCost = Number(money) || 0.01;

        return state;
    },

    [ActionTypes.CHANGE_SHOP_SPECIFICATIONS_COST]: (state, { index, money }) => {
        let { shopSpecifications } = state.tempOptions;

        shopSpecifications[index].cost = Number(money) || 0.01;

        return state;
    },

    [ActionTypes.CHANGE_SHOP_SPECIFICATIONS_EVENT_STATUS]: (state, { index }) => {
        let { shopSpecifications } = state.tempOptions;

        shopSpecifications[index].hasEvent = !shopSpecifications[index].hasEvent;

        return state;
    },

    [ActionTypes.CHANGE_SHOP_SPECIFICATIONS_EVENT_COST]: (state, { index, money }) => {
        let { shopSpecifications } = state.tempOptions;

        shopSpecifications[index].eventCost = Number(money) || 0.01;

        return state;
    },

    [ActionTypes.CHANGE_SHOP_SPECIFICATIONS_EVENT_TIME]: (state, { index, beginTime, endTime }) => {
        let { shopSpecifications } = state.tempOptions;

        shopSpecifications[index].eventTime = [beginTime, endTime];

        return state;
    },

    [ActionTypes.REMOVE_SHOP_SPECIFICATIONS]: (state, { index }) => {
        let { shopSpecifications } = state.tempOptions;

        shopSpecifications = shopSpecifications.filter((x, i) => i !== index);

        return state;
    },

    [ActionTypes.ADD_SOURCE]: (state, { sourceId }) => {
        if (!state.tempOptions.sourceSpecifications.has(sourceId)) {
            let sourceSpec = [];

            if (state.buyEntry === 0) {
                sourceSpec = state.tempOptions.shopSpecifications.map(
                    ({ spec, cost }) => ({ spec, cost })
                );
            }

            state.tempOptions.sourceSpecifications.set(sourceId, sourceSpec);
        }

        state.tempOptions.selectedSource = sourceId;

        return state;
    },

    [ActionTypes.CHANGE_SELECTED_SOURCE]: (state, { sourceId }) => {
        state.tempOptions.selectedSource = sourceId;

        return state;
    },

    [ActionTypes.ADD_SOURCE_SPEC]: state => {
        state.tempOptions.sourceSpecifications.get(state.tempOptions.selectedSource).push({
            spec: '',
            cost: 0
        });

        return state;
    },

    [ActionTypes.CHANGE_SOURCE_SPEC]: (state, { index, spec }) => {
        state.tempOptions.sourceSpecifications.get(state.tempOptions.selectedSource)[index].spec = spec;

        return state;
    },

    [ActionTypes.CHANGE_SOURCE_SPEC_COST]: (state, { index, money }) => {
        state.tempOptions.sourceSpecifications.get(state.tempOptions.selectedSource)[index].cost = money;

        return state;
    }
};

const productSKUManagement = (state = initialState, action) => action.type in switchType
? switchType[action.type](clone(state), action)
: state;

export default productSKUManagement;