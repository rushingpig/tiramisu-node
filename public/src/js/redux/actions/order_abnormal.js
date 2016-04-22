import Req from 'utils/request';
import Url from 'config/url';

const ActionTypes = {
  CHANGE_FILTER:      Symbol('ORDER_ABNORMAL_CHANGE_FILTER'),
  GET_SEARCH_RESULT:  Symbol('ORDER_ABNORMAL_GET_SEARCH_RESULT'),
  CHANGE_DEAL_STATUS: Symbol('ORDER_ABNORMAL_CHANGE_DEAL_STATUS'),
};

const es6promisify = function(func) {
  return function(...args) {
    let ctx = this;
    return new Promise((resolve, reject) => {
      func.apply(ctx, args).done(resolve).fail(reject);
    })
  }
};

const get = es6promisify(Req.get);
const put = es6promisify(Req.put);

const changeFilter = (filter, value) => {
  return {
    type: ActionTypes.CHANGE_FILTER,
    filter,
    value
  };
}

const dispatchResult = (dispatch, pageNum = 0, searchWithID = false) => result => {
  dispatch({
    type: ActionTypes.GET_SEARCH_RESULT,
    result,
    pageNum,
    searchWithID
  });
};

const searchWithFilter = (pageNum = 0) => (
  (dispatch, getState) => {

    const state = getState().orderAbnormal;
    const filter = state.searchFilter;

    const parms = {
      begin_time: filter.beginTime,
      end_time: filter.endTime,
      page_no: pageNum,
      page_size: state.pageSize
    };

    if (filter.orderSource !== '0') {
      parms.src_id = filter.orderSource;
    }

    if (filter.isDeal !== '0') {
      parms.is_deal = filter.isDeal === '1' ? 1 : 0
    }

    if (filter.abnormalType !== '0') {
      parms.type = filter.abnormalType
    }

    get(Url.abnormal_order.toString(), parms).then(dispatchResult(dispatch, pageNum));
  }
)

const searchWithID = (pageNum = 0) => (
  (dispatch, getState) => {
    const state = getState().orderAbnormal;
    const filter = state.searchFilter;

    const parms = {
      merchant_id: filter.merchantId,
      page_no: pageNum,
      page_size: state.pageSize
    };

    get(Url.abnormal_order.toString(), parms).then(dispatchResult(dispatch, pageNum, true));
  }
);

const changeDealStatus = (index, merchantId, orderSource, checked) => (
  dispatch => {
    put(Url.change_error_deal_status.toString(merchantId, orderSource), {
      is_deal: checked ? 1 : 0
    }).then(
      () => {
        dispatch({
          type: ActionTypes.CHANGE_DEAL_STATUS,
          index: Number(index),
          checked
        });
      }
    );
  }
);

export { ActionTypes }

export default {
  changeFilter,
  searchWithID,
  searchWithFilter,
  changeDealStatus
};