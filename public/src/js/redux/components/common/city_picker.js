import React, { Component } from 'react';

class CityPicker extends Component{
	constructor(props){
	  super(props);
	  this.state = {
	  	currentSelect:'province',
	  	citymenuDown: false,
	  	currentSelectPro:'',
	  	currentSelectPro_id: -1,
	  	currentSelectCity:'',
	  	currentSelectDistrict:'',
	  	clickInside: false,
	  }
	  this.outsideClick=this.outsideClick.bind(this);
	  this._mousedown = this._mousedown.bind(this);
	}
	render(){
		var {currentSelect, citymenuDown, currentSelectDistrict, currentSelectCity,currentSelectPro} = this.state;
		var { provinces, cities, districts, is_county } = this.props;
		var className = 'btn btn-default btn-xs dropdown-toggle' + (this.props.className || '');
    	this.props = {...this.props, ...{className: className}};

		var provincesAG, provincesHK, provincesLS, provincesTZ = [];
		provincesAG = provinces.filter( p => p.ascii_value >= 'A'.charCodeAt() && p.ascii_value <= 'G'.charCodeAt() );
		provincesHK = provinces.filter( p => p.ascii_value >= 'H'.charCodeAt() && p.ascii_value <= 'K'.charCodeAt() );
		provincesLS = provinces.filter( p => p.ascii_value >= 'L'.charCodeAt() && p.ascii_value <= 'S'.charCodeAt() );
		provincesTZ = provinces.filter( p => p.ascii_value >= 'T'.charCodeAt() && p.ascii_value <= 'Z'.charCodeAt() );
		var areatext = currentSelectPro +  (currentSelectCity ? '/':'') + currentSelectCity + (currentSelectDistrict ? '/':'') + currentSelectDistrict ;
		var defaultAreatext = is_county == 1 ? '请选择省/市/区':'请选择省/市'
	    areatext = areatext ? areatext:defaultAreatext;
		var _this = this;
		var provinceList = [];
		if(provincesAG.length >0) provinceList.push ({
				'first_letters':'A-G',
				'provinces':provincesAG,
			});
		if(provincesHK.length >0) provinceList.push ({
				'first_letters':'H-K',
				'provinces':provincesHK,
			});
		if(provincesLS.length >0) provinceList.push ({
				'first_letters':'L-S',
				'provinces':provincesLS,
			});
		if(provincesTZ.length >0) provinceList.push ({
				'first_letters':'T-Z',
				'provinces':provincesTZ,
			});
		var cityList = is_county == 1 ? cities : cities.filter( m => m.is_open == 0);
		var districtList = is_county == 1 ? districts.filter( m => m.is_open == 0) : [];
		var provinceContent = provinceList.map( m => {
			return (
					<dl className='clearfix'>
						<dt>{m.first_letters}</dt>
						<dd>
							{m.provinces.map( n => <a href='javacript:;' title={n.text} data-code={n.id} 
								onClick={_this.selectProvince.bind(_this, n.id, n.text)}>{n.text}</a>)}
						</dd>
					</dl>
				)
		})
		var cityContent = cityList.map( m => {
			return(
					<a href='javacript:;' onClick={_this.selectCity.bind(_this, m.id, m.text)}>{m.text}</a>
				)
		})
		var districtContent = districtList.map( m => {
			return (
					<a href='javacript:;' onClick={_this.selectDistrict.bind(_this,m.id, m.text)}>{m.text}</a>
				)
		})
		return(
			<div className='form-group' onClick={this.insideClick.bind(this)}>
				<div  className={"btn-group" + (citymenuDown ? ' open' : '')}>
					{/*<input ref='city_picker3' className='form-control city-picker-input' readOnly type='text' />*/}
						<button type="button" className={className} onClick={this.handleToggleShowState.bind(this)} style={{borderRadius:'3px 3px'}}>
						  {areatext }
						  {' '}
						  <span className="caret"></span>
						</button>
					<div className='dropdown-menu city-picker-dropdown' >
						<div className='city-select-wrap'>
							<div className='city-select-tab'>
								<a className={currentSelect == 'province' ? 'active':''} data-count='province'
									onClick={this.changeCurrentTabSelect.bind(this,'province')}>省份</a>
								<a className ={currentSelect == 'city' ?'active':''} data-count='city'
									onClick={this.changeCurrentTabSelect.bind(this,'city')}>城市</a>
								{is_county ==1 && <a className={currentSelect == 'district' ? 'active': ''} data-count='district'
									onClick={this.changeCurrentTabSelect.bind(this,'district')}>区县</a>}
							</div>
							<div className='city-select-content'>
								<div className='city-select province' data-count='province' style={{display: currentSelect=='province'? 'block':'none'}}>
									{provinceContent}
								</div>
								<div className='city-select city' data-count ='city' style={{display: currentSelect =='city' ? 'block':'none'}}>
									<dl className='clearfix'>
										<dd>
											{cityContent}
										</dd>
									</dl>
								</div>
								<div className='city-select district' data-count = 'district' style={{display: currentSelect == 'district' ?'block':'none'}}>
									<dl className='clearfix'>
										<dd>{districtContent}</dd>
									</dl>
								</div>
							</div>
						</div>
					</div>
				</div>

			</div>
			)
	}
	componentDidMount() {
	  this.setState({clickInside: false});
	  window.addEventListener('click', this.outsideClick);
	  window.addEventListener('mousedown', this._mousedown);
	}
	componentWillReceiveProps(nextProps){
		if(this.props.is_county != nextProps.is_county){
			this.setState({
				currentSelect:'province',
				citymenuDown:false,
				currentSelectPro:'',
				currentSelectPro_id: -1,
				currentSelectCity:'',
				currentSelectDistrict:'',
				clickInside: false,				
			})
			this.props.onChange(undefined);
		}
	}
	componentWillUnmount() {
	  window.removeEventListener('click', this.outsideClick);
	  window.removeEventListener('mousedown', this._mousedown);
	}
	handleToggleShowState(){
		this.setState({citymenuDown:!this.state.citymenuDown});		
	}
	changeCurrentTabSelect(currentSelect){
		this.setState({currentSelect});
	}
	selectProvince(id, text){
		this.props.getRegionalism({parent_id:id, type: 'city'})
		this.setState({currentSelectPro:text,currentSelectCity:'',currentSelectDistrict:'', currentSelect:'city', currentSelectPro_id: id});
	}
	selectCity(id, text){
		this.props.getRegionalism({parent_id: id, type: 'district'});
		if(this.props.is_county == 1){
			this.setState({currentSelectCity:text, currentSelect:'district', currentSelectDistrict:''});
			this.props.onChange(undefined);
		}
		else {
			this.setState({citymenuDown: !this.state.citymenuDown,currentSelectCity:text});
			this.props.onChange(id);			
		}
	}
	selectDistrict(id, text){
		if(this.props.is_county) this.props.onChange(id);
		this.setState({currentSelectDistrict: text,citymenuDown:!this.state.citymenuDown});
	}
	insideClick(){
		this.setState({clickInside: true});
	}
	_mousedown(){
		this.setState({clickInside:false});
	}
	outsideClick(){
		if(!this.state.clickInside && this.state.citymenuDown)
			this.setState({citymenuDown: !this.state.citymenuDown, clickInside:false});
	}

}

export default CityPicker;