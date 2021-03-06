import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Link } from 'react-router';

import DateTimeRangePicker from 'react-bootstrap-datetimerange-picker';
import MessageBox, { MessageBoxIcon, MessageBoxType } from 'common/message_box';
import CitiesSelector from 'common/cities_selector';
import DropDownMenu from 'common/dropdown';
import SearchList from 'common/search_list';
import getTopHeader from '../top_header';
import LazyLoad from 'utils/lazy_load';

import SkuAction from 'actions/product_sku_management';
import CitiesSelectorAction from 'actions/cities_selector';

LazyLoad('datetimerangepicker');

const FormHorizontal = props => (<div className="form-horizontal" {...props} />)
const FormGroup = props => (<div className="form-group" {...props} />);
const FormInline = props => (<div className="form-inline" {...props} />);
// const Input = props => (<input type="number" className="form-control input-xs" {...props} />);
const CheckBox = props => (<input type="checkbox" {...props} />);
const Radio = props => (<input type="radio" {...props} />);
const Row = props => (<div className="row" {...props} />);
const RadioInline = props => (<label className="radio-inline" {...props} />);
const ControlLabel = props => (<label className={"control-label" + (props.xs ? (" col-xs-" + props.xs) : "")} {...props} />);

class Input extends Component {
  constructor(props){
    super(props);
    this.state = {
      error: !props.value
    }
    this.onChange = this.onChange.bind(this);
    this.onBlur = this.onBlur.bind(this);
  }
  render(){
    return (
      <div className="inline-block">
        <input
          type="number"
          {...this.props}
          onChange={this.onChange}
          onBlur={this.onBlur}
          className={`form-control input-xs ${this.props.className}`}
        />
        {
          this.props.required && this.state.error && !this.props.disabled
            ? <span className="space-left text-danger">（必填）</span>
            : null
        }
      </div>
    )
  }
  onChange(e){
    if(e.target.value.trim()){
      this.setState({ error: false })
    }
    this.props.onChange && this.props.onChange(e);
  }
  onBlur(e){
    if(!e.target.value.trim()){
      this.setState({ error: true })
    }
    this.props.onBlur && this.props.onBlur(e);
  }
  componentWillReceiveProps(nextProps){
    if(nextProps.value != this.props.value){
      this.setState({error: !nextProps.value})
    }
  }
}
const Col = props => {
  let className = '';

  if (props.xs)
    className += (' col-xs-' + props.xs);
  if (props.offset)
    className += (' col-xs-offset-' + props.offset);
  if (props.lg)
    className += (' col-lg-' + props.lg);
  if (props.lgOffset)
    className += (' col-lg-offset-' + props.lgOffset);

  return (<div className={className.trim()} {...props} />);
}

const Anchor = props => {
  if (props.disabled) {
  return (<a disabled={true} style={{cursor:'not-allowed',color:'#aaa'}} key='disable'>{props.children}</a>);
  }

  return (<a key='enable' href="javascript:;" {...props} />);
}

const switchTopHeader = addMode => getTopHeader([{
  name: '产品管理',
  link: ''
}, {
  name: '搜索商品',
  link: '/pm/sku_manage'
}, {
  name: addMode ? '新建商品' : '编辑商品',
  link: ''
}]);

const tabContentBoxStyle = {
  borderTopLeftRadius: 0,
  borderTopRightRadius: 0,
  border: 'solid 1px #ddd',
  borderTop: 'none',
  boxShadow: 'none'
}
const pickerStyle = { width: 270, textAlign: 'center' }
const inputStyle = { width: 70 }
const redBorder = { borderColor: "#f00" }
const warningInputStyle = { width: 70, ...redBorder }
const pointCursor = { cursor: 'pointer' }
const letTheTipsLower = { display: 'flex', alignItems: 'baseline' }

const getDOMValue = func => (event, ...args) => func.apply(undefined, [event.currentTarget.value, ...args]);
const getSpecInputValue = (i, func) => (event, ...args) => func.apply(undefined, [i, event.currentTarget.value, ...args]);

