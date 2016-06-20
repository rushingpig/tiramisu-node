import Req from 'utils/request';
import Url from 'config/url';
import { clone, dateFormat } from 'utils/index';

const ActionTypes = {
    LOAD_BASIC_DATA: Symbol('LOAD_BASIC_DATA'),
    LOAD_NEXT_PAGE_DATA: Symbol('LOAD_NEXT_PAGE_DATA')
}

const es6promisify = function(func) {
    return function(...args) {
        let ctx = this;
        return new Promise((resolve, reject) => {
            func.apply(ctx, args).done(resolve).fail(reject);
        });
    }
};

const get = es6promisify(Req.get);

const loadOrderSource = () => get(Url.order_srcs.toString());
const getBasicData = (cityId, productId, pageNum, pageSize) => get(
    Url.viewSkuSpec.toString(), {
        cityId,
        productId,
        pageno: pageNum,
        pagesize: pageSize
});

const loadBasicData = (cityId, productId, pageNum) => (
    (dispatch, getState) => {
        const { pageSize } = getState().productViewSpecifications;

        dispatch({
            type: ActionTypes.LOAD_BASIC_DATA,
            status: 'pending'
        });

        if (pageNum === 0) {
            return Promise.all([
                loadOrderSource(),
                getBasicData(cityId, productId, pageNum, pageSize)
            ]).then(([
                orderSourceData,
                productSpecData
            ]) => dispatch({
                type: ActionTypes.LOAD_BASIC_DATA,
                status: 'success',
                orderSourceData,
                productSpecData,
                pageNum
            })).catch(
                err => dispatch({
                    type: ActionTypes.LOAD_BASIC_DATA,
                    status: 'failed',
                    reason: err
                })
            );
        } else {
            return (() => {
                dispatch({
                    type: ActionTypes.LOAD_NEXT_PAGE_DATA,
                    status: 'pending'
                });

                return getBasicData(cityId, productId, pageNum, pageSize);
            })().then(
                productSpecData => dispatch({
                    type: ActionTypes.LOAD_NEXT_PAGE_DATA,
                    status: 'success',
                    pageNum
                })
            ).catch(
                err => dispatch({
                    type: ActionTypes.LOAD_NEXT_PAGE_DATA,
                    status: 'failed'
                })
            )
        }
    }
)

export { ActionTypes }

export default {
    loadBasicData
}