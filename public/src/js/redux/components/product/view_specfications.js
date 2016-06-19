import React, { Component } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Tooltip from 'common/tooltip2';

import actions from 'actions/product_view_specifications';

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

        this.state = {
            copyResult: 0 // 0:normal 1:done 2:fail
        }

        this.copyID = e => {
            const dom = document.getElementById('product-id');

            const range = document.createRange();
            range.selectNode(dom);

            const selection = document.getSelection();
            selection.empty()
            selection.addRange(range);

            var result = document.execCommand('copy');
            selection.empty()

            this.setState({
                copyResult: result ? 1 : 2
            });
        }

        this.handleReloadBasicData = this.handleReloadBasicData.bind(this);

        this.mouseLeaveHandler = e => {
            this.setState({
                copyResult: 0
            });
        }
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

        return (
            // 类名svs不能去掉
            <div className="svs">
                <Row>
                    <Col xs="12">
                        <Link to="/pm/sku_manage"><i className="fa fa-chevron-left"></i>&nbsp;返回搜索列表</Link>
                    </Col>
                </Row>
                <hr/>
                <Row>
                    <Col xs="4">
                        <label>产品名称：</label>
                        <span className="text-muted">芒果千层心蛋糕</span>
                    </Col>
                    <Col xs="4">
                        <label>商城购买：</label>
                        <span className="text-muted">是</span>
                    </Col>
                </Row>
                <Row>
                    <Col xs="4">
                        <label>所属城市：</label>
                        <span className="text-muted">广东省&nbsp;广州市&nbsp;花都</span>
                    </Col>
                    <Col xs="4">
                        <label>产品编码：</label>
                        <span id="product-id" className="text-muted">22179</span>
                        {'　'}
                        <Tooltip msg={this.state.copyResult === 0 ? '复制' : this.state.copyResult === 1 ? '复制成功! ' : '复制失败'}>
                            <a
                                href="javascript:;"
                                className="fa fa-clipboard copy-product-id"
                                onClick={this.copyID}
                                onMouseLeave={this.mouseLeaveHandler}
                            />
                        </Tooltip>
                    </Col>
                </Row>
                <hr/>
                <Row>
                    <Col xs="12">
                        <div className="panel">
                            <div className="panel-heading">规格列表</div>
                            <table className="table table-striped table-bordered">
                                <thead>
                                    <tr>
                                        <th>SKU编码</th>
                                        <th>渠道</th>
                                        <th>规格</th>
                                        <th>原价<br/>(人民币：元)</th>
                                        <th>渠道价格<br/>(人民币：元)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr><td>2111</td><td>商城</td><td>约2磅</td><td>168.00</td><td>168.00</td></tr>
                                    <tr><td>2111</td><td>商城</td><td>约2磅</td><td>168.00</td><td>168.00</td></tr>
                                    <tr><td>2111</td><td>商城</td><td>约2磅</td><td>168.00</td><td>168.00</td></tr>
                                    <tr><td>2111</td><td>商城</td><td>约2磅</td><td>168.00</td><td>168.00</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </Col>
                </Row>
            </div>
        )
    }

    componentDidMount() {
        this.handleReloadBasicData();
    }

    handleReloadBasicData() {
        this.props.Action.loadBasicData();
    }
}

export default connect(
    ({ productViewSpecifications }) => ({ state: productViewSpecifications }),
    dispatch => ({ Action: bindActionCreators(actions, dispatch) })
)(Main);