class BasicOptions extends Component {
  constructor(props) {
    super(props);

    this.handleToggleCitiesSelector = this.handleToggleCitiesSelector.bind(this);

    this.state = {
      showCitiesSelector: false
    }
  }

  render() {

    const { state, Action, CitiesSelectorAction, citiesSelectorState } = this.props;

    return (
      <FormHorizontal>
        <FormGroup>
          <ControlLabel xs='2'>商品名称：</ControlLabel>
          <Col xs="3">
            <FormInline>
              <Input
                type="text"
                required
                disabled={!state.addMode}
                value={state.productName}
                onChange={getDOMValue(Action.changeProductName)}
              />
            </FormInline>
          </Col>
        </FormGroup>
        <FormGroup>
          <ControlLabel xs='2'>购买方式：</ControlLabel>
          <Col xs="10">
            <p style={letTheTipsLower}>
              <RadioInline>
                <Radio
                  name="inlineRadioOptions"
                  value="0"
                  onChange={getDOMValue(Action.changeBuyEntry)}
                  checked={state.buyEntry === 0}
                />
                {' 商城可购买'}
              </RadioInline>
              {'　　'}
              <RadioInline>
                <Radio
                  name="inlineRadioOptions"
                  value="1"
                  onChange={getDOMValue(Action.changeBuyEntry)}
                  checked={state.buyEntry === 1}
                />
                {' 外部渠道可购买'}
              </RadioInline>
              <small className="text-muted">（外部渠道购买则代表此商品不直接展示在商城中）</small>
            </p>
          </Col>
        </FormGroup>
        <FormGroup>
          <ControlLabel xs='2'>商品分类：</ControlLabel>
          <Col xs="10">
            <FormInline>
              <select
                className="form-control input-xs"
                onChange={getDOMValue(Action.changeSelectedPrimaryCategory)}
                value={state.selectPrimaryCategory}
              >
                {
                  [...state.primaryCategories].map(([key, name]) => (
                    <option key={key} value={key}>{name}</option>
                  ))
                }
              </select>
              {'　'}
              <select
                className="form-control input-xs"
                onChange={getDOMValue(Action.changeSelectedSecondaryCategory)}
                value={state.selectSecondaryCategory}
              >
                {
                  state.secondaryCategories.get(state.selectPrimaryCategory).map(obj => (
                    <option key={obj.id} value={obj.id}>{obj.name}</option>
                  ))
                }
              </select>
              <small className="text-muted">（商品所在城市默认为分类设置的城市）</small>
            </FormInline>
          </Col>
        </FormGroup>
        <FormGroup>
          <ControlLabel xs='2'>上线城市：</ControlLabel>
          <Col xs="10">
            <p style={letTheTipsLower}>
              <RadioInline>
                <Radio
                  name="aaa"
                  value="0"
                  onChange={getDOMValue(Action.changeActiveCitiesOption)}
                  checked={state.activeCitiesOption === 0}
                />
                {' 所有已开通城市'}
              </RadioInline>
              {'　　'}
              <RadioInline>
              <Radio
                name="aaa"
                value="1"
                onClick={e => this.setState({ showCitiesSelector: true })}
                onChange={getDOMValue(Action.changeActiveCitiesOption)}
                checked={state.activeCitiesOption === 1}
              />
                {' 部分城市'}
              </RadioInline>
              <RadioInline>
                <Anchor
                  disabled={state.activeCitiesOption === 0}
                  onClick={this.handleToggleCitiesSelector}
                >
                  {this.state.showCitiesSelector ? '收起' : '展开'}
                </Anchor>
              </RadioInline>
              <small className="text-muted">（当前可选择城市或默认已开通城市均为该分类上线范围内）</small>
            </p>
          </Col>
        </FormGroup>
        {
          (state.activeCitiesOption === 1 && this.state.showCitiesSelector) ? (
            <FormGroup>
              <Col xs="8" offset='2'>
                <CitiesSelector citiesSelector={citiesSelectorState} {...CitiesSelectorAction} />
              </Col>
            </FormGroup>
          ) : undefined
        }
      </FormHorizontal>
    );
  }

