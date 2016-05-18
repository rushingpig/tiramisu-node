import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import DateTimeRangePicker from 'react-bootstrap-datetimerange-picker';
import MessageBox, { MessageBoxIcon } from 'common/message_box';
import CitiesSelector from 'common/cities_selector';
import DropDownMenu from 'common/dropdown';
import getTopHeader from '../top_header';
import LazyLoad from 'utils/lazy_load';

import SkuAction from 'actions/product_sku_management';
import CitiesSelectorAction from 'actions/cities_selector';

const TopHeader = getTopHeader([{name: '产品管理', link: ''}, {name: '添加商品', link: '/pm/sku_manage/add'}]);

LazyLoad('datetimerangepicker');

const FormHorizontal = props => (<div className="form-horizontal" {...props} />)
const FormGroup = props => (<div className="form-group" {...props} />);
const Input = props => (<input type="number" className="form-control input-xs" {...props} />);
const CheckBox = props => (<input type="checkbox" {...props} />);
const Radio = props => (<input type="radio" {...props} />);
const Row = props => (<div className="row" {...props} />);

const Col = props => {
    let className = '';

    if (props.xs)
        className += (' col-xs-' + props.xs);
    if (props.offset)
        className += (' col-xs-offset-' + props.offset);

    return (<div className={className.trim()} {...props} />);
}

const Anchor = props => {
  if (props.disabled) {
    return (<a disabled={true} style={{cursor:'not-allowed',color:'#aaa'}} key='disable'>{props.children}</a>);
  }

  return (<a key='enable' href="javascript:;" {...props} />);
}

