import Req from 'utils/request';
import Url from 'config/url';
import { clone, dateFormat } from 'utils/index';

const ActionTypes = {
    LOAD_BASIC_DATA: Symbol('LOAD_BASIC_DATA')
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

const getBasicData = () => get(Url.getProductSpecInfo.toString());

// 伪fetch请求
const fakeFetch = returnData => new Promise((resolve, reject) => {
    setTimeout(() => {
        Math.trunc(Math.random() * 10) > 2 ? resolve(returnData) : reject()
        // Math.trunc(Math.random() * 10) > 2 ? resolve(returnData) : resolve(returnData)
    }, 700);
});

const loadBasicData = id => (
    (dispatch, getState) => {
        dispatch({
            type: ActionTypes.LOAD_BASIC_DATA,
            status: 'pending'
        });

        return fakeFetch().then(
            fakeData => dispatch({
                type: ActionTypes.LOAD_BASIC_DATA,
                status: 'success'
            })
        ).catch(
            err => dispatch({
                type: ActionTypes.LOAD_BASIC_DATA,
                status: 'failed',
                reason: err
            })
        );
    }
)


export { ActionTypes }

export default {
    loadBasicData
}