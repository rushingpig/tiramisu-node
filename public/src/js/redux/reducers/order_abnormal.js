import { ActionTypes } from '../actions/order_abnormal';
import Util from '../utils';
import { ABNORMAL_TYPE } from 'config/app.config';

const initialState = {
  basicDataLoadStatus: 'pending',
  orderSourceList: [{
    id: '0',
    name: '全部渠道' 
  }, {
    id: '29',
    name: '有赞微商城'
  }, {
    id: '12',
    name: '天猫'
  }, {
    id: '17',
    name: '美团外卖'
  }, {
    id: '1',
    name: '旧系统'
  }, {
    id: '11007',
    name: '本站'
  }, {
    id: '11012',
    name: '美团网'
  }, {
    id: '11013',
    name: '拉手网'
  }, {
    id: '11014',
    name: '大众点评网'
  }, {
    id: '11015',
    name: '糯米网'
  }, {
    id: '12011',
    name: '大众点评闪惠买单'
  }, {
    id: '12012',
    name: '银行活动礼品'
  }],
  searchFilter: {
    merchantId: '',
    beginTime: Util.getDate(),
    endTime: Util.getDate(30),
    orderSource: '0',
    isDeal: '0',
    abnormalType: '0'
  },
  searchResult: [],
  searchWithID: false,
  pageNumber: 0,
  totalItem: 0,
  pageSize: 50,
};

const switchType = {
  [ActionTypes.CHANGE_FILTER]: (state, { filter, value }) => {
    const searchFilter = {
      ...state.searchFilter,
      ...{ [filter]: value }
    };

    return {
      ...state,
      searchFilter
    };
  },

  [ActionTypes.GET_SEARCH_RESULT]: (state, { searchWithID, pageNum = 0, result: { list, total } }) => {
    let searchResult = [];
    list.forEach((row, i) => {
      searchResult.push({
        index:        i,
        orderSource:  row.src_id,
        sourceName:   row.src_name,
        merchantId:   row.merchant_id,
        createTime:   row.created_time,
        detail:       row.detail,
        abnormalType: row.type,
        isDeal:       row.is_deal,
        updater:      row.updated_by,
        updateTime:   row.updated_time
      });
    });

    return {
      ...state,
      searchResult,
      searchWithID,
      pageNumber: pageNum,
      totalItem: total
    };
  },

  [ActionTypes.CHANGE_DEAL_STATUS]: (state, { index, checked }) => {
    let searchResult = state.searchResult.map(row => {
      if (row.index !== index)
        return {...row};

      return {
        ...row,
        isDeal: checked ? 1 : 0
      };
    });

    return {
      ...state,
      searchResult
    }
  }
};

const orderAbnormal = (state = initialState, action) => action.type in switchType
? switchType[action.type](state, action)
: state;

export default orderAbnormal;