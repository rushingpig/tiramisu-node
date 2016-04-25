import Req from 'utils/request';
import Url from 'config/url';

import {
    Manage as ManageActionTypes,
    Selector as SelectorActionTypes
} from './category_action_types';

const es6promisify = function(func) {
    return function(...args) {
        let ctx = this;
        return new Promise((resolve, reject) => {
            func.apply(ctx, args).done(resolve).fail(reject);
        })
    }
};

const get  = es6promisify(Req.get);
const post = es6promisify(Req.post);
const put  = es6promisify(Req.put);

const loadCategoryData       = id => get(Url.getCategoryDetail.toString(id));
const loadProvincesData      = () => get(Url.provinces.toString());
const loadCitiesData         = id => get(Url.cities.toString(id));
const loadEnableCities       = id => get(Url.activatedCity.toString(id));
const loadAllGeographiesData = () => get(Url.allGeographies.toString());

// 加载基础数据（省份，源数据）
const loadBasicData = (level, isEdit, id) => (
    dispatch => {
        dispatch({
            type: ManageActionTypes.LOAD_BASIC_DATA_EDIT,
            status: 'pending'
        });

        let loadPrimaryCategories = Promise.resolve([]);
        const isSecondary = level === 'secondary';

        if (isSecondary) {
            loadPrimaryCategories = get(Url.categories.toString()).then(
                categories => categories.filter(
                    obj => obj.parent_id === 0
                )
            );
        }

        if (isEdit) {
            return Promise.all([
                loadPrimaryCategories,
                loadAllGeographiesData(),
                loadCategoryData(id)
            ]).then(([
                primaryCategories,
                geographiesData,
                categoryData
            ]) => {
                return new Promise((resolve, reject) => {
                    isSecondary
                    ? loadEnableCities(categoryData.category.parent_id).then(resolve).catch(reject)
                    : resolve(false)
                }).then(enableList => {

                    dispatch({
                        type: SelectorActionTypes.LOAD_DATA,
                        geographiesData,
                        chekcedData: categoryData.regions,
                        enableList
                    });

                    dispatch({
                        type: ManageActionTypes.LOAD_BASIC_DATA_EDIT,
                        status: 'success',
                        id,
                        isSecondary,
                        data: {
                            primaryCategories,
                            categoryData,
                            showInAllCity: categoryData.regions.length === geographiesData.length
                        }
                    })
                });
            });
        }

        return Promise.all([
            loadPrimaryCategories,
            loadAllGeographiesData()
        ]).then(([
            primaryCategories,
            geographiesData
        ]) => {
            return new Promise((resolve, reject) => {
                isSecondary
                ? loadEnableCities(primaryCategories[0].id).then(resolve).catch(reject)
                : resolve(false)
            }).then(enableList => {
                dispatch({
                    type: ManageActionTypes.LOAD_BASIC_DATA_ADD,
                    status: 'success',
                    isSecondary,
                    primaryCategories
                });

                dispatch({
                    type: SelectorActionTypes.LOAD_DATA,
                    geographiesData,
                    chekcedData: [],
                    enableList
                });
            });
        });
    }
);

const changeCategoryName = name => ({
    type: ManageActionTypes.CHANGE_CATEGORY_NAME,
    name
});

const changeCategoryComment = comment => ({
    type: ManageActionTypes.CHANGE_CATEGORY_COMMENT,
    comment
});

const changePrimaryCategory = id => (
    dispatch => {
        loadEnableCities(id).then(
            enableList => {
                dispatch({
                    type: ManageActionTypes.CHANGE_PRIMARY_CATEGORY,
                    id,
                    enableList
                });
                dispatch({
                    type: SelectorActionTypes.SET_ENABLE_LIST,
                    enableList
                });
            }
        );
    }
);

const toggleShowAllCity = checked => (
    dispatch => {
        if (Number(checked)) {
            dispatch({ type: SelectorActionTypes.CHECK_ALL_CITIES });
            dispatch({ type: ManageActionTypes.CHECK_SHOW_IN_ALL_CITIES });
            return;
        }

        dispatch({ type: SelectorActionTypes.UNCHECK_ALL_CITIES });
        dispatch({ type: ManageActionTypes.UNCHECK_SHOW_IN_ALL_CITIES });
    }
);

const changeAttachProduct = checked => ({
    type: ManageActionTypes.CHANGE_ATTACH_PRODUCT,
    checked
});

const resetSaveDataStatus = () => ({
    type: ManageActionTypes.SAVE_DATA,
    status: 'normal'
});

const undo = () => ({ type: ManageActionTypes.UNDO });
const redo = () => ({ type: ManageActionTypes.REDO });

const saveData = level => (
    (dispatch, getState) => {
        dispatch({
            type: ManageActionTypes.SAVE_DATA,
            status: 'pending'
        });

        const state = getState().categoryManage;
        const selectorState = getState().categoryCitiesSelector;

        let params = {
            isAddition: state.isAttachProduct ? 1 : 0,
            isAll:      state.showInAllCity ? 1 : 0,
            name:       state.name,
            remarks:    state.comment
        };

        let url;
        let sendRequest;

        if (state.editId === 0) {

            url = Url.addPrimaryCategory.toString();

            if (level === 'secondary') {
                params.parentId = state.selectedCategory;
                url = Url.addSecondaryCategory.toString();
            }

            params = {
                ...params,
                cities: [...selectorState.checkedCities]
            };
            sendRequest = post(url, params);

        } else {

            url = Url.editPrimaryCategory.toString();

            if (level === 'secondary') {
                params.parent_id = state.selectedCategory;
                url = Url.editSecondaryCategory.toString();
            }

            params = {
                ...params,
                id:            state.editId,
                cities_add:    [...selectorState.checkedCities].filter(id => !selectorState.originCheckedCities.has(id)),
                cities_delete: [...selectorState.originCheckedCities].filter(id => !selectorState.checkedCities.has(id))
            };
            sendRequest = put(url, params);
        }

        sendRequest.then(
            () => {
                dispatch({ type: level === 'secondary' ? SelectorActionTypes.RESET_SELECTOR : SelectorActionTypes.RESET_CHECKDATA });
                dispatch({
                    type: ManageActionTypes.SAVE_DATA,
                    status: 'success'
                });
            }
        ).catch(
            err => {
                console.error(err);
                dispatch({
                    type: ManageActionTypes.SAVE_DATA,
                    status: 'failed'
                });
            }
        )
    }
);

export default {
    loadBasicData,
    changeCategoryName,
    changeCategoryComment,
    changePrimaryCategory,
    toggleShowAllCity,
    changeAttachProduct,
    resetSaveDataStatus,
    saveData
};