  handleToggleCitiesSelector() {
    this.setState({
      showCitiesSelector: !this.state.showCitiesSelector
    });
  }
}

class PreSaleOptions extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { state, Action } = this.props;
    const { tempOptions } = state;

    return (
      <div>
        <Row>
          <Col xs="10" offset="2">
            <FormInline>
              预售上架时间：
              <DateTimeRangePicker
                className="form-control input-xs"
                style={pickerStyle}
                beginTime={tempOptions.onSaleTime[0]}
                endTime={tempOptions.onSaleTime[1]}
                onChange={Action.changePreSaleTime}
              />
            </FormInline>
          </Col>
        </Row>
        <p />
        <Row>
          <Col xs="10" offset="2">
            <FormInline>
              预售发货时间：
              <DateTimeRangePicker
                className="form-control input-xs"
                style={pickerStyle}
                beginTime={tempOptions.delivery[0]}
                endTime={tempOptions.delivery[1]}
                onChange={Action.changeDeliveryTime}
              />
            </FormInline>
          </Col>
        </Row>
      </div>
    );
  }
}

class ShopSpecificationsOptions extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { state, Action } = this.props;

    return (
    <div>
      <FormGroup>
        <ControlLabel xs='2' lg="2">
          商城展示名：
        </ControlLabel>
        <Col xs="9" lg="7">
          <FormInline>
            <Input
              type="text"
              required
              value={state.productDisplayName}
              onChange={getDOMValue(Action.changeProductDisplayName)}
            />
          </FormInline>
        </Col>
      </FormGroup>
      {
        !state.cityOptionSavable
          ? <FormGroup>
              <div style={{margin: '17px 0 0 124px'}} className="text-danger">商城规格、渠道设置必须选择一项</div>
            </FormGroup>
          : null
      }
      <FormGroup>
        <ControlLabel xs='2' lg="2">
          商城规格：
          <br/>
          <small className="text-muted">原价为商城详情页显示价格，价格栏为商城实际销售价格</small>
        </ControlLabel>
        <Col xs="9" lg="7">
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>规格</th>
                <th>原价</th>
                <th>价格</th>
                <th>促销</th>
                <th>活动价格</th>
                <th>活动时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {
                state.tempOptions.shopSpecifications.length === 0 ? (
                  <tr><td colSpan='7'>没有规格</td></tr>
                ) : (
                  state.tempOptions.shopSpecifications.map((detail, index) => (
                    <tr key={detail._key || detail.id}>
                      <td>
                        <center>
                          <SearchList
                            value={detail.spec}
                            disabled={!state.addMode && !detail._new}
                            onChoose={Action.changeShopSpecifications.bind(null, index)}
                            data={state.specSet}
                          />
                        </center>
                      </td>
                      <td>
                        <center>
                          <Input
                            step="0.01"
                            min="0.01"
                            style={detail.originalCost <= 0 ? warningInputStyle : inputStyle}
                            value={detail.originalCost}
                            onChange={getSpecInputValue(index, Action.changeShopSpecificationsOriginalCost)}
                          />
                        </center>
                      </td>
                      <td>
                        <center>
                          <Input
                            step="0.01"
                            min="0.01"
                            style={detail.originalCost <= 0 ? warningInputStyle : inputStyle}
                            value={detail.cost}
                            onChange={getSpecInputValue(index, Action.changeShopSpecificationsCost)}
                          />
                        </center>
                      </td>
                      <td>
                        <center>
                          <CheckBox
                            checked={detail.hasEvent}
                            onChange={e => Action.changeShopSpecificationsEventStatus(index, e.checked)}
                          />
                        </center>
                      </td>
                      {
                        detail.hasEvent ? [(
                          <td key='1'>
                            <center>
                              <Input
                                step="0.01"
                                min="0.01"
                                style={inputStyle}
                                value={detail.eventCost}
                                onChange={getSpecInputValue(index, Action.changeShopSpecificationsEventCost)}
                              />
                            </center>
                          </td>
                        ), (
                          <td key='2'>
                            <center>
                              <DateTimeRangePicker
                                style={pickerStyle}
                                className="form-control input-xs"
                                beginTime={detail.eventTime[0]}
                                endTime={detail.eventTime[1]}
                                onChange={(b, e) => Action.changeShopSpecificationsEventTime(index, b, e)}
                              />
                            </center>
                          </td>
                        )] : (<td colSpan='2'>-</td>)
                      }
                      <td>
                        <center>
                          <i
                            className="fa fa-times text-danger"
                            onClick={e => Action.removeShopSpecifications(index)}
                            style={pointCursor}
                          />
                        </center>
                      </td>
                    </tr>
                  ))
                )
              }
            </tbody>
          </table>
          <p />
          <button className="btn btn-xs btn-default" onClick={Action.createShopSpecifications}>新增规格</button>
        </Col>
      </FormGroup>
    </div>
    );
  }
}

