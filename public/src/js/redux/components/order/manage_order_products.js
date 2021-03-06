/**
 * form表单下面已添加进来的商品
 */
import React, {Component, PropTypes} from 'react';
import {render} from 'react-dom';
import ProductsModal from './manage_add_products_modal';
import {Noty} from 'utils/index';
import { setSelectProductStatus, deleteConfirmProduct } from 'actions/order_products';
import * as ProductsActions from 'actions/order_products';

export default class ManageAddProducts extends Component {
  constructor(props){
    super(props);
    this.state = {
      show_tips: false,
    };
    this.showTips = this.showTips.bind(this);
  }
  render(){
    var { confirm_list, dispatch } = this.props;
    var { showTips } = this;
    var list = confirm_list.map(function(n, i){
      return <AddedProductsRow key={n.sku_id + '' + i} data={n} dispatch={dispatch} showTips={showTips} />;
    });
    return (
      <div>
        <div className="form-group">
          选择产品：<button onClick={this.addProducts.bind(this)} className="btn btn-xs btn-theme">添加</button>
          {
            this.state.show_tips
             ? <span style={{marginLeft: 13}} className="text-warning small">* 修改金额后请注意之后的<strong> 金额 </strong>及<strong> 支付状态 </strong>是否正确！</span>
             : null
          }
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
  showTips(){
    this.setState({ show_tips: true });
  }
}

ManageAddProducts.propTypess = {
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
    var { sku_id, display_name, size, original_price, num,
      discount_price, amount, choco_board, greeting_card, atlas, custom_name, custom_desc } = this.props.data;
    return (
      <tr className="form-inline">
        <td>{display_name || '-'}</td>
        <td>{size}</td>
        <td>￥{original_price/100} * {num}</td>
        <td>{num}</td>
        <td>{editable 
          ? <input value={discount_price} onChange={handleChange.bind(this, 'discount_price')} className={edit_input_classname} style={{width: 50}} type="text" /> 
          : '￥' + discount_price}</td>
        <td>{editable 
          ? <input value={amount} onChange={handleChange.bind(this, 'amount')} className={edit_input_classname} style={{width: 50}} type="text" /> 
          : '￥' + amount}</td>
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
          {
            editable
            ? <a key="save" href="javascript:;">[保存]</a>
            : <a key="edit" onClick={this.edit.bind(this, true)} href="javascript:;" className={edit_input_classname}>[编辑]</a>
          }
          {' '}
          <a onClick={this.delete.bind(this, this.props.data)} href="javascript:;">[删除]</a>
        </td>
      </tr>
    )
  },
  handleChange(attr_name, e){
    var { value } = e.target;
    if(attr_name == 'discount_price' || attr_name == 'amount'){
      this.props.showTips();
    }
    if(attr_name === 'amount' || attr_name === 'discount_price'){
      value = value.replace(/[^\d\.]/g, '');
      if(attr_name === 'amount'){
        if(value > this.props.data.discount_price){
          Noty('warning', '应收金额不能大于实际售价');
          value = value.slice(0, -1);
        }
      }
    }
    this.props.dispatch(ProductsActions.productAttrChange({
      sku_id: this.props.data.sku_id,
      attr: {
        name: attr_name,
        value: e.target.getAttribute('type') == 'text' || e.target.nodeName.toLowerCase() == 'textarea'
          ? value
          : e.target.checked
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

AddedProductsRow.propTypess = {
  dispatch: PropTypes.func.isRequired,
  data: PropTypes.shape({
    name: PropTypes.string.isRequired,
    size: PropTypes.string.isRequired,
    original_price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    num: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    discount_price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
}