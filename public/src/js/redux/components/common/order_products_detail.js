import React, {Component, PropTypes} from 'react';
import { tableLoader, get_table_empty } from 'common/loading';

function ProductRow(product){
  return (
    <tr key={product.sku_id}>
      <td>{product.name}</td>
      <td>￥{product.original_price/100} * {product.num}</td>
      <td>{product.size}</td>
      <td>{product.num}</td>
      <td>￥{product.discount_price/100}</td>
      <td>{product.choco_board}</td>
      <td>{product.greeting_card}</td>
      <td>{(product.atlas == 0 ? '不' : '') + '需要'}</td>
      <td>{product.custom_name}</td>
      <td>{product.custom_desc}</td>
    </tr>
  )
}

export default class OrderProductsDetail extends Component {
  render(){
    var products = this.props.products.map(function(n){
      return ProductRow(n);
    })
    return (
      <div className="table-responsive">
        <table className="table text-center">
          <thead>
          <tr>
            <th>产品名称</th>
            <th>原价</th>
            <th>规格</th>
            <th>数量</th>
            <th>实际售价</th>
            <th>巧克力牌</th>
            <th>祝福贺卡</th>
            <th>产品图册</th>
            <th>自由拼名称</th>
            <th>自由拼描述</th>
          </tr>
          </thead>
          <tbody>
            { tableLoader( this.props.loading , products ) }
          </tbody>
        </table>
      </div>
    )
  }
}

OrderProductsDetail.propTypess = {
  products: PropTypes.array.isRequired,
}