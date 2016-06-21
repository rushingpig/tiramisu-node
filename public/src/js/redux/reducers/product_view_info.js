import { ActionTypes } from 'actions/product_view_info';
import Util from 'utils/index';

const initialState = {
    basicDataLoadStatus: 'pending',
    failedMsg: '',

    productName: '',
    canBuyInOfficialSite: false,
    productCategory: [],
    isPreSale: false,
    bookingTime: 0.5,
    hasSecondaryBookingTime: false,
    secondaryBookingTime: [],
    shopSpecifications: [],
    sourceSpecifications: new Map(),
    selectedSource: "",
    orderSource: new Map()
};

const switchType = {
    [ActionTypes.LOAD_BASIC_DATA]: (state, { status, productData, orderSourceData, reason }) => {
        switch(status) {
            case 'success':
                state = {
                    ...state,
                    basicDataLoadStatus: 'success',
                    productName: productData.product.product_name,
                    canBuyInOfficialSite: productData.skus.some(sku => sku.website === "1"), // 编号1代表官方商城购买渠道
                    productCategory: [productData.product.primary_cate_name, productData.product.secondary_cate_name],
                    isPreSale: productData.product.isPresell,
                    bookingTime: productData.product.book_time,
                    hasSecondaryBookingTime: Object.keys(productData.product.secondary_book_time).length > 0,
                    secondaryBookingTime: Object.keys(productData.product.secondary_book_time).map(districtName => ({
                        districtName,
                        time: productData.product.secondary_book_time[districtName]
                    })),
                };

                productData.skus.forEach(sku => {
                    if (sku.website === "1") {
                        state.shopSpecifications.push({
                            spec: sku.size,
                            originalCost: sku.original_price,
                            cost: sku.price,
                            hasEvent: sku.activity_start !== null,
                            eventCost: sku.activity_price,
                            eventTime: [sku.activity_start, sku.activity_end]                            
                        });
                    } else {
                        if (state.sourceSpecifications.has(Number(sku.website))) {
                            state.sourceSpecifications.get(Number(sku.website)).push({
                                spec: sku.size,
                                cost: sku.price
                            });
                        } else {
                            state.sourceSpecifications.set(Number(sku.website), [{
                                spec: sku.size,
                                cost: sku.price
                            }]);
                        }
                    }
                });

                orderSourceData.map(osd => {
                    state.orderSource.set(osd.id, osd.name);
                });

                if (state.sourceSpecifications.size) {
                    state.selectedSource = [...state.sourceSpecifications.keys()][0];
                }

                break;

            case 'failed':
                state.basicDataLoadStatus = 'failed';
                state.failedMsg = reason;
                break;

            default: // 'pendding'
                state = initialState;
                break;
        }

        return state;
    },

    [ActionTypes.CHANGE_SELECTED_SOURCE]: (state, { id }) => {
        state.selectedSource = id;
        return state;
    }
}

const productSKUViewInfo = (state = initialState, action) => {
    return action.type in switchType
    ? switchType[action.type](Util.clone(state), action)
    : state;
}

export default productSKUViewInfo;