class SourceOptions extends Component {
  constructor(props) {
    super(props);

    this.handleAddSource = this.handleAddSource.bind(this);
  }

  render() {
    const { state, Action } = this.props;
    const { tempOptions } = state;

    const sourceSpecification = tempOptions.sourceSpecifications.get(tempOptions.selectedSource);

    let emptySpecList = (
      <tr>
        <td colSpan="3">没有规格</td>
      </tr>
    );

    return (
      <FormGroup>
        <ControlLabel xs='2'>渠道设置：</ControlLabel>
        <Col xs="3" lg="2">
          <div className="list-group">
            {
              [...tempOptions.sourceSpecifications].map(
                ([sid, detail]) => {
                  return (
                    <li
                      key={sid}
                      className={"list-group-item" + (tempOptions.selectedSource === sid ? ' active' : '')}
                      onClick={e => Action.changeSelectedSource(sid)}
                    >
                      <span style={pointCursor}>
                        {state.originOrderSource.find(n => n.id == sid).name}
                      </span>
                      <span className="pull-right">
                        <i
                          style={pointCursor}
                          className={"fa fa-times" + (tempOptions.selectedSource === sid ? '' : ' text-danger')}
                          onClick={Action.removeSource.bind(undefined, sid)}
                        />
                      </span>
                    </li>
                  );
                }
              )
            }
            <div className="list-group-item" style={{display:'flex'}}>
              <select className="form-control input-xs" style={{flex:1, marginRight:10}} ref='sourceList'>
                {
                  state.orderSource.map(({id, name, srcs}) => {
                    if(srcs && srcs.length){
                      return (
                        <optgroup key={id} label={name}>
                          {
                            srcs.map( n => <option key={n.id} value={n.id}>{n.name}</option> )
                          }
                        </optgroup>
                      )
                    }else{
                      return <option key={id} value={id}>{name}</option>
                    }
                  })
                }
              </select>
              <button className="btn btn-default btn-xs" onClick={this.handleAddSource}>
                ＋
              </button>
            </div>
          </div>
        </Col>
        <Col xs="6" lg="5">
          <div className="panel">
            <div className="panel-heading">
              <div className="panel-title">
                渠道规格
                <small>
                  <span className="pull-right">
                    <button
                      className="btn btn-xs btn-default"
                      onClick={Action.addSourceSpec}
                      disabled={!sourceSpecification}
                    >
                      新增规格
                    </button>
                  </span>
                </small>
              </div>
            </div>
            <table className="table table-bordered table-striped">
              <thead>
                <tr>
                  <th>规格</th>
                  <th>价格</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {
                  (!sourceSpecification || sourceSpecification.length === 0) ? (
                    <tr>
                      <td colSpan="3">没有规格</td>
                    </tr>
                  ) : (
                    sourceSpecification.map((detail, index) => (
                      <tr key={detail._key || detail.id}>
                        <td>
                          <SearchList
                            value={detail.spec}
                            disabled={!state.addMode && !detail._new}
                            onChoose={Action.changeSourceSpec.bind(null, index)}
                            data={state.specSet}
                          />
                        </td>
                        <td>
                          <div className="inline-block">
                            <Input
                              step="0.01"
                              min="0.01"
                              value={detail.cost}
                              onChange={this.handleChangeSourceSpecCost.bind(this, index)}
                            />
                          </div>
                        </td>
                        <td>
                          <Anchor onClick={Action.removeSourceSpec.bind(undefined, index)}>
                            <i className="fa fa-times text-danger" />
                          </Anchor>
                        </td>
                      </tr>
                    ))
                  )
                }
              </tbody>
            </table>
          </div>
        </Col>
        {
          state.buyEntry == 1 && !state.cityOptionSavable
            ? <p className="text-danger" style={{marginLeft: 124}}>（渠道设置必填）</p>
            : null
        }
      </FormGroup>
    );
  }

