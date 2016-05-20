import Req from 'utils/request';
import Url from 'config/url';
import { clone, dateFormat } from 'utils/index';

const ActionTypes = {
    LOAD_BASIC_DATA: Symbol('LOAD_BASIC_DATA'),
    SEARCH_PRODCUT: Symbol('SEARCH_PRODCUT'),

    CHANGE_SEARCH_PRODUCT_NAME: Symbol('CHANGE_SEARCH_PRODUCT_NAME'),
    CHANGE_SEARCH_BEGIN_TIME : Symbol('CHANGE_SEARCH_BEGIN_TIME'),
    CHANGE_SEARCH_END_TIME : Symbol('CHANGE_SEARCH_END_TIME'),
    CHANGE_NO_END_TIME_LIMIT: Symbol('CHANGE_NO_END_TIME_LIMIT'),
    CHANGE_SELECT_PRIMARY_CATEGORY : Symbol('CHANGE_SELECT_PRIMARY_CATEGORY'),
    CHANGE_SELECT_SECONDARY_CATEGORY : Symbol('CHANGE_SELECT_SECONDARY_CATEGORY'),
    CHANGE_SELECT_PROVINCE : Symbol('CHANGE_SELECT_PROVINCE'),
    CHANGE_SELECT_CITY : Symbol('CHANGE_SELECT_CITY'),
    CHANGE_WEBSITE_ONSALE_STATUS : Symbol('CHANGE_WEBSITE_ONSALE_STATUS'),
    CHANGE_SEARCH_IS_EVENT_STATUS : Symbol('CHANGE_SEARCH_IS_EVENT_STATUS'),

    SELECT_SEARCH_RESULT_ROW: Symbol('SELECT_SEARCH_RESULT_ROW'),
    SELECT_ALL_ROW: Symbol('SELECT_ALL_ROW'),

    DELETE_SELECTED_ROW: Symbol("DELETE_SELECTED_ROW"),
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
const put = es6promisify(Req.put);

const loadCategories = () => get(Url.categories.toString());
const loadProvinces  = () => get(Url.provinces.toString());
const loadCitiesData = id => get(Url.cities.toString(id));
const search         = filter => get(Url.searchSku.toString(), filter);
const deleteProduct  = list => put(Url.deleteSku.toString(), list);

const loadBasicData = () => (
    dispatch => {
        dispatch({
            type: ActionTypes.LOAD_BASIC_DATA,
            status: 'pending'
        });

        return Promise.all([
            loadCategories(),
            loadProvinces()
        ]).then(([
            categoriesData,
            provincesData
        ]) => {
            return loadCitiesData(Object.keys(provincesData)[0]).then(
                citiesData => dispatch({
                    type: ActionTypes.LOAD_BASIC_DATA,
                    status: 'success',
                    categoriesData,
                    provincesData,
                    citiesData
                })
            )
        }).catch(e => dispatch({
            type: ActionTypes.LOAD_BASIC_DATA,
            status: 'failed'
        }));
    }
)

const changeSearchProductName = name => {
    return {
        type: ActionTypes.CHANGE_SEARCH_PRODUCT_NAME,
        name
    }
}

const changeSearchBeginTime = time => {
    return {
        type: ActionTypes.CHANGE_SEARCH_BEGIN_TIME,
        time: time
    }
}

const changeSearchEndTime = time => {
    return {
        type: ActionTypes.CHANGE_SEARCH_END_TIME,
        time: time
    }
}

const changeNoEndTimeLimit = () => {
    return {
        type: ActionTypes.CHANGE_NO_END_TIME_LIMIT
    }
}

const changeSelectPrimaryCategory = id => {
    return {
        type: ActionTypes.CHANGE_SELECT_PRIMARY_CATEGORY,
        id: Number(id)
    }
}

const changeSelectSecondaryCategory = id => {
    return {
        type: ActionTypes.CHANGE_SELECT_SECONDARY_CATEGORY,
        id: Number(id)
    }
}

const changeSelectProvince = pid => (
    (dispatch, getState) => {

        const { citiesList } = getState().productSKUSearch;

        if (pid in citiesList) {
            return dispatch({
                type: ActionTypes.CHANGE_SELECT_PROVINCE,
                pid: Number(pid)
            });
        }

        return loadCitiesData(pid).then(
            citiesData => dispatch({
                type: ActionTypes.CHANGE_SELECT_PROVINCE,
                pid: Number(pid),
                citiesData
            })
        );
    }
)

const changeSelectCity = cid => {
    return {
        type: ActionTypes.CHANGE_SELECT_CITY,
        cid: Number(cid)
    }
}

const changeSearchActiveStatus = () => {
    return {
        type: ActionTypes.CHANGE_WEBSITE_ONSALE_STATUS
    }
}

const changeSearchIsEventStatus = () => {
    return {
        type: ActionTypes.CHANGE_SEARCH_IS_EVENT_STATUS
    }
}

const searchWithProductName = (pageNum = 0, isPageChange = false) => (
    (dispatch, getState) => {
        dispatch({
            type: ActionTypes.SEARCH_PRODCUT,
            status: 'pending'
        });

        const state = getState().productSKUSearch;
        const filterSrc = isPageChange ? state.lastSearchFilter : state;

        const filter = {
            name: filterSrc.searchProductName,
            pageno: pageNum,
            pagesize: state.pageSize
        }

        return search(filter).then(result => dispatch({
            type: ActionTypes.SEARCH_PRODCUT,
            status: 'success',
            searchWithProductName: true,
            result,
            pageNum,
            isPageChange
        })).catch(e => dispatch({
            type: ActionTypes.SEARCH_PRODCUT,
            status: 'failed'
        }));
    }
)

const searchWithFilter = (pageNum = 0, isPageChange = false) => (
    (dispatch, getState) => {
        dispatch({
            type: ActionTypes.SEARCH_PRODCUT,
            status: 'pending'
        });

        const state = getState().productSKUSearch;
        const filterSrc = isPageChange ? state.lastSearchFilter : state;

        const filter = {
            name: filterSrc.searchProductName,
            presell_start: filterSrc.searchBeginTime + ' 00:00:00',
            ...filterSrc.noEndTimeLimit ? {} : {
                presell_end: filterSrc.searchEndTime + ' 23:59:59'
            },
            province: filterSrc.selectedProvince,
            ...filterSrc.selectedCity ? {city: filterSrc.selectedCity} : {},
            primary_cate: filterSrc.selectedPrimaryCategory,
            ...filterSrc.selectedSecondaryCategory ? {secondary_cate: filterSrc.selectedSecondaryCategory} : {},
            isActivity: filterSrc.searchIsEvent ? 1 : 0,
            isMall: filterSrc.searchHasActive ? 1 : 0,
            pageno: pageNum,
            pagesize: state.pageSize
        }

        return search(filter).then(result => dispatch({
            type: ActionTypes.SEARCH_PRODCUT,
            status: 'success',
            searchWithProductName: false,
            result,
            pageNum,
            isPageChange
        })).catch(e => dispatch({
            type: ActionTypes.SEARCH_PRODCUT,
            status: 'failed'
        }));
    }
)

const selectRow = index => {
    return {
        type: ActionTypes.SELECT_SEARCH_RESULT_ROW,
        index
    }
}

const selectAllRow = () => {
    return {
        type: ActionTypes.SELECT_ALL_ROW
    }
}

const deleteSelectedRow = (reset = false) => (
    (dispatch, getState) => {
        if (reset) {
            return dispatch({
                type: ActionTypes.DELETE_SELECTED_ROW,
                status: 'normal'
            });
        }

        dispatch({
            type: ActionTypes.DELETE_SELECTED_ROW,
            status: 'pending'
        });

        const { searchResult, checkedRow } = getState().productSKUSearch;

        const deleteList = [...checkedRow].map(
            index => ({
                city: searchResult[index].city_id || 0,
                spu: searchResult[index].spu
            })
        )

        return deleteProduct(deleteList).then(
            () => dispatch({
                type: ActionTypes.DELETE_SELECTED_ROW,
                status: 'success'
            })
        ).catch(
            e => dispatch({
                type: ActionTypes.DELETE_SELECTED_ROW,
                status: 'failed',
            })
        );
    }
)

export { ActionTypes }

export default {
    loadBasicData,
    changeSearchProductName,
    changeSearchBeginTime,
    changeSearchEndTime,
    changeNoEndTimeLimit,
    changeSelectPrimaryCategory,
    changeSelectSecondaryCategory,
    changeSelectProvince,
    changeSelectCity,
    changeSearchActiveStatus,
    changeSearchIsEventStatus,
    searchWithProductName,
    searchWithFilter,
    selectRow,
    selectAllRow,
    deleteSelectedRow
}