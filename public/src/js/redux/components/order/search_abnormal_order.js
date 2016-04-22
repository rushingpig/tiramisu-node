import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { ABNORMAL_TYPE } from 'config/app.config';

import DatePicker from 'common/datepicker';
import Pagination from 'common/pagination';

import getTopHeader   from '../top_header';

import Actions from 'actions/order_abnormal';

const TopHeader = getTopHeader([{name: '订单管理', link: ''}, {name: '错误订单管理', link: ''}]);

const FormInline = props => <div className="form-inline" {...props} />

const Anchor = props => {
  if (props.disabled) {
  return (<a href="javascript:;" disabled={true} style={{cursor:'not-allowed',color:'#aaa'}}>{props.children}</a>);
  }

  return (<a href="javascript:;" {...props} />);
};

const Select = props => (
  <select className="form-control input-xs" {...props} />
);

const Button = props => (
  <button className="btn btn-theme btn-xs" {...props} />
);

const warpLine = timeString => (
  <span>
    {timeString.slice(0, 10)}
    <br/>
    {timeString.slice(11, 19)}
  </span>
);

class Main extends Component {

  constructor(props) {
    super(props);

    this.componentDidMount      = this.componentDidMount.bind(this);
    this.handleChangeBeginTime    = this.handleChangeBeginTime.bind(this);
    this.handleChangeEndTime    = this.handleChangeEndTime.bind(this);
    this.handleChangeFilter     = this.handleChangeFilter.bind(this);
    this.handleChangeDealStatus   = this.handleChangeDealStatus.bind(this);
    this.handlePageChange       = this.handlePageChange.bind(this);
    this.handleChangeMerchantFilter = this.handleChangeMerchantFilter.bind(this);

    this.state = {};
  }

  render() {

    const that = this;
    const { props } = that;
    const { state } = props;
    const componentState = that.state;

    const { searchFilter } = state;

    return (
      <div className="wrapper">
        <TopHeader />
        <hr/>
        <FormInline>
          {'　'}
          外部编号：
          <input
            type="text"
            className="form-control
            input-xs"
            autoFocus={true}
            onChange={this.handleChangeMerchantFilter}
            ref='merchantFilter'
          />
          {'　'}
          <Button onClick={() => props.searchWithID()}>
            搜索
          </Button>
        </FormInline>
        <p />
        <FormInline>
          按条件搜索：
          <DatePicker
            value={searchFilter.beginTime}
            upperLimit={searchFilter.endTime}
            data-filter="beginTime"
            onChange={this.handleChangeBeginTime}
          />
          {'　'}
          <DatePicker
            value={searchFilter.endTime}
            lowerLimit={searchFilter.beginTime}
            data-filter="endTime"
            onChange={this.handleChangeEndTime}
          />
          {'　'}
          渠道：
          <Select data-filter="orderSource" value={searchFilter.orderSource} onChange={this.handleChangeFilter}>
            {
              state.orderSourceList.map(source => (
                <option value={source.id} key={source.id}>{source.name}</option>
              ))
            }
          </Select>
          {'　'}
          <div className="checkbox">
            <label>
              处理情况：
              <Select data-filter="isDeal" onChange={this.handleChangeFilter}>
                <option value="0">全部</option>
                <option value="1">已处理</option>
                <option value="2">未处理</option>
              </Select>
            </label>
          </div>
          {'　'}
          异常类型：
          <Select data-filter="abnormalType" value={searchFilter.abnormalType} onChange={this.handleChangeFilter}>
            {
              [
                (<option value='0' key='0'>全部</option>),
                ...Object.keys(ABNORMAL_TYPE).map(key => (
                  <option value={key} key={key}>{ABNORMAL_TYPE[key]}</option>
                ))
              ]
            }
          </Select>
          {'　'}
          <Button onClick={() => props.searchWithFilter()}>
            搜索
          </Button>
        </FormInline>
        <hr/>
        <div className="panel">
          <div className="panel-heading">
            搜索结果
          </div>
          <table className="table table-bordered table-hover">
            <thead>
              <tr>
                <th>渠道名称</th>
                <th>外部编号</th>
                <th>本站下单日期</th>
                <th>异常原因</th>
                <th>异常分类</th>
                <th>已处理</th>
                <th>操作人</th>
                <th>操作时间</th>
              </tr>
            </thead>
            <tbody>
              {
                state.searchResult.map((row, i) => (
                  <tr key={i}>
                    <td>{row.sourceName}</td>
                    <td>{row.merchantId}</td>
                    <td>{warpLine(row.createTime)}</td>
                    <td>{row.detail}</td>
                    <td>{ABNORMAL_TYPE[row.abnormalType]}</td>
                    <td>
                      <input
                        type="checkbox"
                        checked={row.isDeal ? true : false}
                        data-index={row.index}
                        data-merchant-id={row.merchantId}
                        data-order-source={row.orderSource}
                        onChange={this.handleChangeDealStatus}
                      />
                    </td>
                    <td>{row.updater}</td>
                    <td>{warpLine(row.updateTime)}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
        <div className="panel-footer">
          <Pagination
            page_no={state.pageNumber}
            total_count={state.totalItem}
            page_size={state.pageSize}
            onPageChange={this.handlePageChange}
          />
        </div>
      </div>
    );
  }

  componentDidMount() {
    this.props.searchWithFilter();
  }

  handleChangeBeginTime(time) {
    this.props.changeFilter('beginTime', time);
  }

  handleChangeEndTime(time) {
    this.props.changeFilter('endTime', time);
  }

  handleChangeFilter(event) {
    const dom = event.currentTarget;
    this.props.changeFilter(dom.dataset.filter, dom.value);
  }

  handleChangeDealStatus(event) {

    const dom = event.currentTarget;
    const { dataset } = event.currentTarget;

    this.props.changeDealStatus(
      dataset.index,
      dataset.merchantId,
      dataset.orderSource,
      event.currentTarget.checked
    );
  }

  handlePageChange(pageNum) {
    const { props } = this;

    props.state.searchWithID
    ? props.searchWithID(pageNum)
    : props.searchWithFilter(pageNum)
  }

  handleChangeMerchantFilter() {
    const value = this.refs.merchantFilter.value.trim();

    if (value !== '')
      this.props.changeFilter('merchantId', value);
  }

}

const mapStateToProps  = ({ orderAbnormal }) => ({ state: orderAbnormal });
const mapDispatchToProps = dispatch => bindActionCreators(Actions, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Main);