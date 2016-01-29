import React, { Component, PropTypes } from 'react';
import LinkedStateMixin from 'react-addons-linked-state-mixin';
import DatePicker from 'common/datepicker';
import Select from 'common/select';
import StdModal from 'common/std_modal';
import RadioGroup from 'common/radio_group';
import { map } from 'utils/index';
import { order_status as ORDER_STATUS, DELIVERY_TIME_MAP, DELIVERY_TO_HOME, DELIVERY_TO_STORE } from 'config/app.config';

var AlterDeliveryModal = React.createClass({
  propTypes: {
    actions: PropTypes.object.isRequired,
    provinces: PropTypes.array.isRequired,
  },
  componentWillReceiveProps(nextProps){
    if(
      nextProps.order //拿到订单详细数据
      && !nextProps.show_products_detail //非普通点击查询(编辑)
    ){
      var {delivery_type, delivery_time, province_id, city_id, regionalism_id, recipient_address, delivery_id} = nextProps.order;
      delivery_time = delivery_time.split(' ');
      this.setState({
        delivery_type,
        delivery_date: delivery_time[0],
        delivery_hour: delivery_time[1],
        province_id,
        city_id,
        regionalism_id,
        recipient_address,
        delivery_id
      });

      // var { getProvinces, getCities, getDistricts, getDeliveryShops, getDeliveryStations } = this.props.actions;
      // setTimeout(function(){
      //   $.when(
      //     getProvinces(),
      //     getCities(province_id),
      //     getDistricts(city_id),
      //     getDeliveryShops(regionalism_id),
      //     getDeliveryStations()
      //   ).done(function(){
      //     this.setState({loading: false})
      //   }.bind(this))
      // }.bind(this), 4000)
    }
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

      loading: true,

      all_delivery_hours: DELIVERY_TIME_MAP.map(n => ({id: n, text: n})),
    };
  },
  render(){
    var { delivery_type, delivery_date, delivery_hour, recipient_address, all_delivery_hours, delivery_id, loading } = this.state;
    var { delivery_shops, delivery_stations, provinces, cities, districts, order = {}} = this.props;
    var _order_status = ORDER_STATUS[order && order.order_status];
    return (
      <StdModal submitting={this.props.submitting} loading={loading} onCancel={this.hideCallback} title="修改配送" ref="modal">
        <div className="form-group form-inline">
          {
            _order_status && _order_status.key > 30
              ? <span className="gray">订单尚未生产，可直接更改！</span>
              : <span className="text-danger">订单已转换，请与配送站确认是否能修改信息再提交！</span>
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
        <div className="form-group form-inline">
          <label>{'修改配送地址：'}</label>
          <Select ref="province" value={this.state.province_id} onChange={this.onProvinceChange} options={provinces} />{' '}
          <Select ref="city" value={this.state.city_id} onChange={this.onCityChange} options={cities} />{' '}
          <Select ref="district" value={this.state.regionalism_id} onChange={this.onDistrictChange} options={districts} />{' '}
          {
            delivery_type == DELIVERY_TO_HOME
              ? <input ref="recipient_address" valueLink={this.linkState('recipient_address')} className="form-control input-xs" type="text" />
              : <Select ref="shop" valueLink={this.linkState('recipient_address')} options={delivery_shops} />
          }
        </div>
        <div className="form-group form-inline">
          <label>{'修改配送中心：'}</label>
          <Select valueLink={this.linkState('delivery_id')} options={delivery_stations} className="input-xs" />
        </div>
      </StdModal>
    )
  },
  mixins: [LinkedStateMixin],
  componentDidMount(){
    
  },
  onDeliveryTypeChange(delivery_type){
    this.setState({delivery_type})
  },
  onDeliveryDateChange(delivery_date){
    this.setState({delivery_date})
  },
  onProvinceChange(e){
    var {value} = e.target;
    this.props.actions.provinceReset();
    this.setState({province_id: e.target.value})
    if(value != this.refs.province.props['default-value'])
      this.props.actions.getCities(value);
  },
  onCityChange(e){
    var {value} = e.target;
    this.props.actions.cityReset();
    this.setState({city_id: e.target.value})
    if(value != this.refs.city.props['default-value'])
      this.props.actions.getDistricts(value);
  },
  onDistrictChange(e){
    var {value} = e.target;
    this.props.actions.districtReset();
    this.setState({regionalism_id: e.target.value})
    if(value != this.refs.district.props['default-value'])
      this.props.actions.getDeliveryShops(value);
  },
  show(){
    this.refs.modal.show();
  },
  hideCallback(){
    this.setState(this.getInitialState());
    // this.refs.modal.hide();
  },
})

export default AlterDeliveryModal;