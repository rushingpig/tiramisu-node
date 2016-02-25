import React from 'react';
import ReactDom from 'react-dom';

import LineRouter from 'common/line_router';
import SearchInput from 'common/search_input';
import Select from 'common/select';
import StationInfoList from './station_info_list';

class TopHeader extends React.Component {
  render(){
    return (
      <div className="clearfix top-header">
        <LineRouter 
          routes={[{name: '配送管理', link: '/sm/index'}, {name: '配送站管理', link: ''}]} />
      </div>
    );
  }
}


export default class StationManagePanel extends React.Component{
	render(){
		var {provinces,cities,changeHandler,change_submitting,} = this.props;
		return (
			<div>
				<TopHeader/>
				<form className="form-inline">
					<SearchInput placeholder="请输入您要查询的配送站" className="pull-left"/>

					<Select ref="province" default-text="选择省份" className="space-right"/>
          <Select ref="city" default-text="选择城市" className="space-right"/>
          <button className="btn btn-sm btn-theme">查找<i className="fa fa-search" style={{paddingLeft:'5px'}}></i></button>

				</form>
				<StationInfoList/>
			</div>
		)
	}
}