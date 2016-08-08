/**
 * 商品对应对应官网上的内容设置
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Link } from 'react-router';

import MessageBox, { MessageBoxIcon, MessageBoxType } from 'common/message_box';
import DropDownMenu from 'common/dropdown';
import getTopHeader from '../top_header';
import LazyLoad from 'utils/lazy_load';

import Actions from 'actions/product_sku_website_manage';

const FormHorizontal = props => (<div className="form-horizontal" {...props} />)
const FormGroup = props => (<div className="form-group" {...props} />);
const Input = props => (<input type="number" className="form-control input-xs" {...props} />);
const CheckBox = props => (<input type="checkbox" {...props} />);
const Radio = props => (<input type="radio" {...props} />);
const Row = props => (<div className="row" {...props} />);
const Panel = props => (
  <div className="panel" style={{boxShadow: 'none', border: '1px solid #F3F3F3'}}>
    <div className="panel-body">
      {props.children}
    </div>
  </div>
)

const TopHeader = getTopHeader([{
  name: '产品管理',
  link: ''
}, {
  name: '搜索商品',
  link: '/pm/sku_manage'
}, {
  name: '商品官网设置',
  link: ''
}]);

class ApplicationRange extends Component {
  render(){
    return (
      <FormGroup>
        <lable className="title">应用范围：</lable>
        <label className="ml-20"><Radio name="city" /> 全部一致</label>
        <label className="ml-20"><Radio name="city" /> 独立城市配置</label>
      </FormGroup>
    )
  }
}


const tabContentBoxStyle = {
  borderTopLeftRadius: 0,
  borderTopRightRadius: 0,
  border: 'solid 1px #ddd',
  borderTop: 'none',
  boxShadow: 'none'
}

class Main extends Component {
  constructor(props) {
    super(props);
  }

  render() {

    const { params: {productId} } = this.props;

    return (
      <div className="wrapper">
        <TopHeader />
        <ul className="nav nav-tabs">
          <li>
            <Link to={`/pm/sku_manage/edit/${productId}`}>编辑商品</Link>
          </li>
          <li className="active">
            <a href="javascript:;">商品品官网设置</a>
          </li>
        </ul>
        <div className="panel" style={tabContentBoxStyle}>
          <div className="panel-body">
            <Panel>
              <ApplicationRange />
            </Panel>
          </div>
        </div>
      </div>
    );
  }

  componentDidMount() {
    
  }

}

export default connect(
  ({
    productSKUWebsiteManagement,
  }) => ({
    ...productSKUWebsiteManagement,
  }),
  dispatch => ({
    ...bindActionCreators(Actions, dispatch),
  }),
)(Main);