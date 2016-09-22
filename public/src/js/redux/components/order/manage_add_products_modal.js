import React, { Component, PropTypes } from 'react';
import Select from 'common/select';
import NumberPicker from 'common/number_picker';
import Pagination from 'common/pagination';
import SelectGroup from 'common/select_group';
import { get_table_empty } from 'common/loading';
import StdModal from 'common/std_modal';

import * as OrderProductsActions from 'actions/order_products';
import { SELECT_DEFAULT_VALUE } from 'config/app.config';
import { toFixed, dom } from 'utils/index';

export default class ProductsModal extends Component {
  constructor(props){
    super(props);
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.onConfirm = this.onConfirm.bind(this);
    this.state = {
      sku_name: '',
      category_id: SELECT_DEFAULT_VALUE,
      province_id: SELECT_DEFAULT_VALUE,
      city_id: SELECT_DEFAULT_VALUE,
      district_id: SELECT_DEFAULT_VALUE,
      page_size: 8,
    }
  }
  render(){
    //借用父组件的省份数据, 默认城市信息
    var { all_categories, search_results: { total, list, page_no }, selected_list, dispatch, area, area: {provinces}, cities, districts, add_form } = this.props;
    var s = this.state;
    //如果是默认省份，那就借用父组件的cities
    if( add_form.province_id && s.province_id == add_form.province_id.value ){
      cities = area.cities;
    }
    var product_list = list.map(function(n, i){
      return <ProductSet data={n} key={i} dispatch={dispatch} />;
    });
    var selected_list = selected_list.map(function(n, i){
      return <ProductSelectedRow data={n} key={n.sku_id + '' + i} dispatch={dispatch} />;
    });
    return (
    <StdModal ref="modal" title="选择产品" onConfirm={this.onConfirm} onCancel={this.onCancel} size="lg" >
      <div className="form-group form-inline">
        <input value={s.sku_name} onChange={this.handleSkuName.bind(this)} onKeyDown={this.handleEnterSearch.bind(this)} className="form-control input-xs" placeholder="输入产品名称" />
        {' '}
        <SelectGroup value={s.category_id} onChange={this.onCategoryChange.bind(this)} options={all_categories} default-text="选择产品分类" />
        {' '}
        <Select value={s.province_id} onChange={this.onProvinceChange.bind(this)} options={provinces} ref="province" default-text="选择省份" key="province"/>
        {' '}
        <Select value={s.city_id} onChange={this.onCityChange.bind(this)} options={cities} default-text="选择城市" ref="city" key="city"/>
        {' '}
        {
          (s.district_id == SELECT_DEFAULT_VALUE && districts.length) ||
          districts.some( d => d.id == s.district_id ) //说明该区县已单独开通了，则应该显示出来
            ? [
                <Select value={s.district_id} onChange={this.onDistrictChange.bind(this)} options={districts} default-text="选择区县" ref="district" key="district"/>,
                ' '
              ]
            : null
        }
        <button onClick={this.search.bind(this, 0)} className="btn btn-xs btn-default"><i className="fa fa-search"></i>{' 查询'}</button>
      </div>
      <div ref="tableWrapper" className="table-responsive table-modal modal-list">
        <table className="table table-hover table-bordered table-click text-center">
          <thead>
          <tr>
            <th></th>
            <th>产品名称</th>
            <th>规格</th>
            <th>产品类型名称</th>
            <th>所属城市</th>
            <th>所属网站</th>
            <th>价格</th>
            <th>是否本站产品</th>
            <th>是否配送上门</th>
            <th>管理操作</th>
          </tr>
          </thead>
          {product_list.length ? product_list : <tbody>{get_table_empty()}</tbody>}
        </table>
      </div>

      <Pagination 
        page_no={page_no} 
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
            <th>所属城市</th>
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
    </StdModal>
    )
  }
  handleSkuName(e){
    this.setState({ sku_name: e.target.value })
  }
  onCategoryChange(e){
    this.setState({ category_id: e.target.value })
  }
  onProvinceChange(e){
    var {value} = e.target;
    this.props.actions.resetCities();
    this.setState({ province_id: value, city_id: SELECT_DEFAULT_VALUE, district_id: SELECT_DEFAULT_VALUE });
    if(value != this.refs.province.props['default-value'])
      this.props.actions.getCitiesSignal({ province_id: value, is_standard_area: 1 });
  }
  onCityChange(e){
    var {value} = e.target;
    this.setState({city_id: value, district_id: SELECT_DEFAULT_VALUE });
    this.props.actions.resetDistricts();
    if(value != this.refs.city.props['default-value'])
      this.props.actions.getDistrictsAndCity( value );
  }
  onDistrictChange(e){
    var {value} = e.target;
    this.setState({district_id: value})
  }
  handleEnterSearch(e){
    if(e.target.value && e.which == 13){
      this.search(0);
    }
  }
  search(page){
    var { sku_name, category_id, city_id, district_id, page_size } = this.state;
    var unlock = dom.lock( this.refs.tableWrapper );
    var data = {
      name: sku_name.trim() || undefined, 
      page_no: page,
      page_size,
      category_id: category_id == SELECT_DEFAULT_VALUE ? undefined : category_id,
    };
    if(this.refs.district && district_id != SELECT_DEFAULT_VALUE){
      data.city_id = district_id;
    }else{
      data.city_id = ( city_id == SELECT_DEFAULT_VALUE ? undefined : city_id );
      data.is_standard_area = 1;
    }
    this.props.dispatch( OrderProductsActions.searchProducts(data) ).always(unlock);
  }
  onPageChange(page){
    this.search.call(this, page);
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
    var { add_form: { province_id, city_id, regionalism_id } } = this.props;
    city_id.value && this.props.actions.getDistrictsAndCity( city_id.value );
    this.setState({
      province_id: province_id.value || SELECT_DEFAULT_VALUE, 
      city_id: city_id.value || SELECT_DEFAULT_VALUE,
      district_id: regionalism_id.value || SELECT_DEFAULT_VALUE
    }, function(){
      this.refs.modal.show();
    }.bind(this))
  }
  hide(){
    this.refs.modal.hide();
  }
}

