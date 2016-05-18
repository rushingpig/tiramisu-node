import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import MessageBox, { MessageBoxIcon, MessageBoxType } from 'common/message_box';
import DatePicker from 'common/datepicker';
import Pagination from 'common/pagination';
import getTopHeader from '../top_header';

import actions from 'actions/product_sku_search';

const CheckBox = props => (<input type="checkbox" {...props}/>);
const Select = props => (<select className="form-control input-xs" {...props} />);
const Input = props => (<input type="text" className="form-control input-xs" {...props}/>);

const getDOMValue = func => (event, ...args) => func.apply(undefined, [event.currentTarget.value, ...args]);
const Anchor = props => (<a style={{textDecoration:'underline'}} href="javascript:;" {...props} />);

class Main extends Component {
    constructor(props) {
        super(props);

        this.handleDeleteSelectedRow = this.handleDeleteSelectedRow.bind(this);
    }

    render() {
        const { Action, state } = this.props;

        if (state.basicDataLoadStatus === 'pending') {
            return (
                <div className="wrapper">
                    基础数据加载中……
                </div>
            )
        }

        if (state.basicDataLoadStatus === 'failed') {
            return (
                <div className="wrapper">
                    基础数据加载失败
                </div>
            )
        }

        return (
            <div className="wrapper">
                <div className="form-inline">
                    按名称搜索：
                    <input
                        type="text"
                        className="form-control input-xs"
                        placeholder="产品名称"
                        onChange={getDOMValue(Action.changeSearchProductName)}
                        value={state.searchProductName}
                    />
                    {'　'}
                    <button className="btn btn-theme btn-xs" onClick={e => Action.searchWithProductName(0)}>搜索</button>
                </div>
                <p />
                <div className="form-inline">
                    按条件搜索：上线时间：
                    <DatePicker
                        value={state.searchBeginTime}
                        upperLimit={state.noEndTimeLimit ? '2099-12-31' : state.searchEndTime}
                        onChange={Action.changeSearchBeginTime}
                    />
                    {'　'}
                    {
                        state.noEndTimeLimit ? (
                            <div style={{display:'inline'}}>
                                下线时间：
                                <Input value='∞' disabled={true} />
                                {'　'}
                            </div>
                        ) : (
                            <div style={{display:'inline'}}>
                                下线时间：
                                <DatePicker
                                    value={state.searchEndTime}
                                    lowerLimit={state.searchBeginTime}
                                    onChange={Action.changeSearchEndTime}
                                />
                                {'　'}
                            </div>
                        )
                    }
                    无下线时间：
                    <CheckBox checked={state.noEndTimeLimit} onChange={Action.changeNoEndTimeLimit} />
                    <p />
                    {'　　　　　　'}
                    分类：
                    <Select
                        value={state.selectedPrimaryCategory}
                        onChange={getDOMValue(Action.changeSelectPrimaryCategory)}
                    >
                        {
                            state.categoriesList.map(c => {
                                if (c.parent_id !== 0)
                                    return null;

                                return (<option key={c.id} value={c.id} >{c.name}</option>);
                            })
                        }
                    </Select>
                    {'　'}
                    <Select
                        value={state.selectedSecondaryCategory}
                        onChange={getDOMValue(Action.changeSelectSecondaryCategory)}
                    >
                        {
                            [
                                (<option value="0" key="all">全部二级分类</option>),
                                ...state.categoriesList.map(c => {
                                    if (c.parent_id === state.selectedPrimaryCategory) {
                                        return (<option key={c.id} value={c.id} >{c.name}</option>);
                                    }

                                    return null;
                                })
                            ]
                        }
                    </Select>
                    {'　'}
                    位置：
                    <Select value={state.selectedProvince} onChange={getDOMValue(Action.changeSelectProvince)}>
                        {
                            state.provincesList.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))
                        }
                    </Select>
                    {'　'}
                    <Select value={state.selectedCity} onChange={getDOMValue(Action.changeSelectCity)}>
                        {
                            [
                                (<option value="0" key="all">全部城市</option>),
                                ...state.citiesList[state.selectedProvince].map(c => (
                                    <option value={c.id} key={c.id}>{c.name}</option>
                                ))
                            ]
                        }
                    </Select>
                    <p />
                    {'　　　　　　'}
                    已上线：
                    <CheckBox checked={state.searchIsEvent} onChange={Action.changeSearchActiveStatus} />
                    {'　'}
                    促销：
                    <CheckBox checked={state.searchHasActive} onChange={Action.changeSearchIsEventStatus} />
                    {'　'}
                    <button className="btn btn-theme btn-xs" onClick={e => Action.searchWithFilter(0)}>搜索</button>
                </div>
                <hr/>
                <div className="panel">
                    <div className="panel-heading">
                        搜索结果：
                    </div>
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th>
                                    <CheckBox
                                        checked={state.searchResult.length > 0 && state.searchResult.length === state.checkedRow.size}
                                        onChange={Action.selectAllRow}
                                        disabled={state.searchResult.length === 0}
                                    />
                                </th>
                                <th>产品编码</th><th>名称</th>
                                <th>出售价格</th><th>分类</th>
                                <th>上线时间段</th><th>商城上线</th>
                                <th>预约时间</th><th>是否促销</th>
                                <th>城市</th><th>操作</th>
                            </tr>
                        </thead>
                        <tbody> 
                            {
                                state.searchResult.map((row, i) => {
                                    return (
                                        <tr key={i}>
                                            <td><CheckBox checked={state.checkedRow.has(i)} onChange={e => Action.selectRow(i)} /></td>
                                            <td>{row.spu}</td>
                                            <td><Anchor>{row.name}</Anchor></td>
                                            <td>{'¥ '}{row.price}</td>
                                            <td>
                                                <span className="text-primary">{row.primary_cate_name}</span><br/>
                                                <span className="text-muted">{row.secondary_cate_name}</span>
                                            </td>
                                            <td>
                                                {row.start_time || '-'}<br/>{row.end_time === null ? '∞' : row.end_time}
                                            </td>
                                            <td>
                                                {
                                                    row.isMall ? (
                                                        <span className="text-primary">是</span>
                                                    ) : (
                                                        <span className="text-primary">否</span>
                                                    )
                                                }
                                            </td>
                                            <td>
                                                {row.book_time + ' 小时'}
                                            </td>
                                            <td>
                                                {
                                                    row.isActivity ? (
                                                        <span className="text-primary">是</span>
                                                    ) : (
                                                        <span className="text-primary">否</span>
                                                    )
                                                }
                                            </td>
                                            <td>
                                                <span className="text-primary">{row.province_name}</span>
                                                <br/>
                                                {row.city_name}
                                            </td>
                                            <td>
                                                <Anchor>[产看]</Anchor>{'　'}
                                                <Anchor>[规格&价格]</Anchor>{'　'}
                                                <Anchor>[编辑]</Anchor>{'　'}
                                                <Anchor>[删除]</Anchor>
                                            </td>
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    </table>
                    <div className="panel-body">
                        <hr/>
                        {
                            state.checkedRow.size === 0 ? (
                                <button className="btn btn-default btn-xs" disabled={true}>
                                    <i className="fa fa-times fa-fw" />
                                    {' '}
                                    删除
                                </button>
                            ) : (
                                <button className="btn btn-danger btn-xs" onClick={this.handleDeleteSelectedRow}>
                                    <i className="fa fa-times fa-fw" />
                                    {' '}
                                    删除
                                </button>
                            )
                        }
                        <Pagination
                            page_no={state.pageNum}
                            total_count={state.totalItem}
                            page_size={state.pageSize}
                            onPageChange={
                                page => Action[state.searchWithProductName ? 'searchWithProductName' : 'searchWithFilter'](page, true)
                            }
                        />
                    </div>
                </div>
            </div>
        );
    }

    componentDidMount() {
        this.props.Action.loadBasicData()
    }

    componentDidUpdate() {
        if (this.props.state.deleteStatus === 'failed') {
            return MessageBox({
                icon: MessageBoxIcon.Error,
                text: '删除失败'
            }).then(
                x => this.props.Action.deleteSelectedRow(true),
                e => e
            )
        }
    }

    handleDeleteSelectedRow() {
        MessageBox({
          title: "确认删除",
          btnType: MessageBoxType.OKCancel,
          icon: MessageBoxIcon.Warning,
          text: "请确认是否删除当前商品，其类目下的其它相对应的渠道的 SKU 也将一并删除下线"
        }).then(
            x => this.props.Action.deleteSelectedRow(),
            e => e
        )
    }
}

export default connect(
    ({ productSKUSearch }) => ({ state: productSKUSearch }),
    dispatch => ({ Action: bindActionCreators(actions, dispatch) })
)(Main);