  handleAddSource() {
    const selectedSource = this.refs.sourceList.value;
    this.props.Action.addSource(selectedSource);
  }

  handleChangeSourceSpec(index, event) {
    this.props.Action.changeSourceSpec(index, event.currentTarget.value);
  }

  handleChangeSourceSpecCost(index, event) {
    this.props.Action.changeSourceSpecCost(index, event.currentTarget.value);
  }
}

class SecondaryBookingTimeOptions extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { state, Action } = this.props;

    return (
      <div>
        <p key="p" />
        <Row key="row">
          <Col xs="10" offset='2'>
            {'第二预约时间：'}
            <CheckBox checked={state.tempOptions.hasSecondaryBookingTime} onChange={Action.changeSecondaryBookingTimeStatus} />
          </Col>
        </Row>
        {
          !state.tempOptions.hasSecondaryBookingTime ? null : [(
            <p key="p1" />
          ), (
            <Row key="row1">
              <Col xs="10" offset='2'>
                <FormInline>
                  {'　　　　时间：'}
                  <Input
                    style={Number(state.tempOptions.secondaryBookingTime) <= 0 ? redBorder : {} }
                    value={state.tempOptions.secondaryBookingTime}
                    onChange={getDOMValue(Action.changeSecondaryBookingTime)}
                    step="0.5"
                    min="0"
                  />
                  <small className='text-muted'>（小时）</small>
                </FormInline>
              </Col>
            </Row>
          ), (
            <p key="p2" />
          ), (
            <Row key="row2">
              <Col xs="10" offset="2">
                <FormInline>
                  {'　　　　'}
                  区域：
                  {
                    [...state.districtsData.get(state.selectedCity)].map(
                      ({ id, name }) => (
                        <label key={id}>
                          <CheckBox
                            checked={state.tempOptions.applyDistrict.has(id)}
                            onChange={e => Action.changeSecondaryBookingTimeRange(id)}
                          />
                          {' ' + name + '　'}
                        </label>
                      )
                    )
                  }
                </FormInline>
              </Col>
            </Row>
          )]
        }
      </div>
    );
  }
}

