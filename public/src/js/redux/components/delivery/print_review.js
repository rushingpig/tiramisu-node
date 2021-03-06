import React, {Component, PropTypes} from 'react';
import { render } from 'react-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import LinkedStateMixin from 'react-addons-linked-state-mixin';
import { reduxForm } from 'redux-form';

import DatePicker from 'common/datepicker';
import Select from 'common/select';
import Pagination from 'common/pagination';
import StdModal from 'common/std_modal';
import SearchInput from 'common/search_input';
import RadioGroup from 'common/radio_group';
import { tableLoader } from 'common/loading';

import { Noty, dateFormat } from 'utils/index';
import { DELIVERY_MAP, PRINT_REVIEW_STATUS } from 'config/app.config';
import history from 'history_instance';
import LazyLoad from 'utils/lazy_load';
import V from 'utils/acl';

import * as OrderActions from 'actions/orders';
import * as DeliverPrintReviewActions from 'actions/delivery_print_review';

import getTopHeader from '../top_header';

const TopHeader = getTopHeader([{name: '送货单管理', link: '/dm/change'}, {name: '打印审核', link: ''}]);

class FilterHeader extends Component {
  constructor(props){
    super(props);
    this.state = {
      search_ing: false,
      search_by_keywords_ing: false,
    }
  }
  render(){
    var { 
      fields: {
        keywords,
        begin_time,
        end_time,
        is_reprint,
        status,
      },
      yes_or_no, all_review_status } = this.props;
    var { search_ing, search_by_keywords_ing } = this.state;
    return (
      <div className="panel search">
        <div className="panel-body form-inline">
          <SearchInput {...keywords} searchHandler={this.search.bind(this, 'search_by_keywords_ing')} searching={search_by_keywords_ing} className="form-inline v-mg" placeholder="订单号或申请人" />
          {' 开始时间'}
          <DatePicker redux-form={begin_time} editable className="short-input" />
          {' 结束时间'}
          <DatePicker redux-form={end_time} editable className="short-input space-right" />
          <Select {...is_reprint} options={yes_or_no} default-text="是否打印" className="space-right"/>
          <Select {...status} options={all_review_status} default-text="选择审核状态" className="space-right"/>

          <button disabled={search_ing} data-submitting={search_ing} onClick={this.search.bind(this, 'search_ing')} className="btn btn-theme btn-xs">
            <i className="fa fa-search"></i>{' 搜索'}
          </button>
        </div>
      </div>
    )
  }
  search(search_in_state){
    this.setState({[search_in_state]: true});
    this.props.search(0)
      .always(()=>{
        this.setState({[search_in_state]: false});
      });
  }
}
FilterHeader = reduxForm({
  form: 'print_review',
  fields: [
    'keywords',
    'begin_time',
    'end_time',
    'is_reprint',
    'status',
  ]
}, state => {
  var now = dateFormat(new Date());
  return {
    //赋初始值
    initialValues: {
      begin_time: now,
      end_time: now,
    }
  }
})( FilterHeader );

class ReviewRow extends Component {
  render(){
    var { props = {} } = this;
    return (
      <tr>
        <td>{props.order_id}</td>
        <td>{props.applicant_name}</td>
        <td>{props.applicant_mobile}</td>
        <td>{props.apply_time}</td>
        <td>{props.apply_reason}</td>
        <td>{props.validate_code}</td>
        <td>{props.audit_opinion}</td>
        <td>{props.audit_time}</td>
        <td>{props.auditor}</td>
        <td>{PRINT_REVIEW_STATUS[props.status]}</td>
        <td>{props.reprint_time}</td>
        <td>
          {
            V('DeliveryManagePrintReviewReview')
            ?
            (props.status != 'AUDITED'
              ? [<a key="review" onClick={this.reviewHandler.bind(this)} href="javascript:;" className="nowrap">[审核]</a>, <br key="br"/>]
              : null)
            :null
          }
        </td>
      </tr>
    )
  }
  reviewHandler(){
    this.props.showReviewModal(this.props);
  }
}

