import React, {Component} from 'react';
import DateRangePicker from '../common/dateRangePicker';
import Select from '../common/select';
import Pagination from '../common/pagination';

export default class ManagePannel extends Component {
  constructor(props){
    super(props);
    this.state = {
      current_page: 2
    };
  }
  render(){
    return (
      <div className="order-manage">

        <div className="clearfix top-header">
          <button className="btn btn-theme pull-left">添加订单</button>
          <div className="pull-right line-router">
            <span className="node">总订单页面</span>
            <span>{'　/　'}</span>
            <span className="node active">处理页面</span>
          </div>
        </div>
        <div className="panel search">
          <div className="panel-body form-inline">
            <div className="search-input inline-block">
              <input className="form-control input-sm" placeholder="关键字" />
              <i className="fa fa-search"></i>
            </div>
            {' 时间'}
            <DateRangePicker />
            <Select className="space"/>
            <Select className="space"/>
            <Select className="space"/>
            <Select className="space"/>
            <button className="btn btn-theme btn-sm"><i className="fa fa-search"></i></button>
          </div>
        </div>


        <div className="panel">
          <header className="panel-heading">订单列表</header>
          <div className="panel-body">
            <div className="table-responsive">
              <table className="table text-center">
                <thead>
                <tr>
                  <th>操作管理</th>
                  <th>商户订单</th>
                  <th>订单号</th>
                  <th>下单人</th>
                  <th>下单时间</th>
                  <th>收货人信息</th>
                  <th>配送方式</th>
                  <th>订单来源</th>
                  <th>支付状态</th>
                  <th>总金额</th>
                  <th>订单状态</th>
                  <th>配送站</th>
                  <th>送达时间</th>
                  <th>是否提交</th>
                  <th>是否处理</th>
                  <th>所属城市</th>
                  <th>取消理由</th>
                  <th>备注</th>
                  <th>操作人</th>
                  <th>创建人</th>
                  <th>操作时间</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                  <td></td>
                  <td>700025</td>
                  <td>2342342343242424</td>
                  <td>蝴蝶<br />11122223333</td>
                  <td><div className="time">2015-12-10<br />10:10:05</div></td>
                  <td className="text-left">
                    姓名：蝴蝶<br />
                    电话：11122223333<br />
                    <div className="address-detail-td">
                      <span className="inline-block">地址：</span><span className="address-all">广东省深圳市福田区xxxxxxxxx</span>
                    </div>
                    建筑：中兴通讯
                  </td>
                  <td>陪送上门</td>
                  <td className="nowrap">第三方预约<br /><span className="bordered">大众点评网</span></td>
                  <td><strong className="strong">货到付款</strong></td>
                  <td className="nowrap">
                    总金额：xxxx <br />
                    应收：xxxx
                  </td>
                  <td><div className="bg-success round">已分配<br />配送站</div></td>
                  <td>车公庙配送中心</td>
                  <td><div className="time">2015-12-10<br />10:10:10</div></td>
                  <td>是</td>
                  <td>是</td>
                  <td>深圳</td>
                  <td></td>
                  <td><div className="remark-in-table">车公庙车公庙车公庙车公庙车公庙车公庙</div></td>
                  <td>蝴蝶</td>
                  <td>蝴蝶</td>
                  <td><div className="time">2015-12-10<br/>10:10:05<br/><a href="#">操作记录</a></div></td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>

           <Pagination 
              current_page={this.state.current_page} 
              total_count={25} 
              perpage_count={10} 
              onPageChange={this.onPageChange}
            />
        </div>
      </div>
    )
  }
  onPageChange(page){
    this.setState({current_page: page});
  }
}
