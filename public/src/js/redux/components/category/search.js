import React, { Component }   from 'react';
import { Link }               from 'react-router';
import { bindActionCreators } from 'redux';
import { connect }            from 'react-redux';
import ReactDOM               from 'react-dom';

import V              from 'utils/acl';
import Modal          from 'common/modal';
import CitiesSelector from 'common/cities_selector';
import MessageBox, { MessageBoxIcon, MessageBoxType } from 'common/message_box';
import getTopHeader   from '../top_header';

import actions         from 'actions/category_search';
import selectorActions from 'actions/cities_selector';

const TopHeader = getTopHeader([{name: '产品管理', link: ''}]);

const Icon     = props => (<i className={"fa fa-" + props.icon + (props.fw ? " fa-fw" : "")} />);
const Select   = props => (<select className="form-control input-xs" {...props} />);
const BtnGroup = props => (<div className="btn-group" {...props} />);
const Button   = props => (<button className="btn btn-default btn-xs" {...props} />);

const renderOption = ({id, name}) => (<option value={id} key={id}>{name}</option>);
const Anchor = props => {
  if (props.disabled) {
    return (<a href="javascript:;" disabled={true} style={{cursor:'not-allowed',color:'#aaa'}}>{props.children}</a>);
  }

  return (<a href="javascript:;" {...props} />);
}

/**
 *
 * CategoryManageAddSecondaryCategory              新建二级分类
 * CategoryManageEditSecondaryCategoryActiveCities 编辑二级分类上线城市
 * CategoryManageCheckSecondaryCategoryComment     检查二级分类备注
 * CategoryManageEditSecondaryCategory             编辑二级分类
 * CategoryManageDeleteSecondaryCategory           删除二级分类
 * CategoryManageSortSecondaryCategory             对二级分类进行排序
 *
 * CategoryManageAddPrimaryCategory              新建一级分类
 * CategoryManageEditPrimaryCategoryActiveCities 编辑一级分类上线城市
 * CategoryManageCheckPrimaryCategoryComment     检查一级分类备注
 * CategoryManageEditPrimaryCategory             编辑一级分类
 * CategoryManageDeletePrimaryCategory           删除一级分类
 *
 **/

class Row extends Component {
  constructor(props) { super(props) }
  render() {
    return (
      <li className="list-group-item" {...this.props}>
        <div className="row">
          {this.props.children}
        </div>
      </li>
    );
  }
}

class Main extends Component {

  constructor(props) {
    super(props);

    this.handleLoadData               = this.handleLoadData.bind(this);
    this.handleSelectedFirstCategory  = this.handleSelectedFirstCategory.bind(this);
    this.handleSelectedSecondCategory = this.handleSelectedSecondCategory.bind(this);
    this.handleSelectedProvince       = this.handleSelectedProvince.bind(this);
    this.handleSelectedCity           = this.handleSelectedCity.bind(this);
    this.handleClickNameSearch        = this.handleClickNameSearch.bind(this);
    this.handleNameSearchKeyPress     = this.handleNameSearchKeyPress.bind(this);
    this.handleClickDeleteBtn         = this.handleClickDeleteBtn.bind(this);

    this.handleShowComment            = this.handleShowComment.bind(this);
    this.handleHideComment            = this.handleHideComment.bind(this);

    this.handleConfirmDeleteCategory  = this.handleConfirmDeleteCategory.bind(this);
    this.handleCancelDeleteCategory   = this.handleCancelDeleteCategory.bind(this);
    this.handleSaveCityConfig         = this.handleSaveCityConfig.bind(this);

    this.state = {
      modalShow: false,

      selectedFirstCategory:  0,
      selectedSecondCategory: 0,

      readyToDeleteCategory: 0,
      saveCityConfirm: 0
    }
  }