class CitiesOptions extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { state, Action } = this.props;

    return (
      <FormHorizontal>
        {
          state.addMode
            ? <FormGroup>
                <ControlLabel xs='2'>应用范围：</ControlLabel>
                <Col xs='10'>
                  <p>
                    <RadioInline key="radio">
                      <Radio
                        disabled={!state.addMode}
                        name="citiesOptionApplyRange"
                        value="0"
                        checked={state.citiesOptionApplyRange === 0}
                        readOnly={state.citiesOptionApplyRange === 0}
                        {...state.citiesOptionApplyRange === 0 ? {} : {onChange: getDOMValue(Action.changeCitiesOptionApplyRange)}}
                      />
                      {' 全部一致'}
                    </RadioInline>
                    <RadioInline>
                      <Radio
                        disabled={!state.addMode}
                        name="citiesOptionApplyRange"
                        value="1"
                        checked={state.citiesOptionApplyRange === 1}
                        readOnly={state.citiesOptionApplyRange === 1}
                        {...state.citiesOptionApplyRange === 1 ? {} : {onChange: getDOMValue(Action.changeCitiesOptionApplyRange)}}
                      />
                      {' 独立配置'}
                    </RadioInline>
                  </p>
                </Col>
              </FormGroup>
            : null
        }
        {
          state.citiesOptionApplyRange === 0 ? null : (
            <FormGroup>
              <ControlLabel xs='2'>配置城市：</ControlLabel>
              <Col xs='10'>
                <DropDownMenu
                  list={ [...state.provincesData.values()].map(this.transformToDropDownList) }
                  value={state.selectedProvince}
                  onChange={Action.changeSelectedProvince}
                />
                {'　'}
                <DropDownMenu
                  list={
                    [...state.citiesData.values()].filter(
                      obj => obj.province === state.selectedProvince
                    ).map(this.transformToDropDownList)
                  }
                  value={state.selectedCity}
                  onChange={Action.changeSelectedCity}
                />
                {'　'}
                {
                  (state.selectedCity !== 0 && state.cityOptionSavable)
                    ? state.cityOptionSaved
                      ? <button className="btn btn-default btn-xs" disabled={true}>已保存</button>
                      : <button className="btn btn-theme btn-xs" onClick={Action.saveCityOption}>保存城市设置</button>
                    : <button className="btn btn-default btn-xs" disabled={true}>保存城市设置</button>
                }
                {'　'}
                <small className="text-muted">（暂存当前城市配置）</small>
              </Col>
            </FormGroup>
          )
        }
        <Row><Col xs='10' offset='1'><hr/></Col></Row>
        <FormGroup>
          <ControlLabel xs='2'>上架设置：</ControlLabel>
          <Col xs="6">
            <FormInline>
              <div className="checkbox">
                <label>
                  {'　　预售商品：'}
                  <CheckBox checked={state.tempOptions.isPreSale} onChange={Action.changePreSaleStatus} />
                </label>
              </div>
            </FormInline>
          </Col>
        </FormGroup>
        {
          state.tempOptions.isPreSale
          ? (<PreSaleOptions state={state} Action={Action} />)
          : null
        }
        <p />
        <Row>
          <Col xs="10" offset='2'>
            <FormInline>
              {'　　预约时间：'}
              <Input
                style={Number(state.tempOptions.bookingTime) <= 0 ? redBorder : {} }
                min="0"
                step="0.5"
                value={state.tempOptions.bookingTime}
                onChange={getDOMValue(Action.changeBookingTime)}
              />
              <small className='text-muted'>（小时）</small>
            </FormInline>
          </Col>
        </Row>
        {
          state.citiesData.get(state.selectedCity).isThirdlyRegion || (state.citiesOptionApplyRange === 0) ? null : (
            <SecondaryBookingTimeOptions state={state} Action={Action} />
          )
        }
        {
          state.buyEntry === 0 ? [(
            <Col key="hr" xs='10' offset='1'><hr/></Col>
          ), (
            <ShopSpecificationsOptions key="ShopSpecificationsOptions" Action={Action} state={state} />
          )] : null
        }
        <Row><Col xs='10' offset='1'><hr/></Col></Row>
        <SourceOptions Action={Action} state={state} />
      </FormHorizontal>
    );
  }

  transformToDropDownList(obj) {
    return {
      id: obj.id,
      text: obj.name,
      checked: obj.checked,
      disabled: obj.disabled
    };
  }
}

class Main extends Component {
  constructor(props) {
    super(props);

    this.handleSaveOption = this.handleSaveOption.bind(this);
  }

