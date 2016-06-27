import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Link } from 'react-router';

import V from 'utils/acl';
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

const TopHeader = getTopHeader([{name: '产品管理', link: ''}, {name: '搜索商品', link: '/pm/sku_manage'}]);

const showDeleteConfirm = () => MessageBox({
    title: "确认删除",
    btnType: MessageBoxType.OKCancel,
    icon: MessageBoxIcon.Warning,
    text: "请确认是否删除当前商品，其类目下的其它相对应的渠道的 SKU 也将一并删除下线"
});

class Main extends Component {
    constructor(props) {
        super(props);

        this.handleDeleteSelectedRow = this.handleDeleteSelectedRow.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleDeleteSingleRow = this.handleDeleteSingleRow.bind(this);
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
                <TopHeader />
                <div className="form-inline">
                    按名称搜索：
                    <input
                        type="text"
                        className="form-control input-xs"
                        placeholder="产品名称"
                        onChange={getDOMValue(Action.changeSearchProductName)}
                        onKeyPress={this.handleKeyPress}
                        value={state.searchProductName}
                    />
                    &nbsp;
                    <button className="btn btn-theme btn-xs" onClick={e => Action.searchWithProductName(0)}>搜索</button>
                    {'　'}
                    <span className="text-muted">条件搜索会包含产品名称</span>
                </div>
                <p />
                <div className="form-inline">
                    按条件搜索：上线时间&nbsp;
                    <DatePicker
                        style={{width: 80}}
                        value={state.searchBeginTime}
                        upperLimit={state.noEndTimeLimit ? '2099-12-31' : state.searchEndTime}
                        onChange={Action.changeSearchBeginTime}
                    />
                    &nbsp;
                    {
                        state.noEndTimeLimit ? (
                            <div style={{display:'inline'}}>
                                下线时间&nbsp;
                                <Input value='∞' disabled={true} style={{width: 74}} />
                                &nbsp;
                            </div>
                        ) : (
                            <div style={{display:'inline'}}>
                                下线时间&nbsp;
                                <DatePicker
                                    style={{width: 74}}
                                    value={state.searchEndTime}
                                    lowerLimit={state.searchBeginTime}
                                    onChange={Action.changeSearchEndTime}
                                />
                                &nbsp;
                            </div>
                        )
                    }
                    无下线时间：
                    <CheckBox checked={state.noEndTimeLimit} onChange={Action.changeNoEndTimeLimit} />
                    &nbsp;
                    <Select
                        value={state.selectedPrimaryCategory}
                        onChange={getDOMValue(Action.changeSelectPrimaryCategory)}
                    >
                        {
                            [
                                (<option value="0" key="all">全部一级分类</option>),
                                ...state.categoriesList.map(c => {
                                    if (c.parent_id !== 0)
                                        return null;

                                    return (<option key={c.id} value={c.id} >{c.name}</option>);
                                })
                            ]
                        }
                    </Select>
                    &nbsp;
                    <Select
                        value={state.selectedSecondaryCategory}
                        onChange={getDOMValue(Action.changeSelectSecondaryCategory)}
                    >
                        {
                            [
                                (<option value="0" key="all">全部二级分类</option>),
                                ...state.selectedPrimaryCategory === 0 ? [] : state.categoriesList.map(c => {
                                    if (c.parent_id === state.selectedPrimaryCategory) {
                                        return (<option key={c.id} value={c.id} >{c.name}</option>);
                                    }

                                    return null;
                                })
                            ]
                        }
                    </Select>
                    &nbsp;
                    <Select value={state.selectedProvince} onChange={getDOMValue(Action.changeSelectProvince)}>
                        {
                            [
                                (<option value="0" key="all">全部省份</option>),
                                ...state.provincesList.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))
                            ]
                        }
                    </Select>
                    &nbsp;
                    <Select value={state.selectedCity} onChange={getDOMValue(Action.changeSelectCity)}>
                        {
                            [
                                (<option value="0" key="all">全部城市</option>),
                                ...state.selectedProvince === 0 ? [] : state.citiesList[state.selectedProvince].map(c => (
                                    <option value={c.id} key={c.id}>{c.name}</option>
                                ))
                            ]
                        }
                    </Select>
                    &nbsp;
                    已上线：
                    <CheckBox checked={state.searchIsEvent} onChange={Action.changeSearchActiveStatus} />
                    &nbsp;
                    促销：
                    <CheckBox checked={state.searchHasActive} onChange={Action.changeSearchIsEventStatus} />
                    &nbsp;
                    <button className="btn btn-theme btn-xs" onClick={e => Action.searchWithFilter(0)}>搜索</button>
                </div>
                <hr/>
                <div className="panel">
                    <div className="panel-heading">
                        <p>
                            搜索结果：
                            <span className="pull-right">
                                {
                                    V("ProductionManageAdd") ? (
                                        <Link to="/pm/sku_manage/add" className="btn btn-xs btn-success">
                                            <i className="fa fa-plus fa-fw" />
                                            {' '}
                                            新建商品
                                        </Link>
                                    ) : null
                                }
                            </span>
                        </p>
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
                                            <td>{'¥ '}{(row.price/100).toFixed(2)}</td>
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
                                                <Link style={{textDecoration:'underline'}} to={"/pm/sku_manage/view/info/" + row.city_id + '/' + row.spu}>[查看]</Link>
                                                {'　'}
                                                <Link style={{textDecoration:'underline'}} to={"/pm/sku_manage/view/specfications/" + row.city_id + '/' + row.spu}>[规格&价格]</Link>
                                                {'　'}
                                                <Link style={{textDecoration:'underline'}} to={"/pm/sku_manage/edit/" + row.spu}>[编辑]</Link>
                                                {'　'}
                                                <Anchor data-index={i} onClick={this.handleDeleteSingleRow}>[删除]</Anchor>
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
                            state.checkedRow.size > 0 ? (
                                <button className="btn btn-default btn-xs" onClick={Action.deselectAllRow}>
                                    <i className="fa fa-times-circle fa-fw" />
                                    {' '}
                                    全不选
                                </button>
                            ) : (
                                <button className="btn btn-default btn-xs" disabled={true}>
                                    <i className="fa fa-times-circle fa-fw" />
                                    {' '}
                                    全不选
                                </button>
                            )
                        }
                        &nbsp;
                        {
                            state.checkedRow.size > 0 ? (
                                <button className="btn btn-danger btn-xs" onClick={this.handleDeleteSelectedRow}>
                                    <i className="fa fa-times fa-fw" />
                                    {' '}
                                    删除
                                </button>
                            ) : (
                                <button className="btn btn-default btn-xs" disabled={true}>
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
        if (this.props.state.basicDataLoadStatus === 'success')
            return;

        this.props.Action.loadBasicData()
    }

    componentDidUpdate() {
        if (this.props.state.deleteStatus === 'failed') {
            return MessageBox({
                icon: MessageBoxIcon.Error,
                text: '删除失败'
            }).then(
                x => this.props.Action.deleteRow(true),
                e => e
            )
        }
    }

    handleKeyPress(event) {
        if (event.key === 'Enter') {
            this.props.Action.searchWithProductName(0)
        }
    }

    handleDeleteSelectedRow() {
        showDeleteConfirm().then(
            x => this.props.Action.deleteRow(false, true),
            e => e
        );
    }

    handleDeleteSingleRow(event) {
        const deleteIndex = Number(event.currentTarget.dataset.index);

        showDeleteConfirm().then(
            () => this.props.Action.deleteRow(false, false, deleteIndex),
            e => e
        );
    }
}

export default connect(
    ({ productSKUSearch }) => ({ state: productSKUSearch }),
    dispatch => ({ Action: bindActionCreators(actions, dispatch) })
)(Main);