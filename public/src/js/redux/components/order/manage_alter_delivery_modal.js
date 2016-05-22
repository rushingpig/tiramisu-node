import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';
import LinkedStateMixin from 'react-addons-linked-state-mixin';
import DatePicker from 'common/datepicker';
import Select from 'common/select';
import StdModal from 'common/std_modal';
import RadioGroup from 'common/radio_group';
import { map, Noty } from 'utils/index';
import { startMatchDeliveryStations, createMap } from 'mixins/map';

import { order_status as ORDER_STATUS, SELECT_DEFAULT_VALUE,
 DELIVERY_TIME_MAP, DELIVERY_TO_HOME, DELIVERY_TO_STORE }
  from 'config/app.config';

var AlterDeliveryModal = React.createClass({
  propTypes: {
    actions: PropTypes.object.isRequired,
    provinces: PropTypes.array.isRequired,
  },
  componentWillReceiveProps(nextProps){
    if(
      nextProps.order //拿到订单详细数据
      && nextProps.order != this.props.order 
      && !nextProps.show_products_detail //非普通点击查询(编辑)
    ){
      this.initSetState(nextProps.order);
    }
  },
  initSetState(order){
    var {delivery_type, delivery_time, province_id, city_id, regionalism_id, recipient_address, delivery_id} = order;
      delivery_time = delivery_time && delivery_time.split(' ');
    this.setState({
      delivery_type,
      delivery_date: delivery_time && delivery_time[0],
      delivery_hour: delivery_time && delivery_time[1],
      province_id,
      city_id,
      regionalism_id,
      recipient_address,
      delivery_id
    });
  },
  getInitialState: function() {
    return {
      delivery_type: 'DELIVERY',
      delivery_date: '',
      delivery_hour: '',
      province_id: undefined,
      city_id: undefined,
      regionalism_id: undefined,
      recipient_address: '',
      delivery_id: undefined,

      all_delivery_hours: DELIVERY_TIME_MAP.map(n => ({id: n, text: n})),

      auto_match_delivery_center: false,
      auto_match_msg: '',
    };
  },
  render(){
    var { delivery_type, delivery_date, delivery_hour, recipient_address, all_delivery_hours, delivery_id } = this.state;
    var { delivery_shops, delivery_stations, provinces, cities, districts, order = {}, loading} = this.props;
    var _order_status = ORDER_STATUS[order && order.status];
    return (
      <StdModal submitting={this.props.submitting} onConfirm={this.onConfirm} loading={loading} onCancel={this.hideCallback} title="修改配送" ref="modal">
        <div className="form-group form-inline">
          {
            _order_status && _order_status.key <= 30
              ? <span className="gray">订单尚未生产，可直接更改！</span>
              : null
          }
        </div>
        <div className="form-group form-inline">
          <label>{'　　配送方式：'}</label>
          <RadioGroup 
            value={delivery_type} 
            className="inline-block"
            radios={[{value: DELIVERY_TO_HOME, text: '配送上门'}, {value: DELIVERY_TO_STORE, text: '门店自提'}]}
            onChange={this.onDeliveryTypeChange}
            name="delivery_type"
          />
        </div>
        <div className="form-group form-inline">
          <label>{'　　配送时间：'}</label>
          <DatePicker value={delivery_date} onChange={this.onDeliveryDateChange} />{' '}
          <Select valueLink={this.linkState('delivery_hour')} options={all_delivery_hours} className="input-xs" />
        </div>
        <div className="form-inline">
          <label className="v-top" style={{lineHeight: '27px', fontWeight: 'normal'}}>{'修改配送地址：'}</label>
          <div className="inline-block" style={{maxWidth: 470}}>
            <Select ref="province" value={this.state.province_id} onChange={this.onProvinceChange} options={provinces} className="mg-8" />{' '}
            <Select ref="city" value={this.state.city_id} onChange={this.onCityChange} options={cities} className="mg-8" />{' '}
            <Select ref="district" value={this.state.regionalism_id} onChange={this.onDistrictChange} options={districts} className="mg-8" />{' '}
            {
              delivery_type == DELIVERY_TO_HOME
                ? <input ref="recipient_address" valueLink={this.linkState('recipient_address')} className="form-control input-xs mg-8" type="text" />
                : <Select ref="shop" valueLink={this.linkState('recipient_address')} options={delivery_shops} className="mg-8" />
            }
          </div>
        </div>
        <div className="form-group form-inline">
          <label>{'修改配送中心：'}</label>
          <Select ref="delivery_center" valueLink={this.linkState('delivery_id')} options={delivery_stations} className="input-xs transition" />{' '}
          <button onClick={this.startMatchStation} className="btn btn-default btn-xs"><i className="fa fa-map-marker fa-fw"></i></button>{' '}
          <span className={this.state.auto_match_delivery_center ? 'text-success' : 'text-danger'}>
            {this.state.auto_match_msg}
          </span>
        </div>
      </StdModal>
    )
  },
  mixins: [LinkedStateMixin],
  componentDidMount(){
    $(findDOMNode(this.refs.delivery_center)).on('click', this.clearMsg)
  },
  componentWillUnmount(){
    $(findDOMNode(this.refs.delivery_center)).off('click', this.clearMsg)
  },
  clearMsg(){
    $(findDOMNode(this.refs.delivery_center)).removeClass('alert-success alert-danger')
    this.setState({auto_match_msg: ''})
  },
  onConfirm(){
    var {
      delivery_type,
      delivery_date,
      delivery_hour,
      regionalism_id,
      recipient_address,
      delivery_id,
      order
    } = this.state;
    if(!delivery_date || delivery_hour == SELECT_DEFAULT_VALUE){
      Noty('warning', '请填写正确的配送时间'); return;
    }else if(!regionalism_id || regionalism_id == SELECT_DEFAULT_VALUE || !recipient_address.trim()){
      Noty('warning', '请填写完整的配送地址'); return;
    }else if(delivery_id == SELECT_DEFAULT_VALUE){
      Noty('warning', '请选择配送中心'); return;
    }else if(
      delivery_type == DELIVERY_TO_STORE && 
      ( this.refs.shop.props['default-text'] == this.findSelectedOptionText('shop') )){
        Noty('warning', '请选择门店地址'); return;
    }
    var prefix_address = (
      this.findSelectedOptionText('province') +
      this.findSelectedOptionText('city') +
      this.findSelectedOptionText('district')
    )
    this.props.actions.alterDelivery(this.props.active_order_id, {
      delivery_type,
      delivery_time: delivery_date + ' ' + delivery_hour,
      prefix_address,
      regionalism_id,
      recipient_address,
      delivery_id,
      delivery_name: this.findSelectedOptionText('delivery_center'),
      updated_time: this.props.order.updated_time,
    }).done(function(){
      this.props.callback();
      this.refs.modal.hide();
    }.bind(this)).fail(function(msg){
      Noty('error', msg || '服务器异常')
    })
  },
  findSelectedOptionText(_refs){
    return $(findDOMNode(this.refs[_refs])).find('option:selected').html();
  },
  onDeliveryTypeChange(delivery_type){
    this.setState({delivery_type})
  },
  onDeliveryDateChange(delivery_date){
    this.setState({delivery_date})
  },
  onProvinceChange(e){
    var {value} = e.target;
    this.props.actions.resetCities();
    this.setState({province_id: value, city_id: SELECT_DEFAULT_VALUE, regionalism_id: SELECT_DEFAULT_VALUE})
    if(value != this.refs.province.props['default-value'])
      this.props.actions.getCities(value);
    this.props.actions.getDeliveryStations({city_id: SELECT_DEFAULT_VALUE}); //等同于clear stations数据
  },
  onCityChange(e){
    var {value} = e.target;
    this.props.actions.resetDistricts();
    this.setState({city_id: value, delivery_id: SELECT_DEFAULT_VALUE})
    if(value != this.refs.city.props['default-value'])
      this.props.actions.getDistricts(value);
    this.props.actions.getDeliveryStations({city_id: value});
  },
  onDistrictChange(e){
    var {value} = e.target;
    this.props.actions.resetShops();
    this.setState({regionalism_id: e.target.value})
    if(value != this.refs.district.props['default-value'])
      this.props.actions.getDeliveryShops(value);
  },
  startMatchStation(){
    startMatchDeliveryStations.call(this, delivery_id => {
      if(delivery_id){
        this.setState({delivery_id});
      }else{
        this.setState({delivery_id: SELECT_DEFAULT_VALUE});
      }
    }, () => {
      this.setState({delivery_id: SELECT_DEFAULT_VALUE});
    });
  },
  show(){
    this.refs.modal.show();
    var {order, active_order_id} = this.props;
    if(order && order.order_id == active_order_id){
      this.initSetState(order);
    }
    $(findDOMNode(this.refs.delivery_center)).removeClass('alert-success alert-danger');
    createMap(this);
  },
  hideCallback(){
    this.setState(this.getInitialState());
    // this.refs.modal.hide();
    this.props.actions.resetDeliveryStations();
  },
})

export default AlterDeliveryModal;