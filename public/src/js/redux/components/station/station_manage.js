import React, {Component, PropTypes} from 'react';
import { render, findDOMNode } from 'react-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { reduxForm } from 'redux-form';

import SearchInput from 'common/search_input';
import Select from 'common/select';
import Pagination from 'common/pagination';
import LineRouter from 'common/line_router';
import { tableLoader } from 'common/loading';

import AreaActions from 'actions/area';
// import StationScopeAction from 'actions/station_scope_manage';
// import * as StationAction from 'actions/station_manage';

class TopHeader extends Component {
  render(){
    return (
      <div className="clearfix top-header">
        <LineRouter 
          routes={[{name: '配送管理', link: '/sm/station'}, {name: '配送站管理', link: ''}]} />
      </div>
    )
  }
}

class FilterHeader extends Component {
	constructor(props){
		super(props);
		this.state = {
			search_ing :false
		}
	}

	render(){
		var {
			fields: {
				station_name,
				province_id,
				city_id,
				district_id,
			},
			area: {
				provinces,
				cities,
				districts,
			}
		} = this.props;

		return (
			<div className="panel search">
				<div className="panel-body form-inline">
					<SearchInput className="pull-left " />
					<Select {...province_id} options={provinces} onChange={this.onProvinceChange.bind(this, province_id.onChange)} ref="province" default-text="选择省份" className="space-left space-right"/>
					<Select {...city_id} options={cities} onChange={this.onCityChange.bind(this, city_id.onChange)} ref="city" className="space-right"/>
					<Select {...district_id} options={districts} ref="district" className="space-right"/>
					<button disabled={this.state.search_ing} className="btn btn-theme btn-xs">
						<i className="fa fa-search" style={{'padding': '0 5px'}}></i>
						查询
					</button>
					<a className="pull-right btn btn-theme btn-xs">
						<i className="fa fa-plus-circle" style={{'padding': '0 5px'}}></i>
						添加
					</a>
				</div>
			</div>
		)
	}

	componentDidMount(){
    setTimeout(function(){
      var { getProvinces, } = this.props;
      getProvinces();
      LazyLoad('noty');
    }.bind(this),0)
  }
  onProvinceChange(callback, e){
    var {value} = e.target;
    this.props.provinceReset();
    if(value != this.refs.province.props['default-value'])
      var $city = $(findDOMNode(this.refs.city));
      this.props.getCities(value).done(() => {
        $city.trigger('focus'); //聚焦已使city_id的值更新
      });
    callback(e);
  }
  onCityChange(callback, e){
    var {value} = e.target;
    this.props.cityReset();
    if(value != this.refs.city.props['default-value'])
      var $district = $(findDOMNode(this.refs.district));
      this.props.getDistricts(value).done(() => {
        $district.trigger('focus'); //聚焦已使city_id的值更新
      });
    callback(e);
  }
  search(){
    this.setState({search_ing: true});
    this.props.getOrderExchangeList({page_no: 0, page_size: this.props.page_size})
      .always(()=>{
        this.setState({search_ing: false});
      });
  }

}

FilterHeader = reduxForm({
  form: 'station_manage',
  fields: [
    'province_id',
    'city_id',
    'district_id',
  ]
})( FilterHeader );


class StationRow extends Component{
	render(){
		return (
			<tr>
        <td><input type="checkbox" /></td>
        <td>{this.props.province_id}</td>
        <td>{this.props.city_id}</td>
        <td>{this.props.district_id}</td>
        <td>{this.props.station_name}</td>
        <td>{this.props.address}</td>
        <td>
        	<a>编辑配送区域</a>
        	<a>查看备注</a>
        	<a>编辑</a>
        	<a>删除</a>
        </td>
      </tr>
		)
	}
}

export default class StationManagePannel extends Component {
	render(){
		return (
			<div className="station-manage">
				<TopHeader/>
				<FilterHeader {...this.props}/>

				 <div className="panel">
          <header className="panel-heading">送货列表</header>
          <div className="panel-body">
            <div className="table-responsive">
              <table className="table table-hover text-center">
                <thead>
                <tr>
                  <th></th>
                  <th>省份</th>
                  <th>城市</th>
                  <th>区域</th>
                  <th>配送站名称</th>
                  <th>详细地址</th>
                  <th>操作</th>
                </tr>
                </thead>
                <tbody>
                </tbody>
              </table>
            </div>
            <button className="btn btn-theme btn-xs">
            	<i className="fa fa-minus-square" style={{'padding': '0 5px'}}></i>
            	删除
            </button>
            <Pagination  />
          </div>
        </div>
			</div>
		)
	}
}


function mapStateToProps({stationManage}){
  return stationManage;
}

/* 这里可以使用 bindActionCreators , 也可以直接写在 connect 的第二个参数里面（一个对象) */
function mapDispatchToProps(dispatch){
  return bindActionCreators({...AreaActions()},dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(StationManagePannel);
