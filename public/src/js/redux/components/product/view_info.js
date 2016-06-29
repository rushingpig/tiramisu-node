import React, { Component } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import actions from 'actions/product_view_info';

const Row = props => (<div className="row" {...props} />);
const Col = props => {
    let className = '';

    if (props.xs)
        className += (' col-xs-' + props.xs);
    if (props.offset)
        className += (' col-xs-offset-' + props.offset);

    return (<div className={className.trim()} {...props} />);
}

class Main extends Component {
    constructor(props) {
        super(props);

        this.handleReloadBasicData = this.handleReloadBasicData.bind(this);
    }

    render() {

        const { Action, state } = this.props;

        if (state.basicDataLoadStatus === 'pending') {
            return (
                <div>
                    基础数据加载中……
                </div>
            )
        }

        if (state.basicDataLoadStatus === 'failed') {
            return (
                <div>
                    基础数据加载失败
                    <p></p>
                    原因：{state.failedMsg}
                    <p></p>
                    <a href="javascript:;" onClick={this.handleReloadBasicData}>点这里重新加载</a>
                </div>
            )
        }

        const sourceSpecificationsKeys = [...state.sourceSpecifications.keys()]; 

        return (
            <div>
                <Row>
                    <Col xs="12">
                        <Link to="/pm/sku_manage"><i className="fa fa-chevron-left"></i>&nbsp;返回搜索列表</Link>
                    </Col>
                </Row>
                <hr/>
                <Row>
                    <Col xs="4"><label>{'　　'}产品名称：</label><span className="text-muted">{state.productName}</span></Col>
                    <Col xs="4">
                        <label>{'　　'}商城购买：</label>
                        <span className="text-muted">{state.canBuyInOfficialSite ? "是" : "否"}</span>
                    </Col>
                </Row>
                <Row>
                    <Col xs="4"><label>{'　　'}所属分类：</label><span className="text-muted">{state.productCategory.join(' / ')}</span></Col>
                    <Col xs="4"><label>{'　　'}所属地区：</label><span className="text-muted">{state.position}</span></Col>
                </Row>
                <Row>
                    <Col xs="4"><label>{'　　'}是否预售：</label><span className="text-muted">{state.isPreSale ? "是" : "否"}</span></Col>
                </Row>
                <Row>
                    <Col xs="4"><label>{'　　'}预约时间：</label><span className="text-muted">{state.bookingTime + ' 小时'}</span></Col>
                </Row>
                <Row>
                    {
                        state.hasSecondaryBookingTime ? (
                            <Col xs="12">
                                <label>第二预约时间：</label>
                                <span className="text-muted">{state.secondaryBookingTime + ' 小时'}</span>
                                <i className="text-muted">{'（' + state.secondaryBookingTimeDistricts.join(',') + '）'}</i>
                            </Col>
                        ) : undefined
                    }
                </Row>
                {
                    state.shopSpecifications.length === 0 ? undefined : [(
                        <hr key="hr" />
                    ), (
                        <Row key='Row'>
                            <Col xs="12">
                                <div className="panel">
                                    <div className="panel-heading">
                                        商城规格
                                    </div>
                                    <table className="table table-bordered table-striped">
                                        <thead>
                                            <tr>
                                                <th>规格</th>
                                                <th>原价 (RMB)</th>
                                                <th>价格 (RMB)</th>
                                                <th>促销</th>
                                                <th>活动价格</th>
                                                <th>活动时间</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                state.shopSpecifications.map((ss, i) => (
                                                    <tr key={i}>
                                                        <td>{ss.spec}</td>
                                                        <td>{(ss.originalCost/100).toFixed(2)}</td>
                                                        <td>{(ss.cost/100).toFixed(2)}</td>
                                                        <td>{ss.hasEvent ? (<i className="fa fa-check text-success" />) : '-'}</td>
                                                        <td>{ss.hasEvent ? (ss.eventCost/100).toFixed(2) : '-'}</td>
                                                        <td>{ss.hasEvent ? (ss.eventTime[0] + ' ~ ' + ss.eventTime[1]) : '-'}</td>
                                                    </tr>
                                                ))
                                            }
                                            {
                                                [...state.sourceSpecifications.values()].map((ssArr, i) => (
                                                    ssArr.map((ss, j) => (
                                                        <tr key={i + '' + j}>
                                                            <td>{ss.spec}</td>
                                                            <td>-</td>
                                                            <td>-</td>
                                                            <td>{(ss.cost/100).toFixed(2)}</td>
                                                            <td>-</td>
                                                            <td>-</td>
                                                            <td>-</td>
                                                        </tr>
                                                    ))
                                                ))
                                            }
                                        </tbody>
                                    </table>
                                </div>
                            </Col>
                        </Row>
                    )]
                }
                {
                    sourceSpecificationsKeys.length === 0 ? undefined : [(
                        <hr key="hr" />
                    ), (
                        <Row key="Row">
                            <Col xs="3">
                                <div className="list-group">
                                    {
                                        sourceSpecificationsKeys.map(sid => {
                                            const isSelected = state.selectedSource === sid;
                                            return (
                                                <div className={"list-group-item" + (isSelected ? ' active' : '')} key={sid}>
                                                    {
                                                        isSelected ? (
                                                            state.orderSource.get(sid)
                                                        ) : (
                                                            <a href="javascript:;" onClick={e => Action.changeSelectSource(sid)}>
                                                                {state.orderSource.get(sid)}
                                                            </a>
                                                        )
                                                    }
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                            </Col>
                            <Col xs="6">
                                <div className="panel">
                                    <div className="panel-heading">渠道规格：</div>
                                    <table className="table table-bordered table-striped">
                                        <thead>
                                            <tr>
                                                <th>规格</th>
                                                <th>价格</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                state.sourceSpecifications.get(state.selectedSource).map(
                                                    (ss, i) => (
                                                        <tr key={state.selectedSource + '@' + i}>
                                                            <td>{ss.spec}</td>
                                                            <td>{(ss.cost/100).toFixed(2)}</td>
                                                        </tr>
                                                    )
                                                )
                                            }
                                        </tbody>
                                    </table>
                                </div>
                            </Col>
                        </Row>
                    )]
                }
            </div>
        )
    }

    componentDidMount() {
        this.handleReloadBasicData();
    }

    handleReloadBasicData() {
        const { Action, params } = this.props;

        Action.loadBasicData(params.cityId, params.productId);
    }
}

export default connect(
    ({ productViewInfo }) => ({ state: productViewInfo }),
    dispatch => ({ Action: bindActionCreators(actions, dispatch) })
)(Main);