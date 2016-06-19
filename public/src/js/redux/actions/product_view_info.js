import Req from 'utils/request';
import Url from 'config/url';
import { clone, dateFormat } from 'utils/index';

const ActionTypes = {
    LOAD_BASIC_DATA: Symbol('LOAD_BASIC_DATA'),
    CHANGE_SELECTED_SOURCE: Symbol('CHANGE_SELECTED_SOURCE')
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

const getBasicData = (cityId, productId) => get(Url.viewSku.toString(), { cityId, productId });
const loadOrderSource = () => get(Url.order_srcs.toString());

const loadBasicData = (cityId, productId) => (
    (dispatch, getState) => {
        dispatch({
            type: ActionTypes.LOAD_BASIC_DATA,
            status: 'pending'
        });

        return Promise.all([
            getBasicData(cityId, productId),
            loadOrderSource()
        ]).then(([
            productData,
            orderSourceData
        ]) => dispatch({
            type: ActionTypes.LOAD_BASIC_DATA,
            status: 'success',
            productData,
            orderSourceData
        })).catch(
            err => dispatch({
                type: ActionTypes.LOAD_BASIC_DATA,
                status: 'failed',
                reason: err
            })
        );
    }
)

const changeSelectSource = id => {
    return {
        type: ActionTypes.CHANGE_SELECTED_SOURCE,
        id
    }
}

export { ActionTypes }

export default {
    loadBasicData,
    changeSelectSource
}