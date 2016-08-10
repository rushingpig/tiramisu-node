import React,{Component} from 'react';
import {findDOMNode} from 'react-dom';
import {connect} from 'react-redux';
import { bindActionCreators } from 'redux';

import LineRouter from 'common/line_router';

import CityCreate from './city_form_create';
import CityEdit from './city_form_edit';

import * as FormActions from 'actions/form';
import { AreaActionType2 } from 'actions/action_types';
import * as CityManageActions from 'actions/city_manage';
import AreaActions from 'actions/area';

class TopHeader extends Component{
	render(){
		var { editable } = this.props;
		return(
			<div className = 'clearfix top-header'>
			{
				editable
				?
				<LineRouter 
					routes={[{name:'城市列表',link:'/cm/city'},{name: '编辑城市', link: ''}]} 
					className="pull-right"/>
				:
				<LineRouter 
					routes={[{name:'城市列表',link:'/cm/city'},{name: '添加城市', link: ''}]} 
					className="pull-right"/>
			}
			</div>
			)
	}
}

class CityDetailPannel extends Component{
	render(){
		var {params, provinces_letter} = this.props;
		var editable = !!(params && params.id);
		return(
			<div className='city-manage'>
				<TopHeader editable={editable}/>
				<div className='panel'>
					<header className='panel-heading'>城市详情</header>
					<div className='panel-body'>
					{
						!editable
						?
						<CityCreate 
							editable = {editable}
							provinces_letter = {provinces_letter}
							{...this.props}
							/>
						:
						<CityEdit 
							provinces_letter = {provinces_letter}
							editable = {editable}
							{...this.props}
							/>
					}
					</div>
				</div>
			</div>
			)
	}

	componentDidMount(){
		var {params}=this.props;
		var _this = this;
		/*if(params && params.id){

		}*/
		if(params && params.id){
			this.props.actions.getAccessibleCityDetail(params.id);
		}else{
			this.props.actions.gotRegionalismLetter({type:'province'});
			this.props.actions.ResetDistrictsLetter();
		}
	}
}

function mapStateToProps(state){
  return state.accessibleCityManage;
}
function mapDispatchToProps(dispatch){
   return {
    actions: bindActionCreators({
      ...AreaActions(AreaActionType2),
      ...FormActions,
      ...CityManageActions
    }, dispatch)
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(CityDetailPannel)