  render() {

    const that = this;
    const { props } = that;
    const state = props.state.toJS();
    const componentState = that.state;

    if (state.basicDataLoadStatus === 'pending') {
      return (
        <div>
          <TopHeader />
          <hr/>
          <p>基础数据加载中……</p>
        </div>
      )
    }

    if (state.basicDataLoadStatus === 'failed') {
      return (
        <div>
          <TopHeader />
          <hr/>
          <p>
            基础数据加载失败，
            <Anchor onClick={this.handleLoadData}>
              点击重新加载
            </Anchor>
          </p>
        </div>
      )
    }

    return (
      <div className="wrapper">
        <TopHeader />
        <hr/>
        <div className="form-inline">
          按名称搜索：
          <input
            ref='categoryName'
            type="text"
            className="form-control input-xs"
            placeholder="类型名称"
            onChange={e => this.forceUpdate()}
            onKeyPress={this.handleNameSearchKeyPress}
          />
          {'　'}
          {
            (state.searchState === "success" || state.searchState === "failed")
            ? (
              <Button disabled={this.refs.categoryName ? this.refs.categoryName.value.trim() === '' : false} className="btn btn-theme btn-xs" onClick={this.handleClickNameSearch}>
                <Icon icon="search" />{' 搜索'}
              </Button>
            ) : (
              <Button disabled={true}>
                搜索中...
              </Button>
            )
          }
        </div>
        <p></p>
        <div className="form-inline">
          按条件搜索：
          <Select id="firstCategories" value={state.selectedFirstCategory} onChange={this.handleSelectedFirstCategory}>
            { state.firstCategoriesList.map(renderOption) }
          </Select>
          {'　'}
          <Select id="secondCategories" value={state.selectedSecondCategory} onChange={this.handleSelectedSecondCategory}>
            {
              state.secondCategoriesList.filter(
                ({parentId}) => (state.selectedFirstCategory === 0) || (parentId === state.selectedFirstCategory)
              ).map(renderOption)
            }
          </Select>
          {'　'}
          <Select id="provinces" value={state.selectedProvince} onChange={this.handleSelectedProvince}>
            { state.provincesList.map(renderOption) }
          </Select>
          {'　'}
          {
            state.citiesListLoadStatus === 'success' ? (
              <Select id="cities" value={state.selectedCity} onChange={this.handleSelectedCity}>
                { state.citiesList.map(renderOption) }
              </Select>
            ) : (
              <Select disabled={true}>
                <option>加载中…</option>
              </Select>
            )
          }
          {'　'}
          {
            (state.searchState === "success" || state.searchState === "failed")
            ? (
              <Button className="btn btn-theme btn-xs" onClick={e => props.searchCategories()}>
                <Icon icon="search" />{' 搜索'}
              </Button>
            ) : (
              <Button disabled={true}>
                搜索中...
              </Button>
            )
          }
          <span className="pull-right">
            {
              V("CategoryManageAddPrimaryCategory") ? (
                <Link className="btn btn-xs btn-theme" to="/pm/cam/primary_category/add">
                  <Icon icon="plus" />
                  {' '}
                  新建一级分类
                </Link>
              ) : null
            }
            {'　'}
            {
              V("CategoryManageAddSecondaryCategory") ? (
                <Link className="btn btn-xs btn-theme" to="/pm/cam/second_category/add">
                  <Icon icon="plus" />
                  {' '}
                  新建二级分类
                </Link>
              ) : null
            }
          </span>
        </div>
        <hr/>
          <div className="row">
            <div className="col-xs-10 col-xs-offset-1">
            <div className="panel">
              <div className="panel-body">
                <div className="row">
                  <div className="col-xs-4">
                    分类名称
                  </div>
                  <div className="col-xs-2">
                    <center>调整排序</center>
                  </div>
                  <div className="col-xs-2">
                    <center>商品数量</center>
                  </div>
                  <div className="col-xs-4">
                    <center>操作</center>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-xs-10 col-xs-offset-1">
            <div className="panel">
              <ul className="list-group">
                {
                  state.searchResult.map(primaryCategory => {

                    const { list } = primaryCategory;
                    let primaryCategoryCount = 0;

                    const returnValue = list.map((secondaryCategory, i) => {
                      primaryCategoryCount += secondaryCategory.count;

                      const previousId    = list[i - 1] ? list[i - 1].id    : undefined;
                      const previousIndex = list[i - 1] ? list[i - 1].index : undefined;
                      const nextId        = list[i + 1] ? list[i + 1].id    : undefined;
                      const nextIndex     = list[i + 1] ? list[i + 1].index : undefined;

                      let editAuth = [];

                      if (V("CategoryManageEditSecondaryCategoryActiveCities")) {
                        editAuth.push(
                          <Anchor
                            key="CategoryManageEditPrimaryCategoryActiveCities"
                            onClick={props.showActiveCities.bind(undefined, secondaryCategory.id, true)}
                          >
                            PC端上线城市
                          </Anchor>
                        );
                      }

                      if (V("CategoryManageCheckSecondaryCategoryComment")) {
                        if (editAuth.length !== 0) {
                          editAuth.push(<span key="divider1">{'｜'}</span>)
                        }
                        editAuth.push(
                          <Anchor
                            key="CategoryManageCheckPrimaryCategoryComment"
                            data-category-id={secondaryCategory.id}
                            onClick={this.handleShowComment}
                          >
                            备注
                          </Anchor>
                        );
                      }

                      if (V("CategoryManageEditSecondaryCategory")) {
                        if (editAuth.length !== 0) {
                          editAuth.push(<span key="divider2">{'｜'}</span>)
                        }
                        editAuth.push(
                          <Link
                            key="CategoryManageEditSecondaryCategory"
                            to={"/pm/cam/second_category/edit/" + secondaryCategory.id}
                          >
                            编辑
                          </Link>
                        );
                      }

                      if (V("CategoryManageDeleteSecondaryCategory")) {
                        if (editAuth.length !== 0) {
                          editAuth.push(<span key="divider3">{'｜'}</span>)
                        }
                        editAuth.push(
                          <Anchor
                            key="CategoryManageDeleteSecondaryCategory"
                            data-second-category-id={secondaryCategory.id}
                            onClick={this.handleClickDeleteBtn}
                          >
                            删除
                          </Anchor>
                        );
                      }

                      if (editAuth.length === 0) {
                        editAuth = (<span key="no-auth">-</span>);
                      }

                      const rv = (
                        <li className="list-group-item" key={secondaryCategory.id}>
                          <div className="row">
                            <div className="col-xs-4">
                              {'　　'}
                              <span style={{cursor:'pointer'}}>
                                {secondaryCategory.name}
                              </span>
                            </div>
                            <div className="col-xs-2">
                              <center>
                                {
                                  V("CategoryManageSortSecondaryCategory") && state.sortable && previousId ? (
                                    <Anchor
                                      onClick={props.sortCategories.bind(
                                        undefined,
                                        primaryCategory.id,
                                        secondaryCategory.id,
                                        secondaryCategory.index,
                                        previousId,
                                        previousIndex
                                      )}
                                    >
                                      上移
                                    </Anchor>
                                  ) : <Anchor disabled={true}>上移</Anchor>
                                }
                                {'｜'}
                                {
                                  V("CategoryManageSortSecondaryCategory") && state.sortable && nextId ? (
                                    <Anchor
                                      onClick={props.sortCategories.bind(
                                        undefined,
                                        primaryCategory.id,
                                        secondaryCategory.id,
                                        secondaryCategory.index,
                                        nextId,
                                        nextIndex
                                      )}
                                    >
                                      下移
                                    </Anchor>
                                  ) : (<Anchor disabled={true}>下移</Anchor>)
                                }
                              </center>
                            </div>
                            <div className="col-xs-2">
                              <center>{secondaryCategory.count}</center>
                            </div>
                            <div className="col-xs-4">
                              <center>
                                {editAuth}
                              </center>
                            </div>
                          </div>
                        </li>
                      );

                      return rv;
                    });

                    let editAuth = [];

                    if (V("CategoryManageEditPrimaryCategoryActiveCities")) {
                      editAuth.push(
                        <Anchor
                          key="CategoryManageEditPrimaryCategoryActiveCities"
                          onClick={props.showActiveCities.bind(undefined, primaryCategory.id, false)}
                        >
                          PC端上线城市
                        </Anchor>
                      );
                    }

                    if (V("CategoryManageCheckPrimaryCategoryComment")) {
                      if (editAuth.length !== 0) {
                        editAuth.push(<span key="divider1">{'｜'}</span>)
                      }
                      editAuth.push(
                        <Anchor
                          key="CategoryManageCheckPrimaryCategoryComment"
                          data-category-id={primaryCategory.id}
                          onClick={props.showComment.bind(null, primaryCategory.id)}
                        >
                          备注
                        </Anchor>
                      );
                    }

                    if (V("CategoryManageEditPrimaryCategory")) {
                      if (editAuth.length !== 0) {
                        editAuth.push(<span key="divider2">{'｜'}</span>)
                      }
                      editAuth.push(
                        <Link
                          key="CategoryManageEditPrimaryCategory"
                          to={"/pm/cam/primary_category/edit/" + primaryCategory.id}
                        >
                          编辑
                        </Link>
                      );
                    }

                    if (V("CategoryManageDeletePrimaryCategory")) {
                      if (editAuth.length !== 0) {
                        editAuth.push(<span key="divider3">{'｜'}</span>)
                      }
                      editAuth.push(
                        <Anchor
                          key="CategoryManageDeletePrimaryCategory"
                          disabled={true}
                        >
                          删除
                        </Anchor>
                      );
                    }

                    if (editAuth.length === 0) {
                      editAuth = (<span key="no-auth">-</span>);
                    }

                    returnValue.unshift(
                      <li className="list-group-item" key={primaryCategory.id}>
                        <div className="row">
                          <div className="col-xs-4 text-primary">
                            <strong>{primaryCategory.name}</strong>
                          </div>
                          <div className="col-xs-2 col-xs-offset-2">
                            <center>{primaryCategoryCount}</center>
                          </div>
                          <div className="col-xs-4">
                            <center>
                              {editAuth}
                            </center>
                          </div>
                        </div>
                      </li>
                    );

                    return returnValue;
                  })
                }
              </ul>
            </div>
          </div>
        </div>
        {
          state.comment === '' ? undefined : (
            <Modal title="分类备注" onClose={props.hideComment}>
              {state.comment}
            </Modal>
          )
        }
        {
          componentState.readyToDeleteCategory === 0 ? null : (
            <Modal
              title="分类产品重新移动"
              onClose={this.handleCancelDeleteCategory}
              onConfirm={this.handleConfirmDeleteCategory}
              disabled={state.willTranslateSecondCategory === 0}
            >
              <p>移动到分类</p>
              <div className="row">
                <div className="col-xs-6">
                  <select
                    className="form-control"
                    multiple={true}
                    style={{height: 150}}
                    value={[state.willTranslateFirstCategory]}
                    onChange={this.handleMultipleSelect.bind(this, 0)}
                    disabled={state.deleteCategoryState === 'pending'}
                  >
                    { state.firstCategoriesList.map(renderOption) }
                  </select>
                </div>
                <div className="col-xs-6">
                  <select
                    className="form-control"
                    multiple={true}
                    style={{height: 150}}
                    value={[state.willTranslateSecondCategory]}
                    onChange={this.handleMultipleSelect.bind(this, 1)}
                    disabled={state.deleteCategoryState === 'pending'}
                  >
                    {
                      state.secondCategoriesList.filter(
                        ({ id, parentId }) => (
                          id !== Number(componentState.readyToDeleteCategory)
                          && (
                            id !== 0
                            && parentId !== 0
                            && parentId === state.willTranslateFirstCategory
                            || (state.willTranslateFirstCategory === 0 && id !== 0)
                          )
                        )
                      ).map(renderOption)
                    }
                  </select>
                </div>
              </div>
            </Modal>
          )
        }
        {
          componentState.saveCityConfirm === 1 || (state.showActiveCities === 0) ? undefined : (
            <Modal title="编辑PC端上线城市" onConfirm={this.handleSaveCityConfig} onClose={props.hideActiveCities}>
              <CitiesSelector {...props} />
            </Modal>
          )
        }
      </div>
    )
  }