ProductsModal.propTypess = {
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
    var sku0 = skus[0];

    var head = (
      <tr key={sku0.sku_id} className={hasOthers ? "clickable" : ""} onClick={hasOthers ? this.toggle : null} >
        <td><input type="checkbox" checked={sku0.checked} onClick={choose.bind(this, sku0)} disabled={sku0.checked} /></td>
        <td>{name}</td>
        <td>{size}</td>
        <td>{category_name}</td>
        <td>{sku0.regionalism_name}</td>
        <td>{sku0.website}</td>
        <td>￥{ toFixed(sku0.discount_price / 100, 2) }</td>
        <td>{yes_or_no(sku0.is_local_site)}</td>
        <td>{yes_or_no(sku0.is_delivery)}</td>
        <td>
          {sku0.checked
            ? <span className="silver">[选择]</span>
            : <a onClick={choose.bind(this, sku0)} href="javascript:;">[选择]</a>}
        </td>
      </tr>
    );

    var body = skus.map((n, i) => {
      if(i == 0){  //滤出第一个
        return null;
      }
      return (
        <tr key={n.sku_id + '' + i} className={active ? "" : "hidden"}>
          <td><input type="checkbox" checked={n.checked} onClick={choose.bind(this, n)} disabled={n.checked} /></td>
          <td colSpan="3"></td>
          <td>{n.regionalism_name}</td>
          <td>{n.website}</td>
          <td>￥{ toFixed(n.discount_price / 100, 2) }</td>
          <td>{yes_or_no(n.is_local_site)}</td>
          <td>{yes_or_no(n.is_delivery)}</td>
          <td>
            {n.checked
              ? <span className="silver">[选择]</span>
              : <a onClick={choose.bind(this, n)} href="javascript:;">[选择]</a>}
          </td>
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
ProductSet.propTypess = {
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
        <td>{data.display_name}</td>
        <td>{data.size}</td>
        <td>{data.category_name}</td>
        <td>{data.regionalism_name}</td>
        <td>{data.website}</td>
        <td>￥{toFixed(data.discount_price / 100, 2)}</td>
        <td><NumberPicker value={data.num} onChange={this.onNumChange.bind(this)} /></td>
        <td>{yes_or_no(data.is_local_site)}</td>
        <td>{yes_or_no(data.is_delivery)}</td>
        <td><a onClick={this.delete.bind(this)} href="javascript:;">[ 删除 ]</a></td>
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
ProductSelectedRow.propTypess = {
  data: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
}