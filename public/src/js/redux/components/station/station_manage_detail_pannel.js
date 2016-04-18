import React, {Component, PropTypes} from 'react';
import {findDOMNode} from 'react-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import AreaActions from 'actions/area';
import * as StationsAction from 'actions/station_manage';
import * as StationFormActions from 'actions/station_manage_form';

import LineRouter from 'common/line_router';

import StationManageEditForm from './station_manage_form_edit';
import StationManageCreateForm from './station_manage_form_create';

import history, { go } from 'history_instance';

class TopHeader extends Component {
  render(){
    return (
      <div className="clearfix top-header">
        <a className="btn btn-theme btn-xs" onClick={this.backHanler.bind(this)} >返回</a>
        <LineRouter 
          routes={[{name: '配送站管理', link: '/sm/station'}, {name: (this.props.editable ? '编辑' : '添加') + '配送站', link: ''}]}
          className="pull-right" />
      </div>
    )
  }
  backHanler(){
    history.push('/sm/station');
  }
}

class StationManageDetailPannel extends Component {
  render(){
    var {stationEditForm, dispatch, area, params} = this.props;
    var actions = {
      ...bindActionCreators(AreaActions(), dispatch), 
      ...bindActionCreators(StationsAction, dispatch),
      ...bindActionCreators(StationFormActions, dispatch),
    };
    var editable = !!(params && params.id);

    return (
      <div>
        <TopHeader editable={editable}/>
        <div className="panel">
          <header className="panel-heading">订单详情</header>
          <div className="panel-body">
            {
              !editable
                ? <StationManageCreateForm
                    form-data={stationEditForm}
                    area={area} 
                    actions={actions}
                    editable={editable}/>
                : <StationManageEditForm
                    form-data={stationEditForm}
                    actions={actions}
                    area={area} 
                    editable={editable}
                    station_id={params.id}/>
            }
          </div>
        </div>
      </div>
    )
  }

  componentDidMount() {
    var station_id = this.props.params.id;
    var { getStationById, params } = this.props;
    if(params && params.id){
      getStationById(params.id);
    }
  }
}

function mapStateToProps({stationManageForm}){
  return stationManageForm;
}

function mapDispatchToProps(dispatch){
  var actions = bindActionCreators({...AreaActions(),...StationFormActions,...StationsAction},dispatch);
  actions.dispatch = dispatch;
  return actions;
}

export default connect(mapStateToProps, mapDispatchToProps)(StationManageDetailPannel);
