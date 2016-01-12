import React, { Component, PropTypes } from 'react';
import Select from 'common/select';
import NumberPicker from 'common/number_picker';
import Pagination from 'common/pagination';
import * as OrderProductsActions from 'actions/order_products';
import { SELECT_DEFAULT_VALUE } from 'config/app.config';
import { toFixed } from 'utils/index';

export default class ProductsModal extends Component {
  constructor(props){
    super(props);
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.state = {
      sku_name: '',
      category_id: SELECT_DEFAULT_VALUE,
      page_no: 0,
      page_size: 8,
    }
  }
  render(){
    var { all_categories, search_results: { total, list}, selected_list, dispatch } = this.props;
    var s = this.state;
    var product_list = list.map(function(n, i){
      return <ProductSet data={n} key={i} dispatch={dispatch} />;
    });
    var selected_list = selected_list.map(function(n, i){
      return <ProductSelectedRow data={n} key={n.sku_id} dispatch={dispatch} />;
    });
    return (
    <div ref="modal" aria-hidden="false" aria-labelledby="myModalLabel" role="dialog" className="modal fade" >
      <div className="modal-backdrop fade"></div>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <button onClick={this.onCancel} aria-hidden="true" data-dismiss="modal" className="close" type="button">×</button>
            <h4 className="modal-title">选择产品</h4>
          </div>
          <div className="modal-body">
            <div className="form-group form-inline">
              <input value={s.sku_name} onChange={this.handleSkuName.bind(this)} className="form-control input-xs" placeholder="输入产品名称" />
              {' '}
              <Select value={s.category_id} onChange={this.onCategoryChange.bind(this)} options={all_categories} default-text="选择产品分类" />
              {' '}
              <button onClick={this.search.bind(this)} className="btn btn-xs btn-default"><i className="fa fa-search"></i>{' 查询'}</button>
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
              page_no={s.page_no} 
              total_count={total} 
              page_size={s.page_size} 
              onPageChange={this.onPageChange.bind(this)}
            />

            <hr className="dotted" />

            <div>产品管理 >> 选择列表</div>
            <div className="table-responsive">
              <table className="table table-hover text-center">
                <thead>
                <tr>
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
                  { selected_list }
                </tbody>
              </table>
            </div>
          </div>
          <div className="modal-footer">
            <button onClick={this.onCancel} type="button" className="btn btn-sm btn-default" data-dismiss="modal">取消</button>
            <button onClick={this.onConfirm.bind(this)} type="button" className="btn btn-sm btn-theme">确定</button>
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
  onCancel(){
    this.props.dispatch(OrderProductsActions.cancelAllSelectedProducts());
  }
  onConfirm(){
    this.props.dispatch(OrderProductsActions.confirmAllSelectedProducts());
    this.hide();
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
    var { yes_or_no, choose } = this;
    var { active } = this.state;
    //is_local_site, is_delivery : "1" / "0"
    var { product_id, name, size, category_name, original_price, skus } = this.props.data;
    var hasOthers = skus.length != 1;

    var head = (
      <tr key={skus[0].sku_id} className={hasOthers ? "clickable" : ""} onClick={hasOthers ? this.toggle : null} >
        <td><input type="checkbox" checked={skus[0].checked} disabled /></td>
        <td>{name}</td>
        <td>{size}</td>
        <td>{category_name}</td>
        <td>{skus[0].website}</td>
        <td>￥{ toFixed(skus[0].discount_price / 100, 2) }</td>
        <td>{yes_or_no(skus[0].is_local_site)}</td>
        <td>{yes_or_no(skus[0].is_delivery)}</td>
        <td><a onClick={choose.bind(this, skus[0])} href="javascript:;">[选择]</a></td>
      </tr>
    );

    var body = skus.map((n, i) => {
      if(i == 0){  //滤出第一个
        return null;
      }
      return (
        <tr key={n.sku_id} className={active ? "" : "hidden"}>
          <td><input type="checkbox" checked={n.checked} disabled /></td>
          <td colSpan="3"></td>
          <td>{n.website}</td>
          <td>￥{ toFixed(n.discount_price / 100, 2) }</td>
          <td>{yes_or_no(n.is_local_site)}</td>
          <td>{yes_or_no(n.is_delivery)}</td>
          <td><a onClick={choose.bind(this, n)} href="javascript:;">[选择]</a></td>
        </tr>
      )
    });

    return (
      <tbody>
        {[head, body]}
      </tbody>
    )
  }
  yes_or_no(d){
    return d == 1 ? '是' : '否';
  }
  toggle(){
    this.setState({active: !this.state.active})
  }
  choose(sku, e){
    //整合数据
    var copy = {...this.props.data, ...sku};
    delete copy.skus;
    this.props.dispatch(OrderProductsActions.selectProduct(copy));
    e.stopPropagation();
  }
}
ProductSet.PropTypes = {
  data: PropTypes.array.isRequired,
  dispatch: PropTypes.func.isRequired,
}

class ProductSelectedRow extends Component {
  yes_or_no(d){
    return d == 1 ? '是' : '否';
  }
  render(){
    var { data } = this.props;
    var { yes_or_no } = this;
    return (
      <tr>
        <td>{data.name}</td>
        <td>{data.size}</td>
        <td>{data.category_name}</td>
        <td>{data.website}</td>
        <td>￥{toFixed(data.discount_price / 100, 2)}</td>
        <td><NumberPicker value={data.num} onChange={this.onNumChange.bind(this)} /></td>
        <td>{yes_or_no(data.is_local_site)}</td>
        <td>{yes_or_no(data.is_delivery)}</td>
        <td><a onClick={this.delete.bind(this)} href="javascript:;">[删除]</a></td>
      </tr>
    )
  }
  onNumChange(num){
    var { data: { sku_id }, dispatch } = this.props;
    dispatch(OrderProductsActions.changeProductNum(sku_id, num));
  }
  delete(){
    this.props.dispatch(OrderProductsActions.deleteProduct(this.props.data));
  }
}
ProductSelectedRow.PropTypes = {
  data: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
}