  componentDidMount() {
    const { props } = this;
    const state = props.state.toJS();
    const { lastSearchFilter } = state;

    if (state.basicDataLoadStatus === 'success') {
      return state.searchWithName
      ? props.searchCategoriesWithName(lastSearchFilter.name)
      : props.searchCategories(true)
    }

    return this.handleLoadData();
  }

  componentWillReceiveProps(nextProps) {
    const { props } = this;
    if (nextProps.state.toJS().deleteCategoryState === 'success') {
      this.setState({
        readyToDeleteCategory: 0
      }, () => {
        MessageBox({
          text: '保存成功'
        }).then(
          props.resetDeleteCategory
        );
      });
    }
  }

  handleLoadData() {
    const thisProps = this.props;
    thisProps.loadBasicData();
    thisProps.searchCategories();
  }

  handleSelectedFirstCategory() {
    const firstCategoryId = document.getElementById('firstCategories').value;
    this.props.selectedFirstCategory(Number(firstCategoryId));
  }

  handleSelectedSecondCategory() {
    const secondCategoryId = document.getElementById('secondCategories').value;
    this.props.selectedSecondCategory(Number(secondCategoryId));
  }

  handleSelectedProvince() {
    const provinceId = document.getElementById('provinces').value;
    this.props.selectedProvince(Number(provinceId));
  }

