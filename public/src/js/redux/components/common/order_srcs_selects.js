import React, { PropTypes } from 'react';
import { SELECT_DEFAULT_VALUE } from 'config/app.config';
import Select from 'common/select';

export default class OrderSrcsSelects extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      selected_order_src_level1_id: SELECT_DEFAULT_VALUE,
    }
  }
  render(){
    var { all_order_srcs, src_id } = this.props;
    var {selected_order_src_level1_id} = this.state;
    
    var order_srcs_level2 = all_order_srcs.length > 1
      ? all_order_srcs[1].filter(n => n.parent_id == selected_order_src_level1_id)
      : [];
    console.log(all_order_srcs && all_order_srcs.length, all_order_srcs[0] && all_order_srcs[0].length, order_srcs_level2.length);
    return (
      <div className="inline-block">
      {
        order_srcs_level2.length 
          ? [
            <Select 
                value={selected_order_src_level1_id} 
                options={all_order_srcs[0]} 
                onChange={this.orderSrcsLevel1Change.bind(this)} 
                key="order_srcs_level1" 
                default-text="订单来源"
                className="form-select space-right" />, ' ',
            <Select 
                {...src_id} 
                options={order_srcs_level2} 
                key="order_srcs_level2" 
                default-text="订单来源"
                className="form-select space-right" />
            ]
          : <Select 
              value={typeof selected_order_src_level1_id != 'undefined' ? src_id.value : SELECT_DEFAULT_VALUE} 
              options={all_order_srcs[0]} 
              onChange={this.orderSrcsLevel1Change.bind(this)} 
              key="order_srcs_level1" 
              default-text="订单来源"
              className="form-select space-right" />
      }
      </div>
    )
  }
  orderSrcsLevel1Change(e){
    var { value } = e.target;
    var { all_order_srcs } = this.props;
    //如果没有二级订单来源，则表明只是一个一级来源
    if(all_order_srcs[1] && !all_order_srcs[1].filter(n => n.parent_id == value).length){
      this.props.actions.triggerFormUpdate(this.props.reduxFormName, 'src_id', value); //此时只能模拟form表单更新
    }else{
      this.props.actions.resetFormUpdate(this.props.reduxFormName, 'src_id');
    }
    this.setState({selected_order_src_level1_id: value});
  }
}

OrderSrcsSelects.PropTypes = {
  all_order_srcs: PropTypes.array.isRequired,
  src_id: PropTypes.func.isRequired,
  reduxFormName: PropTypes.string.isRequired,
}