import React from 'react';
import RadioGroup from 'common/radio_group';

export default class StationInfoList extends React.Component{
	render(){
		var radio = [{name:'jl',value: true,text:''}]
		return (
			<table className="table table-hover table-bordered">
	  			<thead>
	  				<tr>
	  					<th>
	  						<RadioGroup radios={radio}/>
	  					</th>
	  					<th>区域</th>
	  					<th>名称</th>
	  					<th>地址</th>
	  					<th>操作</th>
	  				</tr>
	  			</thead>
	  		<tbody>
	  		</tbody>
	  	</table>
		);
	}
}