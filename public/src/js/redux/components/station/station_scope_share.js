import React, {Component, PropTypes} from 'react';
import { render, findDOMNode } from 'react-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import StationMapGroup from './station_map_group';

import * as StationsAction from 'actions/station_manage';
import * as StationFormActions from 'actions/station_manage_form';

import MyMap from 'utils/station_group_scope';

class StationSharePannel extends Component {
  constructor(props){
    super(props);
  }
  render(){
    //历史遗留问题，list是一个长度为0的数组；
    var { list } = this.props.stations;
    var style = {
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      zIndex: 10000,
      background: '#fff'
    }
    return (
      <div className="station-manage" style={style}>
        <StationMapGroup ref="stationMapGroup" 
          share
          list={list}
          callback={this.viewStationScope.bind(this)}
        />
      </div>
    )
  }
  componentDidMount(){
    var { params, getStationListById } = this.props;
    if(params && params.id){
      getStationListById(params.id);
    }
  }
  viewStationScope(){
    //定位居中
    this.refs.stationMapGroup.viewStationScope(this.props.stations.list[0]);
  }
} 

//共用
function mapStateToProps({stationManage}){
  return stationManage;
}
function mapDispatchToProps(dispatch){
  return bindActionCreators({...StationsAction,...StationFormActions},dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(StationSharePannel);
