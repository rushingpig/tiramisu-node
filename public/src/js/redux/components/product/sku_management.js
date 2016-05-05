import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import MessageBox, { MessageBoxIcon } from 'common/message_box';
import CitiesSelector from 'common/cities_selector';
import DropDownMenu from 'common/dropdown';
import getTopHeader from '../top_header';

import SkuAction from 'actions/product_sku_management';
import CitiesSelectorAction from 'actions/cities_selector';

const TopHeader = getTopHeader([{name: '产品管理', link: ''}, {name: '添加商品', link: '/pm/sku_manage/add'}]);

const FormHorizontal = props => (<div className="form-horizontal" {...props} />)
const FormGroup = props => (<div className="form-group" {...props} />);
const Input = props => (<input type="text" className="form-control input-xs" {...props} />);
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
};

const getDOMValue = func => (event, ...args) => func.apply(undefined, [event.currentTarget.value, ...args]);

class BasicOptions extends Component {
    constructor(props) {
        super(props);

        this.handleToggleCitiesSelector = this.handleToggleCitiesSelector.bind(this);

        this.state = {
            showCitiesSelector: false
        }
    }

    render() {

        const { state, Action } = this.props;

        return (
            <FormHorizontal>
                <FormGroup>
                    <label className="col-xs-2 control-label">商品名称：</label>
                    <Col xs="4">
                        <Input autoFocus={true} onChange={getDOMValue(Action.changeProductName)} value={state.productName} />
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
                    <label className="col-xs-2 control-label">商品原价：</label>
                    <Col xs="4">
                        <Input onChange={getDOMValue(Action.changeOriginalPrice)} defaultValue='1' type="number" />
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
                                <CitiesSelector state={state} Action={Action} />
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
                            预售上架时间：<Input />{'　至　'}<Input />
                        </div>
                    </Col>
                </Row>
                <p />
                <Row>
                    <Col xs="10" offset="2">
                        <div className="form-inline">
                            预售发货时间：<Input />{'　至　'}<Input />
                        </div>
                    </Col>
                </Row>
                <p />
                <Row>
                    <Col xs="10" offset="2">
                        <div className="form-inline">
                            {'　　'}预约时间：<Input />
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
                                <th>价格</th>
                                <th>促销</th>
                                <th>活动价格</th>
                                <th>活动时间</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><center><Input style={{width:70}} defaultValue="2磅" /></center></td>
                                <td><center><Input style={{width:70}} defaultValue="99.00" /></center></td>
                                <td><input type="checkbox"/></td>
                                <td><center><Input style={{width:70}} defaultValue="99.00" /></center></td>
                                <td>
                                    <div className="form-inline">
                                        <Input style={{width:130,textAlign:'center'}} defaultValue="2016-04-03 00:00:00" />
                                        {' 至 '}
                                        <Input style={{width:130,textAlign:'center'}} defaultValue="2016-04-03 00:00:00" />
                                    </div>
                                </td>
                                <td><button className="btn btn-xs btn-danger">{'×'}</button></td>
                            </tr>
                            <tr>
                                <td><center><Input style={{width:70}} defaultValue="2磅" /></center></td>
                                <td><center><Input style={{width:70}} defaultValue="99.00" /></center></td>
                                <td><input type="checkbox"/></td>
                                <td><center><Input style={{width:70}} defaultValue="99.00" /></center></td>
                                <td>
                                    <div className="form-inline">
                                        <Input style={{width:130,textAlign:'center'}} defaultValue="2016-04-03 00:00:00" />
                                        {' 至 '}
                                        <Input style={{width:130,textAlign:'center'}} defaultValue="2016-04-03 00:00:00" />
                                    </div>
                                </td>
                                <td><button className="btn btn-xs btn-danger">{'×'}</button></td>
                            </tr>
                        </tbody>
                    </table>
                    <p />
                    <button className="btn btn-xs btn-default">新增规格</button>
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
                                <label>{'　　预售商品：'}<input type="checkbox" checked={state.tempOptions.isPreSale} onChange={Action.changePreSaleStatus} /></label>
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
                    state.buyEntry === 0
                    ? [( <Col key="hr" xs='10' offset='1'><hr/></Col> ), ( <ShopSpecificationsOptions key="ShopSpecificationsOptions" /> )]
                    : null
                }
                <Col xs='10' offset='1'><hr/></Col>
                <FormGroup>
                    <label className="col-xs-2 control-label">渠道设置：</label>
                    <Col xs="2">
                        <div className="list-group">
                            <Anchor className="list-group-item">美团外卖</Anchor>
                            <Anchor className="list-group-item">美团外卖</Anchor>
                            <Anchor className="list-group-item">美团外卖</Anchor>
                            <Anchor className="list-group-item">美团外卖</Anchor>
                            <Anchor className="list-group-item">美团外卖</Anchor>
                            <div className="list-group-item"><input type="text" className="form-control input-xs"/></div>
                        </div>
                    </Col>
                    <Col xs="5">
                        <div className="panel">
                            <div className="panel-heading">
                                <div className="panel-title">
                                    渠道规格
                                    <small>
                                        <span className="pull-right">
                                            <button className="btn btn-xs btn-default">新增规格</button>
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
                                    <tr><td><Input></Input></td><td><Input></Input></td></tr>
                                    <tr><td><Input></Input></td><td><Input></Input></td></tr>
                                    <tr><td><Input></Input></td><td><Input></Input></td></tr>
                                </tbody>
                            </table>
                        </div>
                    </Col>
                </FormGroup>
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

class Main extends Component {
    render() {

        const { state, Action } = this.props;

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
                        <BasicOptions state={state} Action={Action} />
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