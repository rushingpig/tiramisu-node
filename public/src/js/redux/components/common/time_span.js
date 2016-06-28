import React, { Component } from 'react';


var TimeSpan = React.createClass({
	getDefaultProps: function() {
	  return {
	    className: '',
	    'redux-form': null,
	    'time_range':'',
	  };
	},
	getInitialState: function() {
	    var redux_form = this.props['redux-form'];
	    if(redux_form && redux_form.value != undefined){
	    	var {value} =redux_form;
	    	var time1 = value.split('~');
	    	var beginTime = time1[0].split(':');
	    	var endTime = time1[1].split(':');
	    	return {
	    	  showMenu: false,
	    	  begin_h: beginTime[0], 
	    	  begin_min: beginTime[1].replace(/(^\s*)/g,''), 
	    	  end_h: endTime[0], 
	    	  end_min: endTime[1].replace(/(^\s*)/g,''),
	    	}	    	
	    }else{
	    	return{
	    		showMenu:false,
	    		begin_h: '09',
	    		begin_min: '30',
	    		end_h: '23',
	    		end_min: '30',
	    	}
	    }

	},
	componentWillReceiveProps: function(nextProps) {
	  if (
	    nextProps['redux-form']
	    && nextProps['redux-form'].value != undefined 
	    && (nextProps['redux-form'].value != this.props['redux-form'].value)
	  ) {
	    $(function(){
	    	var {value} = nextProps['redux-form'];
	    	var time1 = value.split('~');
	    	var beginTime = time1[0].split(':');
	    	var endTime = time1[1].split(':');
	      this.setState({
	        begin_h: beginTime[0], 
	        begin_min: beginTime[1].replace(/(^\s*)/g,''), 
	        end_h: endTime[0], 
	        end_min: endTime[1].replace(/(^\s*)/g,''),
	      });
	    }.bind(this))

	  } else if (nextProps.value != this.props.value){
	    this.setState({
	    	begin_h: beginTime[0], 
	    	begin_min: beginTime[1].replace(/(^\s*)/g,''), 
	    	end_h: endTime[0], 
	    	end_min: endTime[1].replace(/(^\s*)/g,''),
	    })
	  }
	},
	render(){
		let {begin_h, begin_min, end_h, end_min} = this.state;
		let timespan = begin_h + ':' + begin_min + '~' + end_h + ':' + end_min;
		return(
      		<div onClick={this.handleClickInside} className={"btn-group" + (this.state.showMenu ? ' open' : '')}>
	      		<button type="button" className="btn btn-default btn-xs dropdown-toggle" onClick={this.handleToggleShowState}>
	      		  {timespan }
	      		  {' '}
	      		  <span className="caret"></span>
	      		</button>	
	      		<div className='dropdown-menu' style={{width:180}}>
	      			<div style={{margin:'5px 10px',}}>
	      				<header className='text-center' style={{fontSize:'12px'}} >设置配送时间段</header>
	      				<div className='row'>
	      					<div className='col-xs-5'>
	      						<table className='text-center'>
	      							<tbody>
	      							<tr>
	      								<td>
	      									<a href='javascript:;' onClick={this.timeOpt.bind(this, 'begin_h', 'plus')}><i className='fa fa-plus' /></a>
	      								</td>
	      								<td></td>
	      								<td>
	      									<a href='javascript:;' onClick={this.timeOpt.bind(this, 'begin_min', 'plus')}><i className='fa fa-plus' /></a>
	      								</td>
	      							</tr>

	      							<tr>
	      								<td>
	      									<input value={begin_h} style={{width:25, height:20}} type='text' readOnly /> 
	      								</td>
	      								<td></td>
	      								<td>
	      									<input value={begin_min} style={{width:25, height:20}} type='text' readOnly /> 
	      								</td>
	      							</tr>
	      							<tr>
	      								<td>
	      									<a href='javascript:;' onClick={this.timeOpt.bind(this, 'begin_h', 'minus')}><i className='fa fa-minus' /></a>
	      								</td>
	      								<td></td>
	      								<td>
	      									<a href='javascript:;' onClick={this.timeOpt.bind(this, 'begin_min', 'minus')}><i className='fa fa-minus' /></a>
	      								</td>
	      							</tr>
	      							</tbody>
	      						</table>
	      					</div>
	      					<div className='col-xs-2'>
	      						<span style={{fontSize:'12px', lineHeight:'60px'}}>{'至'}</span>
	      					</div>
	      					<div className='col-xs-5'>
		      					<table className='text-center'>
		      						<tbody>
		      						<tr>
		      							<td>
		      								<a href='javascript:;' onClick={this.timeOpt.bind(this, 'end_h', 'plus')}><i className='fa fa-plus' /></a>
		      							</td>
		      							<td></td>
		      							<td>
		      								<a href='javascript:;' onClick={this.timeOpt.bind(this, 'end_min', 'plus')}><i className='fa fa-plus' /></a>
		      							</td>
		      						</tr>

		      						<tr>
		      							<td>
		      								<input value={end_h} style={{width:25, height:20}} type='text' readOnly /> 
		      							</td>
		      							<td></td>
		      							<td>
		      								<input value={end_min} style={{width:25, height:20}} type='text' readOnly /> 
		      							</td>
		      						</tr>
		      						<tr>
		      							<td>
		      								<a href='javascript:;' onClick={this.timeOpt.bind(this, 'end_h', 'minus')}><i className='fa fa-minus' /></a>
		      							</td>
		      							<td></td>
		      							<td>
		      								<a href='javascript:;' onClick={this.timeOpt.bind(this, 'end_min', 'minus')}><i className='fa fa-minus' /></a>
		      							</td>
		      						</tr>
		      						</tbody>
		      					</table>
	      					</div>
	      				</div>
	      			</div>
	      		</div>		
			</div>

			)
	},
	componentDidMount() {
	  this.clickInSide = false;
	  window.addEventListener('click', this.handleClickOutSide);
	  window.addEventListener('mousedown', this._mousedown);
	},
	componentWillUnmount() {
	  window.removeEventListener('click', this.handleClickOutSide);
	  window.removeEventListener('mousedown', this._mousedown);
	},
	handleToggleShowState() {
	  this.clickInSide = true;

	  this.setState({
	    showMenu: !this.state.showMenu
	  });
	},
	handleClickOutSide() {
	  if (this.clickInSide) {
	    this.clickInSide = false
	    return;
	  }

	  this.setState({
	    showMenu: false
	  });
	},
	handleClickInside(){
		this.clickInSide = true
	},
	timeOpt(code, opt){
		var re = /^0\d$/g;
		var num ;
		var numstr;
		var orginal;
		switch(code){
			case 'begin_h':
				orginal = this.state.begin_h;break;
			case 'begin_min':
				orginal = this.state.begin_min;break;
			case 'end_h':
				orginal = this.state.end_h;break;
			case 'end_min':
				orginal = this.state.end_min;break;
			default:;
		}
		var code1 = code.replace("\"", "");
		if(re.test(orginal)){
			num = parseInt(orginal.charAt(1));
		}else{
			num = parseInt(orginal);			
		}
		if(opt == 'plus')
			num ++;
		else if(opt =='minus')
			num --;
		var {begin_h, begin_min, end_h, end_min} = this.state;
		var  timespan = begin_h + ':' + begin_min + '~' + end_h + ':' + end_min;
		switch(code){
			case 'begin_h':
				num = num % 24;
				if(num < 0) num = 0;
				if(num < 10) numstr = '0' + num;
				else numstr = num;
				timespan = numstr + ':' + begin_min + '~' + end_h + ':' + end_min
				this.setState({begin_h: numstr});break;
			case 'begin_min':
				num = num % 60;
				if(num < 0) num = 0;
				if(num < 10) numstr = '0' + num;
				else numstr = num;
				timespan = begin_h + ':' + numstr + '~' + end_h + ':' + end_min
				this.setState({begin_min:numstr});break;
			case 'end_h':
				num = num % 24;
				if(num < 0) num = 0;
				if(num < 10) numstr = '0' + num;
				else numstr = num;
				timespan = begin_h + ':' + begin_min + '~' + numstr + ':' + end_min
				this.setState({end_h: numstr});break;
			case 'end_min':
				num = num % 60;
				if(num < 0) num = 0;
				if(num < 10) numstr = '0' + num;
				else numstr = num;
				timespan = begin_h + ':' + begin_min + '~' + end_h + ':' + numstr
				this.setState({end_min: numstr});break;
			default:;
		}
		
		this.props.onChange(timespan)
	},
	_mousedown(){
		this.clickInSide = false;
	}
})

export default TimeSpan;