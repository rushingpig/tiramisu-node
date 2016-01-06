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
    return (
      <div className="inline-block">
      {
        all_order_srcs.length == 1 //2级
        ? <Select
            {...src_id} 
            options={all_order_srcs[0]} 
            default-text="订单来源" 
            key="order_srcs_level1" 
            className="space" />
        : [
            (order_srcs_level2.length 
              ? <Select 
                  value={selected_order_src_level1_id} 
                  options={all_order_srcs[0]} 
                  onChange={this.orderSrcsLevel1Change.bind(this)} 
                  default-text="订单来源" 
                  key="order_srcs_level1" 
                  className="space" />
              : <Select 
                  {...src_id} 
                  value={selected_order_src_level1_id} 
                  options={all_order_srcs[0]} 
                  onChange={this.orderSrcsLevel1Change.bind(this)} 
                  default-text="订单来源" 
                  key="order_srcs_level1" 
                  className="space" />),
            ' ',
            (order_srcs_level2.length 
              ? <Select 
                  {...src_id} 
                  options={order_srcs_level2} 
                  key="order_srcs_level2" 
                  default-text="订单来源" 
                  className="space" />  
              : null)
          ]
      }
      </div>
    )
  }
  orderSrcsLevel1Change(e){
    this.setState({selected_order_src_level1_id: e.target.value})
  }
}

OrderSrcsSelects.PropTypes = {
  all_order_srcs: PropTypes.array.isRequired,
  src_id: PropTypes.func.isRequired,
}