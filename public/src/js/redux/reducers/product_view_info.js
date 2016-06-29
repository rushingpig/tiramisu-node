import { ActionTypes } from 'actions/product_view_info';
import Util from 'utils/index';

const initialState = {
    basicDataLoadStatus: 'pending',
    failedMsg: '',

    productName: '',
    position: '',
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
    [ActionTypes.LOAD_BASIC_DATA]: (state, { status, spu, orderSourceData, provincesData, reason }) => {
        switch(status) {
            case 'success':
                const secondaryBookingTimeKeys = Object.keys(spu.product.secondary_book_time);

                state = {
                    ...state,
                    position: provincesData[spu.product.province_id] + ' ' + spu.product.city_name,
                    basicDataLoadStatus: 'success',
                    productName: spu.product.product_name,
                    canBuyInOfficialSite: spu.skus.some(sku => sku.website === "1"), // 编号1代表官方商城购买渠道
                    productCategory: [spu.product.primary_cate_name, spu.product.secondary_cate_name],
                    isPreSale: spu.product.isPresell,
                    bookingTime: spu.product.book_time,
                    hasSecondaryBookingTime: Object.keys(spu.product.secondary_book_time).length > 0,
                    secondaryBookingTime: Number(spu.product.secondary_book_time[secondaryBookingTimeKeys[0]]),
                    secondaryBookingTimeDistricts: secondaryBookingTimeKeys,
                };

                spu.skus.forEach(sku => {
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

                if (state.shopSpecifications.length === 0 && state.sourceSpecifications.size === 0) {
                    state = {
                        ...initialState,
                        basicDataLoadStatus: 'failed',
                        failedMsg: '数据异常，请直接联系开发人员处理'
                    }
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

const productViewInfo = (state = initialState, action) => {
    return action.type in switchType
    ? switchType[action.type](Util.clone(state), action)
    : state;
}

export default productViewInfo;