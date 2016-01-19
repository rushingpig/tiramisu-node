import React, {Component, PropTypes} from 'react';
import {render} from 'react-dom';
import ProductsModal from './manage_add_products_modal';
import { setSelectProductStatus, deleteConfirmProduct } from 'actions/order_products';
import * as OrderManageFormActions from 'actions/order_manage_form';

export default class ManageAddProducts extends Component {
  render(){
    var { confirm_list, dispatch } = this.props;
    var list = confirm_list.map(function(n){
      return <AddedProductsRow key={n.sku_id} data={n} dispatch={dispatch} />;
    });
    return (
      <div>
        <div className="form-group">
          选择产品：<button onClick={this.addProducts.bind(this)} className="btn btn-xs btn-theme">添加</button>
        </div>
        <div className="table-responsive">
          <table className="table text-center">
            <thead>
            <tr>
              <th>产品名称</th>
              <th>规格</th>
              <th>原价</th>
              <th>数量</th>
              <th>实际售价</th>
              <th>应收金额</th>
              <th>巧克力牌</th>
              <th>祝福贺卡</th>
              <th>产品图册</th>
              <th>自定义名称</th>
              <th>自定义描述</th>
              <th>操作</th>
            </tr>
            </thead>
            <tbody>
              {list}
            </tbody>
          </table>
        </div>
        <ProductsModal ref="productsModal" {...this.props} />
      </div>
    )
  }
  addProducts(){
    this.refs.productsModal.show();
  }
}

ManageAddProducts.PropTypes = {
  products_choosing: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired
}

var AddedProductsRow = React.createClass({
  getInitialState: function() {
    return {
      editable: false,
      edit_input_classname: 'product-editable-form',
    };
  },
  render(){
    var { handleChange } = this;
    var { editable, edit_input_classname } = this.state;
    var { sku_id, name, size, original_price, num,
      discount_price, amount, choco_board, greeting_card, atlas, custom_name, custom_desc } = this.props.data;
    return (
      <tr className="form-inline">
        <td>{name}</td>
        <td>{size}</td>
        <td>{original_price/100}</td>
        <td>{num}</td>
        <td>{editable 
          ? <input value={discount_price} onChange={handleChange.bind(this, 'discount_price')} className={edit_input_classname} style={{width: 50}} type="text" /> 
          : discount_price}</td>
        <td>0</td>
        <td>{editable 
          ? <textarea value={choco_board} onChange={handleChange.bind(this, 'choco_board')} className={edit_input_classname} rows="2" cols="15"></textarea> 
          : choco_board}</td>
        <td>{editable 
          ? <textarea value={greeting_card} onChange={handleChange.bind(this, 'greeting_card')} className={edit_input_classname} rows="2" cols="15"></textarea> 
          : greeting_card}</td>
        <td><input checked={atlas} onChange={handleChange.bind(this, 'atlas')} disabled={!editable} className={edit_input_classname} type="checkbox" /></td>
        <td>{editable 
          ? <textarea value={custom_name} onChange={handleChange.bind(this, 'custom_name')} className={edit_input_classname} rows="2" cols="15"></textarea>
          : custom_name}</td>
        <td>{editable 
          ? <textarea value={custom_desc} onChange={handleChange.bind(this, 'custom_desc')} className={edit_input_classname} rows="2" cols="15"></textarea> 
          : custom_desc}</td>
        <td className="nowrap">
          <a onClick={this.edit.bind(this, true)} href="javascript:;">[编辑]</a>{' '}
          <a onClick={this.delete.bind(this, this.props.data)} href="javascript:;">[删除]</a>
        </td>
      </tr>
    )
  },
  handleChange(attr_name, e){
    this.props.dispatch(OrderManageFormActions.productAttrChange({
      sku_id: this.props.data.sku_id,
      attr: {
        name: attr_name,
        value: typeof e.target.checked == 'undefined' ? e.target.value : e.target.checked
      }
    }));
  },
  edit(editable){
    this.setState({ editable: !!editable });
  },
  delete(data){
    this.props.dispatch(deleteConfirmProduct(data));
  },
  componentDidMount(){
    var self = this;
    $('#app').on('click', this._close_edit);
  },
  _close_edit(e){
    if(!$(e.target).hasClass(this.state.edit_input_classname)){
      this.edit(false);
    }
  },
  componentWillUnmount(){
    $('#app').off('click', this._close_edit);
  },
});

AddedProductsRow.PropTypes = {
  dispatch: PropTypes.func.isRequired,
  data: PropTypes.shape({
    name: PropTypes.string.isRequired,
    size: PropTypes.string.isRequired,
    original_price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    num: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    discount_price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
}