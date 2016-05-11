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
                            <input
                                type="radio"
                                name="inlineRadioOptions"
                                value="0"
                                onChange={getDOMValue(Action.changeBuyEntry)}
                                checked={state.buyEntry === 0}
                            />
                              {' 商城可购买'}
                            </label>
                            {'　　'}
                            <label className="radio-inline">
                            <input
                                type="radio"
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
                              <input
                                type="radio"
                                name="aaa"
                                value="0"
                                onChange={getDOMValue(Action.changeActiveCitiesOption)}
                                checked={state.activeCitiesOption === 0}
                            />
                                {' 所有已开通城市'}
                            </label>
                            {'　　'}
                            <label className="radio-inline">
                            <input
                                type="radio"
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

        return (
            <div>
                <Row>
                    <Col xs="10" offset="2">
                        <div className="form-inline">
                            预售上架时间：
                            <DateTimeRangePicker
                                className="form-control input-xs"
                                style={pickerStyle}
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
                                onChange={Action.changeDeliveryTime}
                            />
                        </div>
                    </Col>
                </Row>
                <p />
                <Row>
                    <Col xs="10" offset="2">
                        <div className="form-inline">
                            {'　　'}预约时间：<Input onChange={getDOMValue(Action.changeBookingTime)} />
                        </div>
                    </Col>
                </Row>
                <p />
                <Row><Col xs="8" offset="2"><hr/></Col>
                </Row>
                <Row>
                    <Col xs="10" offset="2">
                        <div className="form-inline">
                            <div className="checkbox">
                                <label>
                                    {'第二预约时间：'}
                                    <input type="checkbox" />
                                </label>
                            </div>
                        </div>
                    </Col>
                </Row>
                <p />
                <Row>
                    <Col xs="10" offset="2">
                        <div className="form-inline">{'　　　　'}时间：<Input /></div>
                    </Col>
                </Row>
                <p />
                <Row>
                    <Col xs="10" offset="2">
                        <div className="form-inline">
                            {'　　　　'}
                            区域：
                            <label><input type="checkbox" />{' '}{'南山区'}{'　'}</label>
                            <label><input type="checkbox" />{' '}{'南山区'}{'　'}</label>
                        </div>
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
                                                        defautlValue={detail.spec}
                                                        onChange={getSpecInputValue(index, Action.changeShopSpecifications)}
                                                    />
                                                </center>
                                            </td>
                                            <td>
                                                <center>
                                                    <Input
                                                        style={inputStyle}
                                                        defautlValue={detail.originalCost}
                                                        onChange={getSpecInputValue(index, Action.changeShopSpecificationsOriginalCost)}
                                                    />
                                                </center>
                                            </td>
                                            <td>
                                                <center>
                                                    <Input
                                                        style={inputStyle}
                                                        defautlValue={detail.cost}
                                                        onChange={getSpecInputValue(index, Action.changeShopSpecificationsCost)}
                                                    />
                                                </center>
                                            </td>
                                            <td>
                                                <center>
                                                    <input
                                                        type="checkbox"
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
                                                                defautlValue={detail.eventCost}
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
                                                                onChange={(b, e) => Action.changeShopSpecificationsEventTime(index, b, e)}
                                                            />
                                                        </center>
                                                    </td>
                                                )] : (<td colSpan='2'>-</td>)
                                            }
                                            <td>
                                                <center>
                                                    <button
                                                        className="btn btn-danger btn-xs"
                                                        onClick={e => Action.removeShopSpecifications(index)}
                                                    >
                                                        ×
                                                    </button>
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
                            <input
                                type="radio"
                                name="citiesOptionApplyRange"
                                value="0"
                                onChange={getDOMValue(Action.changeCitiesOptionApplyRange)}
                                checked={state.citiesOptionApplyRange === 0}
                            />
                                {' 全部一致'}
                            </label>
                            {'　　'}
                            <label className="radio-inline">
                            <input
                                type="radio"
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
                            </Col>
                        </FormGroup>
                    )
                }
                <Col xs='10' offset='1'><hr/></Col>
                <FormGroup>
                    <label className="col-xs-2 control-label">上架设置：</label>
                    <Col xs="6">
                        <div className="form-inline">
                            <div className="checkbox">
                                <label>
                                    {'　　预售商品：'}
                                    <input type="checkbox" checked={state.tempOptions.isPreSale} onChange={Action.changePreSaleStatus} />
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
                <Col xs='10' offset='1'><hr/></Col>
                <SourceOptions Action={Action} state={state} />
                <Col xs="8" offset="2">
                    <button className="btn btn-default btn-xs">保存城市设置</button>
                </Col>
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
                                        <Anchor
                                            key={sid}
                                            className={"list-group-item" + (tempOptions.selectedSource === sid ? ' active' : '')}
                                            onClick={e => Action.changeSelectedSource(sid)}
                                        >
                                            {state.orderSource.get(sid)}
                                        </Anchor>
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
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    (!sourceSpecification || sourceSpecification.length === 0) ? (
                                        <tr>
                                            <td colSpan="2">没有规格</td>
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
                    <li className="active"><a href="#">Home</a></li>
                    <li><a href="#">Profile</a></li>
                    <li><a href="#">Messages</a></li>
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
                    </div>
                </div>
            </div>
        );
    }

    componentDidMount() {
        this.props.Action.loadBasicData();
    }
}

export default connect(
  ({ productSKUManagement, citiesSelector }) => ({ state: productSKUManagement, citiesSelector }),
  dispatch => ({ Action: bindActionCreators({...SkuAction, ...CitiesSelectorAction} ,dispatch) }),
)(Main);