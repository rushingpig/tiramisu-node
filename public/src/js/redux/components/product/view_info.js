import React, { Component } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import getTopHeader from '../top_header';

import actions from 'actions/product_view_info';

const TextMuted = props => (<span className="text-muted" {...props} />);
const Row = props => (<div className="row" {...props} />);
const Col = props => {
  let className = '';

  if (props.xs)
    className += (' col-xs-' + props.xs);
  if (props.offset)
    className += (' col-xs-offset-' + props.offset);

  return (<div className={className.trim()} {...props} />);
}

const TopHeader = getTopHeader([{
  name: '产品管理',
  link: ''
}, {
  name: '搜索商品',
  link: '/pm/sku_manage'
}, {
  name: '查看商品详情',
  link: ''
}]);

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
        <TopHeader />
        <Row>
          <Col xs="4"><label>{'　　'}产品名称：</label><TextMuted>{state.productName}</TextMuted></Col>
        </Row>
        <Row>
          <Col xs="4">
            <label>{'　　'}商城展示名：</label>
            <TextMuted>{state.productDisplayName}</TextMuted>
          </Col>
          <Col xs="4">
            <label>{'　　'}商城购买：</label>
            <TextMuted>{state.canBuyInOfficialSite ? "是" : "否"}</TextMuted>
          </Col>
        </Row>
        <Row>
          <Col xs="4"><label>{'　　'}所属分类：</label><TextMuted>{state.productCategory.join(' / ')}</TextMuted></Col>
          <Col xs="4"><label>{'　　'}所属地区：</label><TextMuted>{state.position}</TextMuted></Col>
        </Row>
        <Row>
          <Col xs="4">
            <label>{'　　'}是否预售：</label>
            <TextMuted>
              {state.isPreSale ? ("是  ( " + (state.onSaleTime[0] || '∞') + ' ~ ' + (state.onSaleTime[1] || '∞') + ' )') : "否"}
            </TextMuted>
          </Col>
        </Row>
        <Row>
          <Col xs="4"><label>{'　　'}预约时间：</label><TextMuted>{state.bookingTime + ' 小时'}</TextMuted></Col>
        </Row>
        <Row>
          {
            state.hasSecondaryBookingTime ? (
              <Col xs="12">
                <label>第二预约时间：</label>
                <TextMuted>{state.secondaryBookingTime + ' 小时'}</TextMuted>
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
                <div className="panel">
                  <div className="panel-heading">选择渠道：</div>
                  <div className="list-group">
                    {
                      sourceSpecificationsKeys.map(sid => {
                        const isSelected = state.selectedSource === sid;
                        return (
                          <div
                            className={"list-group-item" + (isSelected ? ' active' : '')}
                            onClick={e => Action.changeSelectSource(sid)}
                            key={sid}
                          >
                            {
                              isSelected ? (
                                state.orderSource.get(sid)
                              ) : (
                                <a href="javascript:;">
                                  {state.orderSource.get(sid)}
                                </a>
                              )
                            }
                          </div>
                        )
                      })
                    }
                  </div>
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