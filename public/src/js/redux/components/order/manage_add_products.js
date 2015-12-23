import React, {Component, PropTypes} from 'react';
import {render} from 'react-dom';
import ProductsModal from './manage_add_products_modal';

export default class ManageAddProducts extends Component {
  render(){
    var { products_choosing, dispatch } = this.props;
    return (
      <div>
        <div className="form-group">
          选择产品：<button onClick={this.addProducts.bind(this)} className="btn btn-sm btn-theme">添加</button>
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
            <tr>
              <td>自由拼</td>
              <td>约2磅</td>
              <td>138</td>
              <td>1</td>
              <td>69</td>
              <td>0</td>
              <td>妈妈生日快乐</td>
              <td>生日快乐</td>
              <td><input type="checkbox" /></td>
              <td>单恋黑森林，榴莲香雪，梨子沙滩，夏日鲜果</td>
              <td>2磅1/4，方形</td>
              <td className="nowrap">
                <a href="javascript:;">[编辑]</a>{' '}<a href="javascript:;">[删除]</a>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
        <ProductsModal ref="productsModal" {...products_choosing} dispatch={dispatch} />
      </div>
    )
  }
  componentDidMount(){
    
  }
  addProducts(){
    //这里注意了
    this.refs.productsModal.show();
  }
}

ManageAddProducts.PropTypes = {
  products_choosing: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired
}