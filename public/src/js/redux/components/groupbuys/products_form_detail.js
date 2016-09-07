import React,{Component} from 'react';
import {findDOMNode} from 'react-dom';
import {connect} from 'react-redux';
import { bindActionCreators } from 'redux';

import LineRouter from 'common/line_router';

import ProductForm from './products_form';

import * as FormActions from 'actions/form';
import AreaActions from 'actions/area';
import * as GroupbuysProductsFormActions from 'actions/groupbuys/products_form';
import { getOrderSrcs } from 'actions/order_support';

class TopHeader extends Component{
	render() {
		var {editable} = this.props;
		var title = editable ? '编辑团购商品': '添加团购商品';
		return (
			<div className='clearfix top-header'>
				<LineRouter
					routes={[{name: '团购商品管理', link: '/gm/pd'}, {name: title, link: ''}]}
					className = 'pull-right'
					/>
			</div>
		)
	}
}

class ProductFormDetail extends Component{
	render(){
		return (
			<div>
				<TopHeader />
				<div className='panel'>
					<ProductForm {...this.props}/>
				</div>
			</div>
			)
	}
	componentDidMount(){
		this.props.actions.getOrderSrcs();
	}
}



function mapStateToProps(state){
  return state.groupbuysProductsFormManage;
}

function mapDispatchToProps(dispatch){
  return {
    actions:bindActionCreators({
      ...GroupbuysProductsFormActions,
      ...FormActions,
      ...AreaActions(),
    },dispatch)};
}

export default connect(mapStateToProps, mapDispatchToProps)(ProductFormDetail)