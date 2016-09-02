import React, {Component, PropTypes} from 'react';
import { render, findDOMNode } from 'react-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { reduxForm } from 'redux-form';

import SearchInput from 'common/search_input';
import DatePicker from 'common/datepicker';
import Select from 'common/select';
import Pagination from 'common/pagination';
import { tableLoader, get_table_empty } from 'common/loading';
import Linkers from 'common/linkers';

class TopHeader extends Component{
	render() {
		return (
			<div className='clearfix top-header'>
				<button
				 style = {{marginLeft: 20}}
				 className="btn btn-theme btn-xs pull-right">
				   导出
				</button>
				<Linkers
				  data={['团购管理', '团购券列表']}
				  active="团购券列表"
				  className="pull-right" />
			</div>
		)
	}

}

class FilterHeader extends Component{
	constructor(props){
		super(props);
		this.state = {
			search_by_keywords_ing: false,
			search_ing: false,
		}
	}
	render(){
		<div className='panel search'>
			<div className = 'panel-body form-inline'>
				<SearchInput {...keywords} className = 'form-inline v-img space-right' placeholder = '项目名称'
					searchHandler = {this.search.bind(this, 'search_by_keywords_ing')} />
				{'开始时间'}
				<DatePicker editable 
					redux-form = {begin_time}
					className="short-input" />
				{' 结束时间'}
				<DatePicker editable 
					redux-form = {end_time}
				  className="short-input space-right" />
				<Select default-text='团购网站' />
				<Select default-text ='选择省份' />
				<Select default-text = '选择城市' />
				<button disabled = {search_ing} data-submitting = {search_ing} className="btn btn-theme btn-xs"
					onClick = {this.search.bind(this, 'search_ing')}>
				  <i className="fa fa-search"></i>{' 搜索'}
				</button>
			</div>
		</div>
	}
}

