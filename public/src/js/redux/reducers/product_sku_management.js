import { ActionTypes } from 'actions/product_sku_management';
import { clone } from 'utils/index';

const initialState = {
    productName: '',
    originalPrice: 1,
    buyEntry: 0, // 0:商城可购买 1:外部渠道可购买

    selectPrimaryCategory: 0,
    selectSecondaryCategory: 0,

    activeCitiesOption: 0,

    citiesOptionApplyRange: 0, // 0:All 1:Independence
};

const switchType = {
    [ActionTypes.CHANGE_PRODUCT_NAME]: (state, { name }) => {
        return {
            ...state,
            productName: name
        };
    },

    [ActionTypes.CHANGE_ORIGINAL_PRICE]: (state, { price }) => {
        return {
            ...state,
            originalPrice: price
        };
    },

    [ActionTypes.CHANGE_BUY_ENTRY]: (state, { entry }) => {
        return {
            ...state,
            buyEntry: entry
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
};

const productSKUManagement = (state = initialState, action) => action.type in switchType
? switchType[action.type](clone(state), action)
: state;

export default productSKUManagement;