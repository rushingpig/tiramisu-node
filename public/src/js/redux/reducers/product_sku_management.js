import { ActionTypes } from 'actions/product_sku_management';
import { ActionTypes as CitiesSelectorActionTypes } from 'actions/cities_selector';
import { clone } from 'utils/index';

const initialState = {
    basicDataLoadStatus: 'pending',

    productName: '',
    originalPrice: 1,
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

    orderSource:   new Map(),
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

    [ActionTypes.CHANGE_ORIGINAL_PRICE]: (state, { price }) => {
        return {
            ...state,
            originalPrice: price
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
            selectedCity: id
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
    }
};

const productSKUManagement = (state = initialState, action) => action.type in switchType
? switchType[action.type](clone(state), action)
: state;

export default productSKUManagement;