  handleSelectedCity() {
    const cityId = document.getElementById('cities').value;
    this.props.selectedCity(Number(cityId));
  }

  handleClickNameSearch() {
    const searchName = this.refs.categoryName.value.trim();

    if (searchName !== '')
      this.props.searchCategoriesWithName(this.refs.categoryName.value);
  }

  handleNameSearchKeyPress(event) {
    if (event.key === 'Enter')
      this.handleClickNameSearch();
  }

  handleShowComment(event) {
    const id = event.currentTarget.dataset.categoryId;
    this.props.showComment(id);
  }

  handleHideComment(event) {
    this.props.hideComment();
  }

  handleClickDeleteBtn(event) {

    const that = this;
    const readyToDeleteCategory = event.currentTarget.dataset.secondCategoryId;

    MessageBox({
      title: "确认删除",
      btnType: MessageBoxType.OKCancel,
      icon: MessageBoxIcon.Warning,
      text: "请确认是否删除当前二级分类，删除前请将分类下所属产品调整为其它分类"
    }).then(() => {
      that.setState({ readyToDeleteCategory });
    }, () => {
      console.log('cancel...');
    });
  }

  handleMultipleSelect(categoryLevel, event) {
    const id = Number(event.currentTarget.value);
    if (categoryLevel === 0) {
      this.props.selectedTranslateFirstCategory(id);
    } else {
      this.props.selectedTranslateSecondCategory(id);
    }
  }

  handleConfirmDeleteCategory() {
    if (this.props.state.get('deleteCategoryState') !== 'pending')
      this.props.deleteSecondCategory(this.state.readyToDeleteCategory);
  }

  handleCancelDeleteCategory() {
    this.setState({
      readyToDeleteCategory: 0
    }, this.props.resetDeleteCategory);
  }

  handleSaveCityConfig() {
    const that = this;

    that.setState({
      saveCityConfirm: 1
    }, () => {
      return MessageBox({
        title: "保存确认",
        btnType: MessageBoxType.OKCancel,
        icon: MessageBoxIcon.Warning,
        text: "修改上线城市将会影响旗下商品的下架与否。如果确认数据无误，点击“确定”保存"
      }).then(() => {
        return that.setState({
          saveCityConfirm: 0
        }, that.props.saveData);
      }, () => {
        that.setState({
          saveCityConfirm: 0
        });
      });
    });
  }
}

export default connect(
  ({ categorySearch, citiesSelector }) => ({ state: categorySearch, citiesSelector }),
  dispatch => bindActionCreators({...actions, ...selectorActions} ,dispatch)
)(Main);