class DeliverPrintReviewPannel extends Component {
  constructor(props){
    super(props);
    this.state = {
      page_size: 10,
      review_order: {},
    }
    this.showReviewModal = this.showReviewModal.bind(this);
    this.search = this.search.bind(this);
  }
  render(){
    var { showReviewModal, search } = this;
    var { filter, reviewPrintApply, main: { loading, refresh, page_no, total, list, submitting } } = this.props;

    var content = list.map((n, i) => {
      return <ReviewRow key={n.apply_id} {...{...n, showReviewModal}} />;
    })
    return (
      <div className="order-manage">

        <TopHeader />
        <FilterHeader {...{...filter, search}} />

        <div className="panel">
          <header className="panel-heading">送货列表</header>
          <div className="panel-body">
            <div className="table-responsive">
              <table className="table table-hover text-center">
                <thead>
                <tr>
                  <th>订单号</th>
                  <th>申请人</th>
                  <th>申请人电话</th>
                  <th>申请时间</th>
                  <th>申请理由</th>
                  <th>验证码</th>
                  <th>审核意见</th>
                  <th>审核时间</th>
                  <th>审核人</th>
                  <th>审核状态</th>
                  <th>打印时间</th>
                  <th>管理操作</th>
                </tr>
                </thead>
                <tbody>
                { tableLoader( loading || refresh, content ) }
                </tbody>
              </table>
            </div>

            <Pagination 
              page_no={page_no} 
              total_count={total} 
              page_size={this.state.page_size} 
              onPageChange={this.onPageChange.bind(this)}
            />
          </div>
        </div>

        <ReviewModal {...{data: this.state.review_order, reviewPrintApply, submitting, callback: search}} ref="ReviewModal" />
      </div>
    )
  }
  showReviewModal(n){
    this.setState({review_order: n}, this.refs.ReviewModal.show());
  }
  onPageChange(page){
    this.search(page);
  }
  componentDidMount() {
    this.search();

    LazyLoad('noty');
  }
  search(page){
    var { getPrintReviewList, main } = this.props;
    page = typeof page == 'undefined' ? main.page_no : page;
    return getPrintReviewList({page_no: page, page_size: this.state.page_size});
  }

}

function mapStateToProps({deliveryPrintReview}){
  return deliveryPrintReview;
}

/* 这里可以使用 bindActionCreators , 也可以直接写在 connect 的第二个参数里面（一个对象) */
function mapDispatchToProps(dispatch){
  return bindActionCreators({...OrderActions, ...DeliverPrintReviewActions}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(DeliverPrintReviewPannel);


/***************   *******   *****************/
/***************   子模态框   *****************/
/***************   *******   *****************/

var ReviewModal = React.createClass({
  propTypes: {
    data: PropTypes.object.isRequired,
    reviewPrintApply: PropTypes.func.isRequired,
    submitting: PropTypes.bool.isRequired,
  },
  getInitialState: function() {
    return {
      radios: [{value: 'AUDITED', text: '是'}, {value: 'AUDITFAILED', text: '否'}],
      audit_opinion: '',
      status: 'AUDITED',
    };
  },
  render: function(){
    var { submitting } = this.props;
    return (
      <StdModal onConfirm={this.onConfirm} onCancel={this.hideCallback} submitting={submitting} size="sm" ref="modal" title="审核打印申请">
        <div className="pl-50">
          <div className="form-group form-inline">
            <label>{'　订单编号：'}</label>
            <span>{` ${this.props.data.order_id}`}</span>
          </div>
          <div className="form-group form-inline">
            <label>{'　审核意见：'}</label>
            <textarea valueLink={this.linkState('audit_opinion')} placeholder="非必填" cols="25" rows="2" className="form-control input-xs"></textarea>
          </div>
          <div className="form-group form-inline">
            <label>{'　是否通过：'}</label>
            <RadioGroup 
              radios={this.state.radios} 
              value={this.state.status} 
              className="inline-block"
              name="review_status"
              onChange={this.onStatusChange} />
          </div>
          <div className="form-group form-inline">
            <label>{'申请人手机：'}</label>
            <span>{` ${this.props.data.applicant_mobile}`}</span>
          </div>
        </div>
      </StdModal>
    )
  },
  onStatusChange: function(value){
    this.setState({ status: value })
  },
  mixins: [ LinkedStateMixin ],
  show: function(){
    this.refs.modal.show();
  },
  hideCallback: function(){
    this.setState(this.getInitialState());
  },
  onConfirm: function(){
    var { apply_id, applicant_mobile, order_id } = this.props.data;
    var { status, audit_opinion } = this.state;
    this.props.reviewPrintApply(apply_id, { applicant_mobile, order_id, status, audit_opinion })
      .done(function(){
        this.refs.modal.hide();
        this.props.callback();
      }.bind(this))
      .fail(function(msg){
        Noty('error', msg || '网络繁忙，请稍后再试');
      })
  },
});