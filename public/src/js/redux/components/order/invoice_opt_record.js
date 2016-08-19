import React from 'react';
import StdModal from 'common/std_modal.js';
import { tableLoader, get_table_empty } from 'common/loading';
import Pagination from 'common/pagination.js';
import { colour } from 'utils/index';

var OperationRecordModal = React.createClass({
  getInitialState() {
    return {
      sort_type: 'DESC', //ASC
      page_size: 8,
      data: {},
    };
  },
  render(){
    var { order_id, owner_mobile, owner_name } = this.state.data;
    var { page_no, total, list, loading } = this.props;
    var content = list.map( (n, i) => {
      return (
        <tr key={n.order_id + '' + i}>
          <td>{n.created_by}</td>
          <td className="text-left">{colour(n.option)}</td>
          <td>{n.created_time}</td>
        </tr>
      )
    })
    return (
      <StdModal title="操作历史记录" footer={false} ref="modal" onCancel={this.hideCallback}>
        <div className="">
          <label>订单号：</label>
          {order_id}
        </div>
        <div className="form-group">
          <label>下单人信息：</label>
          {owner_name + '　' + owner_mobile}
        </div>
        <div className="table-responsive">
          <table className="table table-hover table-bordered text-left">
            <thead>
            <tr>
              <th>操作人</th>
              <th>操作记录</th>
              <th className={`sorting ${this.state.sort_type.toLowerCase()}`} onClick={this.changeSortType}>操作时间</th>
            </tr>
            </thead>
            <tbody>
            { tableLoader( loading, content ) }
            </tbody>
          </table>
        </div>

        <Pagination 
          page_no={page_no} 
          total_count={total} 
          page_size={this.state.page_size} 
          onPageChange={this.onPageChange}
        />
      </StdModal>
    )
  },
  changeSortType(){
    if(this.state.sort_type == 'DESC')
      this.setState({ sort_type: 'ASC' }, this.search.bind(this, this.props.page_no))
    else
      this.setState({ sort_type: 'DESC' }, this.search.bind(this, this.props.page_no))
  },
  onPageChange(page){
    this.search(page);
  },
  search(page_no){
    var { page_size, sort_type } = this.state;
    this.props.getOrderOptRecord(this.state.data.id, {
      page_no: page_no,
      page_size,
      sort_type
    });
  },
  show(data){
    this.refs.modal.show();
    this.setState({ data }, function(){
      this.search(this.props.page_no);
    });
  },
  hideCallback(){
    this.props.resetOrderOptRecord();
  },
});

export default OperationRecordModal;