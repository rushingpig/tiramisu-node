import React,{Component} from 'react';
import {findDOMNode} from 'react-dom';
import {connect} from 'react-redux';
import { bindActionCreators } from 'redux';

import LineRouter from 'common/line_router';

import ProgramForm from './program_form';

import * as FormActions from 'actions/form';
import AreaActions from 'actions/area';
import * as GroupbuysProgramFormActions from 'actions/groupbuys/program_form';

class ProgramFormDetail extends Component{
	render(){
		var {params} = this.props;
    	var editable = !!(params && params.id);
		return (
			<div>
				<ProgramForm {...{...this.props, editable}} />
			</div>
			)
	}
	componentDidMount(){
		var {params, actions } = this.props;
		actions.searchGroupbuysProducts();
		actions.getProvincesSignal();
		actions.getOrderSrcs();
		if(params && params.id){
			actions.getGroupbuyProgramDetail(params.id);
		}
	}
}



function mapStateToProps(state){
  return state.groupbuysProgramFormManage;
}

function mapDispatchToProps(dispatch){
  return {
    actions:bindActionCreators({
      ...GroupbuysProgramFormActions,
      ...FormActions,
      ...AreaActions(),
    },dispatch)};
}

export default connect(mapStateToProps, mapDispatchToProps)(ProgramFormDetail);