const tabContentBoxStyle = {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    border: 'solid 1px #ddd',
    borderTop: 'none',
    boxShadow: 'none'
}
const pickerStyle = { width: 260, textAlign: 'center' }
const inputStyle = { width: 70 }
const pointCursor = { cursor: 'pointer' }

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

        const { state, Action, citiesSelectorState } = this.props;

        return (
            <FormHorizontal>
                <FormGroup>
                    <label className="col-xs-2 control-label">商品名称：</label>
                    <Col xs="4">
                        <Input type="text" autoFocus={true} onChange={getDOMValue(Action.changeProductName)} value={state.productName} />
                    </Col>
                </FormGroup>
                <FormGroup>
                    <label className="col-xs-2 control-label">购买方式：</label>
                    <Col xs="6">
                        <p>
                            <label className="radio-inline">
                            <Radio
                                name="inlineRadioOptions"
                                value="0"
                                onChange={getDOMValue(Action.changeBuyEntry)}
                                checked={state.buyEntry === 0}
                            />
                              {' 商城可购买'}
                            </label>
                            {'　　'}
                            <label className="radio-inline">
                            <Radio
                                name="inlineRadioOptions"
                                value="1"
                                onChange={getDOMValue(Action.changeBuyEntry)}
                                checked={state.buyEntry === 1}
                            />
                              {' 外部渠道可购买'}
                            </label>
                        </p>
                    </Col>
                </FormGroup>
                <FormGroup>
                    <label className="col-xs-2 control-label">商品分类：</label>
                    <Col xs="10">
                        <div className="form-inline">
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
                        </div>
                    </Col>
                </FormGroup>
                <FormGroup>
                    <label className="col-xs-2 control-label">上线城市：</label>
                    <Col xs="10">
                        <p>
                            <label className="radio-inline">
                              <Radio
                                name="aaa"
                                value="0"
                                onChange={getDOMValue(Action.changeActiveCitiesOption)}
                                checked={state.activeCitiesOption === 0}
                            />
                                {' 所有已开通城市'}
                            </label>
                            {'　　'}
                            <label className="radio-inline">
                            <Radio
                                name="aaa"
                                value="1"
                                onChange={getDOMValue(Action.changeActiveCitiesOption)}
                                checked={state.activeCitiesOption === 1}
                            />
                                {' 部分城市'}
                            </label>
                            <label className="radio-inline">
                                <Anchor
                                    disabled={state.activeCitiesOption === 0}
                                    onClick={this.handleToggleCitiesSelector}
                                >
                                    {this.state.showCitiesSelector ? '收起' : '展开'}
                                </Anchor>
                            </label>
                        </p>
                    </Col>
                </FormGroup>
                {
                    (state.activeCitiesOption === 1 && this.state.showCitiesSelector) ? (
                        <FormGroup>
                            <Col xs="8" offset='2'>
                                <CitiesSelector citiesSelector={citiesSelectorState} {...Action} />
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
                        <div className="form-inline">
                            预售上架时间：
                            <DateTimeRangePicker
                                className="form-control input-xs"
                                style={pickerStyle}
                                beginTime={tempOptions.onSaleTime[0]}
                                endTime={tempOptions.onSaleTime[1]}
                                onChange={Action.changePreSaleTime}
                            />
                        </div>
                    </Col>
                </Row>
                <p />
                <Row>
                    <Col xs="10" offset="2">
                        <div className="form-inline">
                            预售发货时间：
                            <DateTimeRangePicker
                                className="form-control input-xs"
                                style={pickerStyle}
                                beginTime={tempOptions.delivery[0]}
                                endTime={tempOptions.delivery[1]}
                                onChange={Action.changeDeliveryTime}
                            />
                        </div>
                    </Col>
                </Row>
                {
                    state.citiesOptionApplyRange === 0 ? null : (
                        <div>
                            <p />
                            <Row><Col xs="8" offset="2"><hr/></Col></Row>
                            <Row>
                                <Col xs="10" offset="2">
                                    <div className="form-inline">
                                        <div className="checkbox">
                                            <label>
                                                {'第二预约时间：'}
                                                <CheckBox checked={tempOptions.hasSecondaryBookingTime} onChange={Action.changeSecondaryBookingTimeStatus} />
                                            </label>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    )
                }
                {
                    tempOptions.hasSecondaryBookingTime ? (
                        <div>
                            <p />
                            <Row>
                                <Col xs="10" offset="2">
                                    <div className="form-inline">{'　　　　'}时间：<Input onChange={getDOMValue(Action.changeSecondaryBookingTime)} /></div>
                                </Col>
                            </Row>
                            <p />
                            <Row>
                                <Col xs="10" offset="2">
                                    <div className="form-inline">
                                        {'　　　　'}
                                        区域：
                                        {
                                            [...state.districtsData.get(state.selectedCity)].map(
                                                ({ id, name }) => (
                                                    <label key={id}>
                                                        <CheckBox
                                                            checked={tempOptions.applyDistrict.has(id)}
                                                            onChange={e => Action.changeSecondaryBookingTimeRange(id)}
                                                        />
                                                        {' ' + name + '　'}
                                                    </label>
                                                )
                                            )
                                        }
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    ) : null
                }
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
            <FormGroup>
                <label className="col-xs-2 control-label">商城规格：</label>
                <Col xs="9">
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
                                        <tr key={index}>
                                            <td>
                                                <center>
                                                    <Input
                                                        type="text"
                                                        style={inputStyle}
                                                        value={detail.spec}
                                                        onChange={getSpecInputValue(index, Action.changeShopSpecifications)}
                                                    />
                                                </center>
                                            </td>
                                            <td>
                                                <center>
                                                    <Input
                                                        style={inputStyle}
                                                        value={detail.originalCost}
                                                        onChange={getSpecInputValue(index, Action.changeShopSpecificationsOriginalCost)}
                                                    />
                                                </center>
                                            </td>
                                            <td>
                                                <center>
                                                    <Input
                                                        style={inputStyle}
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
                <label className="col-xs-2 control-label">渠道设置：</label>
                <Col xs="2">
                    <div className="list-group">
                        {
                            [...tempOptions.sourceSpecifications].map(
                                ([sid, detail]) => {
                                    return (
                                        <li key={sid} className={"list-group-item" + (tempOptions.selectedSource === sid ? ' active' : '')}>
                                            <span
                                                style={pointCursor}
                                                onClick={e => Action.changeSelectedSource(sid)}
                                            >
                                                {state.orderSource.get(sid)}
                                            </span>
                                            <span className="pull-right">
                                                <i
                                                    style={pointCursor}
                                                    className="fa fa-times"
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
                                    [...state.orderSource].map(([id, name]) => (
                                        <option key={id} value={id}>{name}</option>
                                    ))
                                }
                            </select>
                            <button className="btn btn-default btn-xs" onClick={this.handleAddSource}>
                                ＋
                            </button>
                        </div>
                    </div>
                </Col>
                <Col xs="5">
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
                                            <tr key={index}>
                                                <td>
                                                    <Input
                                                        type='text'
                                                        value={detail.spec}
                                                        onChange={this.handleChangeSourceSpec.bind(this, index)}
                                                    />
                                                </td>
                                                <td>
                                                    <Input
                                                        value={detail.cost}
                                                        onChange={this.handleChangeSourceSpecCost.bind(this, index)}
                                                    />
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

class CitiesOptions extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { state, Action } = this.props;

        return (
            <FormHorizontal>
                <FormGroup>
                    <label className="col-xs-2 control-label">应用范围：</label>
                    <Col xs='10'>
                        <p>
                            <label className="radio-inline">
                            <Radio
                                name="citiesOptionApplyRange"
                                value="0"
                                onChange={getDOMValue(Action.changeCitiesOptionApplyRange)}
                                checked={state.citiesOptionApplyRange === 0}
                            />
                                {' 全部一致'}
                            </label>
                            {'　　'}
                            <label className="radio-inline">
                            <Radio
                                name="citiesOptionApplyRange"
                                value="1"
                                onChange={getDOMValue(Action.changeCitiesOptionApplyRange)}
                                checked={state.citiesOptionApplyRange === 1}
                            />
                                {' 独立配置'}
                            </label>
                        </p>
                    </Col>
                </FormGroup>
                {
                    state.citiesOptionApplyRange === 0 ? null : (
                        <FormGroup>
                            <label className="col-xs-2 control-label">配置城市：</label>
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
                                    state.cityOptionSavable ? state.cityOptionSaved ? (
                                        <button className="btn btn-default btn-xs" disabled={true}>已保存</button>
                                    ) : (
                                        <button className="btn btn-theme btn-xs" onClick={Action.saveCityOption}>保存城市设置</button>
                                    ) : (
                                        <button className="btn btn-default btn-xs" disabled={true}>保存城市设置</button>
                                    )
                                }
                            </Col>
                        </FormGroup>
                    )
                }
                <Row><Col xs='10' offset='1'><hr/></Col></Row>
                <FormGroup>
                    <label className="col-xs-2 control-label">预约时间：</label>
                    <Col xs="6">
                        <div className="form-inline">
                            <Input value={state.tempOptions.bookingTime} onChange={getDOMValue(Action.changeBookingTime)} />
                            <small className='text-muted'>
                                （单位：小时）
                            </small>
                        </div>
                    </Col>
                </FormGroup>
                <Row><Col xs='10' offset='1'><hr/></Col></Row>
                <FormGroup>
                    <label className="col-xs-2 control-label">上架设置：</label>
                    <Col xs="6">
                        <div className="form-inline">
                            <div className="checkbox">
                                <label>
                                    {'　　预售商品：'}
                                    <CheckBox checked={state.tempOptions.isPreSale} onChange={Action.changePreSaleStatus} />
                                </label>
                            </div>
                        </div>
                    </Col>
                </FormGroup>
                {
                    state.tempOptions.isPreSale
                    ? (<PreSaleOptions state={state} Action={Action} />)
                    : null
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
    render() {

        const { state, Action, citiesSelector } = this.props;

        if (state.basicDataLoadStatus === 'pending') {
            return (
                <div className="wrapper">加载中</div>
            );
        }

        return (
            <div className="wrapper">
                <TopHeader />
                <ul className="nav nav-tabs">
                    <li className="active">
                        <Anchor>新建商品</Anchor>
                    </li>
                </ul>
                <div className="panel" style={tabContentBoxStyle}>
                    <div className="panel-body">
                        <h3>{'　'}基本信息</h3>
                        <hr/>
                        <BasicOptions state={state} citiesSelectorState={citiesSelector} Action={Action} />
                        <p />
                        <h3>{'　'}城市配置</h3>
                        <hr/>
                        <CitiesOptions state={state} Action={Action} />
                        <hr/>
                        <div className="row">
                            <div className="col-xs-4 col-xs-offset-2">
                            {
                                state.citiesOptionApplyRange === 1 && [...state.citiesOptions.keys()].filter(x => x !== 'all').length === 0 ? (
                                    <button className="btn btn-default" disabled={true}>
                                        保存商品设置
                                    </button>
                                ) : (
                                    <button
                                        className="btn btn-theme"
                                        onClick={Action.saveOption}
                                    >
                                        保存商品设置
                                    </button>
                                )
                            }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    componentDidMount() {
        this.props.Action.loadBasicData();
    }

    componentDidUpdate() {
        const { state, Action } = this.props;

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
                icon: MessageBoxIcon.Success,
                text: '保存成功'
            }).then(
                Action.resetSaveStatus
            );
        }
    }
}

export default connect(
  ({ productSKUManagement, citiesSelector }) => ({ state: productSKUManagement, citiesSelector }),
  dispatch => ({ Action: bindActionCreators({...SkuAction, ...CitiesSelectorAction} ,dispatch) }),
)(Main);