  render() {

    const { state, Action, citiesSelector, CitiesSelectorAction, params: {productId} } = this.props;

    if (state.basicDataLoadStatus === 'pending') {
      return (
        <div className="wrapper">加载中</div>
      );
    }

    let enableSaveButton = true;

    if (
      state.productName.trim() === ''
    ) {
      enableSaveButton = false;
    }

    if (
      state.buyEntry == 0 &&
      state.productDisplayName.trim() === ''
    ) {
      enableSaveButton = false;
    }
    
    if(!state.citiesData.size){
      enableSaveButton = false;
    }

    if (
      state.citiesOptionApplyRange === 1
      && [...state.citiesOptions.keys()].filter(x => x !== 'all').length === 0
    ) {
      enableSaveButton = false;
    }

    if (
      state.citiesOptionApplyRange === 0
      && state.cityOptionSavable === false
    ) {
      enableSaveButton = false;
    }

    if (!state.cityOptionSavable) {
      enableSaveButton = false;
    }

    const TopHeader = switchTopHeader(state.addMode);

    return (
      <div className="wrapper">
        <TopHeader />
        <ul className="nav nav-tabs">
          <li className="active">
            {
              state.addMode
                ? <Anchor>新建商品</Anchor>
                : <Anchor>编辑商品</Anchor>
            }
          </li>
          {
            state.addMode
              ? null
              : <li><Link to={`/pm/sku_manage/edit_website/${productId+location.hash}`} >商品官网设置</Link></li>
          }
        </ul>
        <div className="panel" style={tabContentBoxStyle}>
          <div className="panel-body">
            <h3>{'　'}基本信息</h3>
            <hr style={{borderTop: 'solid 2px #9E6D24'}}/>
            <BasicOptions state={state} citiesSelectorState={citiesSelector} Action={Action} CitiesSelectorAction={CitiesSelectorAction} />
            <p />
            <h3>{'　'}城市配置<small className="text-primary">{'　'}城市一致操作，则默认所有城市该商品的价格规格全部一致。独立城市编辑，则城市的规格配置均不同</small></h3>
            <hr style={{borderTop: 'solid 2px #9E6D24'}}/>
            {
              state.selectedProvince === 0
              ? <Row><Col offset="1" xs="11"><span className="text-danger">你还未选择上线城市，无法设置商品信息！</span></Col></Row>
              : <CitiesOptions state={state} Action={Action} />
            }
            <hr style={{borderTop: 'solid 2px #9E6D24'}}/>
            <div className="row">
              <div className="col-xs-10 col-xs-offset-2">
              {
                enableSaveButton ? (
                  <button className="btn btn-theme" onClick={this.handleSaveOption}>
                    保存商品设置
                  </button>
                ) : (
                  <button className="btn btn-default" disabled={true}>
                    保存商品设置
                  </button>
                )
              }
              {'　'}
              {
                state.citiesOptionApplyRange === 1 && !state.cityOptionSaved
                ? (<small className="text-danger">当前所选城市的配置信息尚未保存</small>)
                : null
              }
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  componentDidMount() {
    const { params } = this.props;

    if (params.productId)
      return this.props.Action.loadBasicData(params.productId);

    this.props.Action.loadBasicData(params.productId || 0);
  }

  componentDidUpdate() {
    const { state, Action, history } = this.props;

    if (state.saveStatus === 'failed') {
      return MessageBox({
        icon: MessageBoxIcon.Error,
        text: '保存失败'
      }).then(
        Action.resetSaveStatus
      );
    }

    if (state.saveStatus === 'success') {
      return MessageBox({
        btnType: MessageBoxType.YesNo,
        text: '是否立即设置商品详情页相关内容？'
      }).then(x => {
        //取一个默认城市
        if(state.citiesOptionApplyRange == 0){
          var city_id = [...state.citiesData.keys()][0];
        }else{
          var city_id = [...state.citiesOptions.keys()][0];
          if (city_id === "all") {
            city_id = [...state.citiesOptions.keys()][1];
          }
        }
        history.push(`/pm/sku_manage/edit_website/${state.addMode ? state.newProductId : state.productId +'#'+city_id}`);
        Action.resetSaveStatus();
      }, () => {
        Action.resetSaveStatus();
        history.push('/pm/sku_manage');
      });
    }
  }

  handleSaveOption() {
    const { state, Action } = this.props;

    if (!state.cityOptionSaved && state.citiesOptionApplyRange === 1) {
      return MessageBox({
        icon: MessageBoxIcon.Warning,
        text: '您还有尚未暂存城市配置的信息。如果继续保存，这些信息将会丢失。请问是否继续？',
        btnType: MessageBoxType.YesNo
      }).then(Action.saveOption);
    }

    Action.saveOption();
  }
}

export default connect(
  ({
    productSKUManagement,
    citiesSelector
  }) => ({
    state: productSKUManagement,
    citiesSelector
  }),
  dispatch => ({
    Action: bindActionCreators(SkuAction, dispatch),
    CitiesSelectorAction: bindActionCreators(CitiesSelectorAction, dispatch)
  }),
)(Main);