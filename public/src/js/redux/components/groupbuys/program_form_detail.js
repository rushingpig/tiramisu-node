import React,{Component} from 'react';
import {findDOMNode} from 'react-dom';
import {connect} from 'react-redux';
import { bindActionCreators } from 'redux';

import LineRouter from 'common/line_router';

import ProgramForm from './program_form';

import * as FormActions from 'actions/form';
import * as GroupbuysProgramFormActions from 'actions/groupbuys/program_form';

class ProgramFormDetail extends Component{
	render(){
		return (
			<div>
				<ProgramForm {...this.props} />
			</div>
			)
	}
	componentDidMount(){
		this.props.actions.searchGroupbuysProducts();
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
    },dispatch)};
}

export default connect(mapStateToProps, mapDispatchToProps)(ProgramFormDetail);