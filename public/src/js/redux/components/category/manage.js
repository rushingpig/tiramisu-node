import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import MessageBox, { MessageBoxIcon } from 'common/message_box';
import actions from 'actions/category_manage';
import selectorActions from 'actions/category_cities_selector';

import getTopHeader from '../top_header';
import CitiesSelector from './cities_selector';

let TopHeader;

const FormGroup = props => (
  <div className="form-group">
    <label className="col-xs-3 control-label">
      {props.mustRequire ? (<span className="text-danger">{'* '}</span>) : null}
      {props.label}
    </label>
    <div className="col-xs-7">
      {props.children}
    </div>
  </div>
);

const RadioLabel = props => (<label className="radio-inline" {...props} />);

const IconCheckBox = props => (
  <i className={"fa fa-fw " + (props.checked ? "fa-check-square-o" : "fa-square-o")} {...props}/>
);

const Button = props => (
  <button className={"btn btn-xs btn-" + (props.active ? 'warning' : 'default')} style={{margin:'0 3px 3px 0'}} {...props} />
);

const MainComponent = level => {

  class Main extends Component {

    constructor(props) {
      super(props);

      this.handleChangeShownCity       = this.handleChangeShownCity.bind(this);
      this.handleReloadData            = this.handleReloadData.bind(this);
      this.handleSaveData              = this.handleSaveData.bind(this);
      this.handleChangeAttachProduct   = this.handleChangeAttachProduct.bind(this);
      this.handleChangePrimaryCategory = this.handleChangePrimaryCategory.bind(this);

      this.handleChangeCategoryName    = this.handleChangeCategoryName.bind(this);
      this.handleChangeCategoryComment = this.handleChangeCategoryComment.bind(this);

      if (window.location.pathname.indexOf('edit') > -1) {
        TopHeader = getTopHeader([{
          name: '产品管理', link: '/cm'
        }, {
          name: '编辑' + (props.level === 'primary' ? '一' : '二') + '级分类', link: ''
        }]);
      } else {
        TopHeader = getTopHeader([{
          name: '产品管理', link: '/cm'
        }, {
          name: '添加' + (props.level === 'primary' ? '一' : '二') + '级分类', link: ''
        }]);
      }
    }

    render() {

      const { props } = this;
      const state = props.categoryManage;

      if (state.basicDataLoadStatus === 'pending') {
        return (
          <div>
            <TopHeader />
            <hr/>
            数据加载中…
          </div>
        )
      }

      if (state.basicDataLoadStatus === 'failed') {
        return (
          <div>
            <TopHeader />
            <hr/>
            数据加载失败，<a href="javascript:;" onClick={this.handleReloadData}>点此重新加载</a>
          </div>
        )
      }

      return (
        <div>
          <TopHeader />
          <hr/>
          <div className="form-horizontal">
            <FormGroup label='类型名称' mustRequire={true}>
              <input
                disabled={state.saveDataStatus === 'pending'}
                onChange={this.handleChangeCategoryName}
                ref="categoryName"
                type="text"
                className="form-control"
                autoFocus={true}
                value={state.name}
              />
            </FormGroup>
            {
              props.level !== 'secondary' ? undefined : (
                <FormGroup label='附属一级分类'>
                  <div className="row">
                    <div className="col-xs-4">
                      <select className="form-control" value={state.selectedCategory} onChange={this.handleChangePrimaryCategory}>
                        {
                          state.primaryCategories.map(obj => (
                            <option value={obj.id} key={obj.id}>{obj.name}</option>
                          ))
                        }
                      </select>
                    </div>
                  </div>
                </FormGroup>
              )
            }
            <FormGroup label='是否为附加商品'>
              <p>
                <RadioLabel>
                  <input
                    disabled={state.saveDataStatus === 'pending'}
                    type="radio"
                    name="attach-product"
                    onChange={this.handleChangeAttachProduct}
                    value="1"
                    {...{defaultChecked: state.isAttachProduct ? true : false}}
                  />
                  {' 是'}
                </RadioLabel>
                {'　　'}
                <RadioLabel>
                  <input
                    disabled={state.saveDataStatus === 'pending'}
                    type="radio"
                    name="attach-product"
                    onChange={this.handleChangeAttachProduct}
                    value="0"
                    {...{defaultChecked: state.isAttachProduct ? false : true}}
                  />
                  {' 否'}
                </RadioLabel>
              </p>
            </FormGroup>
            <FormGroup label='显示于所有城市'>
              <p>
                <RadioLabel>
                  <input
                    disabled={state.saveDataStatus === 'pending'}
                    type="radio"
                    name="is-show-in-all-city"
                    onChange={this.handleChangeShownCity}
                    value="1"
                    defaultChecked={state.showInAllCity ? true : false}
                  />
                  {' 是'}
                </RadioLabel>
                {'　　'}
                <RadioLabel>
                  <input
                    disabled={state.saveDataStatus === 'pending'}
                    type="radio"
                    name="is-show-in-all-city"
                    onChange={this.handleChangeShownCity}
                    value="0"
                    defaultChecked={state.showInAllCity ? false : true}
                  />
                  {' 否'}
                </RadioLabel>
              </p>
            </FormGroup>
            {
              state.showInAllCity === 1 ? null : (
                <FormGroup>
                  <CitiesSelector {...props} />
                </FormGroup>
              )
            }
            <FormGroup label="备注">
              <textarea
                disabled={state.saveDataStatus === 'pending'}
                onChange={this.handleChangeCategoryComment}
                ref="comment"
                className="form-control"
                cols="30"
                rows="10"
                style={{resize: 'none'}}
                value={state.comment}
              />
            </FormGroup>
            <FormGroup>
              <p />
              <button disabled={state.saveDataStatus === 'pending'} className="btn btn-theme" onClick={this.handleSaveData}>保存</button>
            </FormGroup>
          </div>
        </div>
      )
    }

    componentDidMount() {
      this.props.loadBasicData(
        this.props.level,
        window.location.pathname.indexOf('edit') > -1,
        this.props.params.id
      );
    }

    componentWillReceiveProps(nextProps) {
      const state = nextProps.categoryManage;
      if (state.saveDataStatus === 'failed') {
        return MessageBox({
          icon: MessageBoxIcon.Error,
          text: '保存失败'
        }).then(
          nextProps.resetSaveDataStatus
        );
      }

      if (state.saveDataStatus === 'success') {
        const { history } = this.props;
        return MessageBox({
          icon: MessageBoxIcon.Success,
          text: '保存成功'
        }).then(() => {
          history.push('/cm');
        });
      }
    }

    handleReloadData() {
      this.props.loadBasicData(
        this.props.level,
        window.location.pathname.indexOf('edit') > -1,
        this.props.params.id
      );
    }

    handleChangeCategoryName(event) {
      this.props.changeCategoryName(event.currentTarget.value);
    }

    handleChangeCategoryComment(event) {
      this.props.changeCategoryComment(event.currentTarget.value);
    }

    handleChangeShownCity(event) {
      this.props.toggleShowAllCity(Number(event.target.value));
    }

    handleChangeAttachProduct(event) {
      this.props.changeAttachProduct(Number(event.target.value));
    }

    handleChangePrimaryCategory(event) {
      this.props.changePrimaryCategory(Number(event.currentTarget.value));
    }

    handleSaveData() {
      const { level } = this.props;
      const state = this.props.categoryManage;

      if (state.name.trim() === '') {
        return MessageBox({
          text: '名称不能为空'
        });
      }

      this.props.saveData(level);
    }
  }

  Main.defaultProps = { level };
  return Main;
}


const getComponent = level => {
  return connect(
    ({ categoryManage, categoryCitiesSelector }) => ({ categoryManage, categoryCitiesSelector }),
    dispatch => bindActionCreators({...actions, ...selectorActions}, dispatch)
  )(MainComponent(level));
};

export default getComponent;