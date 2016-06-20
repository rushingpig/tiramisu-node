import { ActionTypes } from 'actions/product_view_specifications';
import Util from 'utils/index';

const initialState = {
    basicDataLoadStatus: 'pending',
    nextPageLoadStatus: 'loading',
    failedMsg: '',

    productId: 0,
    productName: '',
    canBuyInOfficialSite: false,
    specifications: [],
    orderSource: new Map(),

    pageNum: 0,
    totalItem: 0,
    pageSize: 20
};

const mapSku = sku => ({
    id: sku.id,
    source: Number(sku.website),
    spec: sku.size,
    cost: sku.price,
    originalCost: sku.original_price || 0
})

const switchType = {
    [ActionTypes.LOAD_BASIC_DATA]: (state, { status, orderSourceData, productSpecData, pageNum, reason }) => {
        switch(status) {
            case 'success':
                state = {
                    ...state,
                    basicDataLoadStatus: 'success',
                    productId: productSpecData.product.id,
                    productName: productSpecData.product.product_name,
                    canBuyInOfficialSite: productSpecData.skus.some(sku => sku.website === '1'),
                    pageNum,
                    totalItem: productSpecData.total
                }
                state.specifications = productSpecData.skus.map(mapSku);

                orderSourceData.map(osd => {
                    state.orderSource.set(osd.id, osd.name);
                });
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

    [ActionTypes.LOAD_NEXT_PAGE_DATA]: (state, { status, productSpecData, pageNum }) => {
        switch(status) {
            case 'success':
                state.specifications = productSpecData.skus.map(mapSku);
                state.nextPageLoadStatus = 'loaded';
                state.pageNum = pageNum;
                break;

            case 'failed':
                state.nextPageLoadStatus = 'loaded';
                break;

            default: // 'pendding'
                state.nextPageLoadStatus = 'loading';
                break;
        }

        return state;
    }
}

const productViewSpecifications = (state = initialState, action) => {
    return action.type in switchType
    ? switchType[action.type](Util.clone(state), action)
    : state;
}

export default productViewSpecifications;