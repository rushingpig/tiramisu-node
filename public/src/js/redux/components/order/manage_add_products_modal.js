import React, { Component, PropTypes } from 'react';
import Select from '../common/select';
import NumberPicker from '../common/numberPicker';
import Pagination from '../common/pagination';
import * as OrderProductsActions from '../../actions/order_products';
import { SELECT_DEFAULT_VALUE } from '../../config/app.config';

export default class ProductsModal extends Component {
  constructor(props){
    super(props);
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
    this.state = {
      sku_name: '',
      category_id: SELECT_DEFAULT_VALUE,
      page_no: 0,
      page_size: 8,
    }
  }
  render(){
    var { all_categories, search_results: { total, list} } = this.props;
    var s = this.state;
    var product_list = list.map(function(n, i){
      return <ProductSet data={n} key={i} />;
    });
    return (
    <div ref="modal" aria-hidden="false" aria-labelledby="myModalLabel" role="dialog" className="modal fade" >
      <div className="modal-backdrop fade"></div>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <button aria-hidden="true" data-dismiss="modal" className="close" type="button">×</button>
            <h4 className="modal-title">选择产品</h4>
          </div>
          <div className="modal-body">
            <div className="form-group form-inline">
              <input value={s.sku_name} onChange={this.handleSkuName.bind(this)} className="form-control input-sm" placeholder="输入产品名称" />
              {' '}
              <Select value={s.category_id} onChange={this.onCategoryChange.bind(this)} options={all_categories} default-text="选择产品分类" />
              {' '}
              <button onClick={this.search.bind(this)} className="btn btn-sm btn-default"><i className="fa fa-search"></i>{' 查询'}</button>
            </div>
            <div className="table-responsive">
              <table className="table table-hover table-click text-center">
                <thead>
                <tr>
                  <th></th>
                  <th>产品名称</th>
                  <th>规格</th>
                  <th>产品类型名称</th>
                  <th>所属网站</th>
                  <th>价格</th>
                  <th>是否本站产品</th>
                  <th>是否配送上门</th>
                  <th>管理操作</th>
                </tr>
                </thead>
                {product_list}
              </table>
            </div>

            <Pagination 
              current_page={s.page_no} 
              total_count={total} 
              perpage_count={s.page_size} 
              onPageChange={this.onPageChange.bind(this)}
            />

            <hr className="dotted" />

            <div>产品管理 >> 选择列表</div>
            <div className="table-responsive">
              <table className="table table-hover text-center">
                <thead>
                <tr>
                  <th></th>
                  <th>产品名称</th>
                  <th>规格</th>
                  <th>产品类型名称</th>
                  <th>所属网站</th>
                  <th>价格</th>
                  <th>数量</th>
                  <th>是否本站</th>
                  <th>是否配送</th>
                  <th>管理操作</th>
                </tr>
                </thead>
                <tbody>
                
                </tbody>
              </table>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-default" data-dismiss="modal">取消</button>
            <button type="button" className="btn btn-theme">确定</button>
          </div>
        </div>
      </div>
    </div>
    )
  }
  handleSkuName(e){
    this.setState({ sku_name: e.target.value })
  }
  onCategoryChange(e){
    this.setState({ category_id: e.target.value })
  }
  search(){
    var { sku_name, category_id, page_no, page_size } = this.state;
    this.props.dispatch(
      OrderProductsActions.searchProducts({
        sku_name, page_no, page_size,
        category_id: category_id == SELECT_DEFAULT_VALUE ? undefined : category_id
      })
    );
  }
  onPageChange(page){
    this.setState({ page_no: page })
  }
  show(){
    this.props.dispatch(OrderProductsActions.getCategories());
    $(this.refs.modal).modal('show');
  }
  hide(){
    $(this.refs.modal).modal('hide');
  }
}

ProductsModal.PropTypes = {
  dispatch: PropTypes.func.isRequired,
  all_categories: PropTypes.array.isRequired,
  search_results: PropTypes.array.isRequired,
}

class ProductSet extends Component {
  constructor(props){
    super(props);
    this.toggle = this.toggle.bind(this);
    this.state = {
      active: false
    }
  }
  render(){
    var { data } = this.props;
    var { yes_or_no, choose } = this;
    var { active } = this.state;
    //is_local_site, is_delivery : "1" / "0"
    var content = [];
    data.forEach((n, i) => {
      let { name, size, website, price, is_local_site, is_delivery,    skus = [] } = n;
      let head = (
        <tr key={i} className={"clickable"} onClick={this.toggle} >
          <td><input className="fade" type="checkbox" checked={n.check} disabled /></td>
          <td>{name}</td>
          <td>{size}</td>
          <td>蛋糕配件</td>
          <td>{website}</td>
          <td>￥{price}</td>
          <td>yes_or_no(is_local_site)</td>
          <td>yes_or_no(is_delivery)</td>
          <td><a onClick={choose.bind(this, n)} href="javascript:;">[选择]</a></td>
        </tr>
      );

      let body = n.skus.map(function(n, i){
        <tr key={i} className={active ? "" : "hidden"} onClick={this.toggle} >
          <td><input type="checkbox" checked={n.check} disabled /></td>
          <td colSpan="3"></td>
          <td>{website}</td>
          <td>￥{price}</td>
          <td>yes_or_no(is_local_site)</td>
          <td>yes_or_no(is_delivery)</td>
          <td><a onClick={choose.bind(this, n)} href="javascript:;">[选择]</a></td>
        </tr>
      });

      content.concat(head, body);
    })
    return (
      <tbody>
        {content}
      </tbody>
    )
  }
  yes_or_no(d){
    return d == 1 ? '是' : '否';
  }
  toggle(){
    this.setState({active: !this.state.active})
  }
}
ProductSet.PropTypes = {
  data: PropTypes.array.isRequired
}