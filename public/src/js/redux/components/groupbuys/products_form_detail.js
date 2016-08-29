import React,{Component} from 'react';
import {findDOMNode} from 'react-dom';
import {connect} from 'react-redux';
import { bindActionCreators } from 'redux';

import LineRouter from 'common/line_router';

import ProductForm from './products_form';

import * as FormActions from 'actions/form';

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

export default class ProductFormDetail extends Component{
	render(){
		return (
			<div>
				<TopHeader />
				<div className='panel'>
					<ProductForm />
				</div>
			</div>
			)
	}
}