import React, {Component, PropTypes} from 'react';
import {render, findDOMNode} from 'react-dom';
import { reduxForm } from 'redux-form';

import DatePicker from 'common/datepicker';
import Select from 'common/select';
import Pagination from 'common/pagination';
import LazyLoad from 'utils/lazy_load';
import { Noty, form as uForm, dateFormat } from 'utils/index';
import history from 'history_instance';

import HistoryOrders from './manage_history_orders';
import { isSrc } from 'reducers/form';

import { DELIVERY_TO_HOME, DELIVERY_TO_STORE,
  SELECT_DEFAULT_VALUE, INVOICE } from 'config/app.config';
import autoMatchDeliveryStations from 'mixins/map';
import FormFields from 'config/form.fields';

const validate = (values, props) => {
  const errors = {};
  var msg = 'error';
  var { form } = props;
  function _v(key){
    // touched 为true 表示用户点击处理过
    if (form[key] && form[key].touched && !values[key])
      errors[key] = msg;
  }
  function _v_selsect(key){
    if(form[key] && form[key].touched && (!values[key] || values[key] == SELECT_DEFAULT_VALUE))
      errors[key] = msg;
  }
  function _v_mobile(key){
    if (form[key] && form[key].touched && !values[key] || (form[key] && !form[key].focus && values[key] && !uForm.isMobile(values[key]))){
      errors[key] = msg;
    }
  }

  _v('owner_name');
  _v('recipient_name');
  // _v('recipient_landmark');
  _v('delivery_date');

  _v_mobile('owner_mobile');
  _v_mobile('recipient_mobile');

  _v_selsect('regionalism_id');
  // _v_selsect('delivery_id');
  _v_selsect('src_id');
  _v_selsect('pay_modes_id');
  _v_selsect('pay_status');
  _v_selsect('delivery_hours');

  //配送上门
  if(values.delivery_type == DELIVERY_TO_HOME){
    _v('recipient_address');
  //自提时，则不需建筑物字段, 但地址则为相应的门店地址
  }else if(values.delivery_type == DELIVERY_TO_STORE){
    delete errors.recipient_landmark;
    _v_selsect('recipient_shop_address'); //门店
  }

  //团购密码
  if( isSrc('团购网站', values.src_id) ){
    if (form['coupon'] && form['coupon'].touched && !values['coupon'] || (form['coupon'] && !form['coupon'].focus && values['coupon'] && !uForm.isCoupon(values['coupon']))){
      errors['coupon'] = msg;
    }
  }

  //errors为空对象才表明验证正确
  return errors;
};

class ManageAddForm extends Component {
  constructor(props){
    super(props);
    this.state = {
      invoices: [{id: INVOICE.NO, text: '不需要'}, {id: INVOICE.YES, text: '需要'}],
      selected_order_src_level1_id: undefined,

      groupbuy_check_ing: false,
      groupbuy_success: undefined, //验券是否成功
      groupbuy_checked: false, //是否已进行过验券操作(现在的逻辑是不管有没验证通过，都可以创建订单)
      groupbuy_msg: '', //验券结果
      auto_match_delivery_center: false,
      auto_match_msg: '',
    };
    this._check = this._check.bind(this);
    this.autoMatchDeliveryStations = autoMatchDeliveryStations.bind(this);
  }
  render(){
    var {
      editable,  // 表明是否是处于编辑状态
      handleSubmit,
      fields: {
        delivery_type,
        owner_name,
        owner_mobile,
        recipient_name, //下单人姓名
        recipient_mobile,
        recipient_address, //收货人详细地址----》配送上门 ，
        recipient_shop_address, //收货人详细地址----》门店自提(实际上是门店地址)
        province_id,
        city_id,
        regionalism_id,    //区ID
        recipient_landmark, //标志性建筑
        delivery_id,     //配送中心
        src_id,          //订单来源
        pay_modes_id,    //支付方式
        coupon,          //团购密码
        pay_status,
        // delivery_time, //总配送时间：delivery_date + delivery_time
        delivery_date,  //配送日期
        delivery_hours, //配送时段：几点到几点
        remarks,
        invoice,
      },
      history_orders,
    } = this.props;

    var { getHistoryOrders, checkHistoryOrder, getCopyOrderById, copyOrder } = this.props.actions;

    var { save_ing, save_success, submit_ing, 
      all_delivery_time, all_pay_status, all_order_srcs, 
      delivery_stations, all_pay_modes} = this.props['form-data'];
    var {provinces, cities, districts, delivery_shops} = this.props.area;
    var {invoices, selected_order_src_level1_id = src_id.value, groupbuy_psd, groupbuy_check_ing, groupbuy_msg, groupbuy_success} = this.state;

    var isThird = isSrc('团购网站', src_id.value); //是否第三方，显示团购密码组件
    
    //{{表单处于编辑状态时的额外处理
    if(editable && !this.editable_initial){
      if(src_id.value && all_order_srcs[1]){   //表明表单数据已准备完毕
        this.editable_initial = true;   //初始化就只能一次
        all_order_srcs[1].forEach(n => {
          if(n.id == src_id.value){
            selected_order_src_level1_id = n.parent_id;
            this.state.selected_order_src_level1_id = n.parent_id;
          }
        })
      }
    }
    //}}

    var order_srcs_level2 = all_order_srcs.length > 1
      ? all_order_srcs[1].filter(n => n.parent_id == selected_order_src_level1_id)
      : [];

    return (
    <div>
      <div className="form-group form-inline">
        <label className="control-label">{'　配送方式：'}</label>
        <label>
          <input type="radio" 
            {...delivery_type}
            value={DELIVERY_TO_HOME}
            name="delivery_type"
            checked={delivery_type.value == DELIVERY_TO_HOME} /> 配送上门</label>
        {'　'}
        <label>
          <input type="radio" 
            {...delivery_type}
            value={DELIVERY_TO_STORE}
            name="delivery_type"
            checked={delivery_type.value == DELIVERY_TO_STORE} /> 门店自提</label>
      </div>
      <div className="form-group form-inline">
        <label>{'下单人姓名：'}</label>
        <input {...owner_name} className={`form-control input-xs ${owner_name.error}`} type="text" />
      </div>
      <div className="form-group form-inline">
        <label>{'下单人手机：'}</label>
        <input {...owner_mobile} ref="owner_mobile" className={`form-control input-xs ${ owner_mobile.error }`} type="text" />{' '}
        <button onClick={this.showHistoryModal.bind(this)} className="btn btn-default btn-xs">查询历史订单</button>{' '}
        <button className="btn btn-default btn-xs" disabled>拨号</button>
      </div>
      <div className="form-group form-inline">
        <label>{'收货人姓名：'}</label>
        <input {...recipient_name} className={`form-control input-xs ${recipient_name.error}`} type="text" />
      </div>
      <div className="form-group form-inline">
        <label>{'收货人手机：'}</label>
        <input {...recipient_mobile} className={`form-control input-xs ${recipient_mobile.error}`} type="text" />
      </div>
      <div className="form-group form-inline">
        <label>{delivery_type.value == DELIVERY_TO_HOME ? '收货人地址：' : '　选择分店：'}</label>
        <Select ref="province" options={provinces} {...province_id} onChange={this.onProvinceChange.bind(this, province_id.onChange)} className="form-select" />{' '}
        <Select ref="city" options={cities} {...city_id} onChange={this.onCityChange.bind(this, city_id.onChange)} />{' '}
        <Select ref="district" options={districts} {...regionalism_id} onChange={this.onDistrictChange.bind(this, regionalism_id.onChange)} className={`${regionalism_id.error}`} />{' '}
        <input ref="recipient_address" {...recipient_address} className={`form-control input-xs ${recipient_address.error} ${delivery_type.value == DELIVERY_TO_HOME ? '' : 'hidden'}`} type="text" />
        <Select ref="shop" options={delivery_shops} {...recipient_shop_address} className={`${recipient_shop_address.error} ${delivery_type.value == DELIVERY_TO_HOME ? 'hidden' : ''}`} />
      </div>
      {
        delivery_type.value == DELIVERY_TO_HOME
        ? <div className="form-group form-inline">
            <label>{'标志性建筑：'}</label>
            <input {...recipient_landmark} className={`form-control input-xs ${recipient_landmark.error}`} type="text" />
          </div>
        : null
      }
      <div className="form-group form-inline">
        <label>{'　配送中心：'}</label>
        <Select {...delivery_id} options={delivery_stations} className={`form-select transition ${delivery_id.error}`} ref="delivery_center" />
        {' '}
        <span className={this.state.auto_match_delivery_center ? 'text-success' : 'text-danger'}>
          {this.state.auto_match_msg}
        </span>
      </div>
      <div className="form-group form-inline">
        <label>{'　订单来源：'}</label>
        {
          order_srcs_level2.length 
            ? [
              <Select 
                  value={selected_order_src_level1_id} 
                  options={all_order_srcs[0]} 
                  onChange={this.orderSrcsLevel1Change.bind(this)} 
                  key="order_srcs_level1" 
                  className="form-select" />, ' ',
              <Select 
                  {...src_id} 
                  options={order_srcs_level2} 
                  key="order_srcs_level2" 
                  className={`form-select ${src_id.error}`} />
              ]
            : <Select 
                value={typeof selected_order_src_level1_id != 'undefined' ? src_id.value : SELECT_DEFAULT_VALUE} 
                options={all_order_srcs[0]} 
                onChange={this.orderSrcsLevel1Change.bind(this)} 
                key="order_srcs_level1" 
                className={`form-select ${src_id.error}`} />
        }
      </div>
      <div className="form-group form-inline">
        <label>{'　支付方式：'}</label>
       <Select {...pay_modes_id} options={all_pay_modes} onChange={this.onPayModesChange.bind(this, pay_modes_id.onChange)} className={`form-select ${pay_modes_id.error}`} />
      </div>
      {
        isThird
          ? (
              <div className="form-group form-inline">
                <label>{'　团购密码：'}</label>
                <input {...coupon} className={`form-control input-xs ${coupon.error}`} type="text" />{' '}
                <button onClick={this.checkGroupbuyPsd.bind(this)} data-submitting={groupbuy_check_ing} disabled={groupbuy_check_ing} className="btn btn-default btn-xs">验劵</button>
                {' '}
                <span className={'fadeIn animated ' + (groupbuy_success ? 'text-success' : 'text-danger')}>{groupbuy_msg}</span>
              </div>
            )
          : null
      }
      <div className="form-group form-inline">
        <label>{'　支付状态：'}</label>
        <Select {...pay_status} options={all_pay_status} ref="pay_status" className={`form-select ${pay_status.error}`} />
      </div>
      <div className="form-group form-inline">
        <label>{'　配送时间：'}</label>
        <DatePicker redux-form={delivery_date} lowerLimit={dateFormat(new Date())} className={`${delivery_date.error}`}/>{' '}
        <Select {...delivery_hours} options={all_delivery_time} className={`${delivery_hours.error}`} />
      </div>
      <div className="form-group form-inline">
        <label>{'　　　备注：'}</label>
        <textarea {...remarks} className="form-control input-xs" rows="2" cols="40"></textarea>
        {'　　'}
        <label>{'发票备注：'}</label>
        <textarea {...invoice} placeholder="" rows="2" cols="22" className={`form-control input-xs ${invoice.error}`} />
      </div>

      <hr className="dotted" />
      {this.props.children}
      <div className="form-group">
        {
          editable
          ? [
              <button
                  key="saveBtn" 
                  onClick={handleSubmit(this._check.bind(this, this.handleSaveOrder))} 
                  disabled={save_ing} 
                  data-submitting={save_ing} 
                  className="btn btn-theme btn-xs">保存信息</button>,
              '　　',
              <button
                  key="submitBtn"
                  onClick={handleSubmit(this._check.bind(this, this.handleSubmitOrder))}
                  data-submitting={submit_ing}
                  disabled={submit_ing} className="btn btn-theme btn-xs">提交</button>
            ]
          : <button 
                onClick={handleSubmit(this._check.bind(this, this.handleCreateOrder))} 
                disabled={save_ing} 
                data-submitting={save_ing} 
                className="btn btn-theme btn-xs">生成新订单</button>
        }
      </div>

      <HistoryOrders 
          ref="history_orders_modal"
          phone_num={owner_mobile.value} 
          data={history_orders}
          {...{getHistoryOrders, checkHistoryOrder, getCopyOrderById, copyOrder}} />
    </div>
    )
  }
  _check(callback, form_data){
    var { dispatch } = this.props;
    
    //redux-form的缘故，这里必须异步，否则errors为空对象
    setTimeout(() => {
      var { errors, dispatch, actions: {createOrder}, order_id } = this.props;
      var order_info = this.props['form-data'].data;
      if(!Object.keys(errors).length){
        form_data.delivery_time = form_data.delivery_date + ' ' + form_data.delivery_hours;
        delete form_data.delivery_date;
        delete form_data.delivery_hours;

        form_data.order_id = order_id;
        form_data.updated_time = order_info.updated_time;
        form_data.recipient_id = order_info.recipient_id;

        if( form_data.delivery_id == SELECT_DEFAULT_VALUE || !form_data.delivery_id){
          form_data.delivery_id = undefined;
          form_data.delivery_name = undefined;
        }else {
          form_data.delivery_name = this.findSelectedOptionText('delivery_center');
        }

        //拼接省市区
        form_data.prefix_address = (
          this.findSelectedOptionText('province') +
          this.findSelectedOptionText('city') +
          this.findSelectedOptionText('district')
        )
        //门店自提时，将门店id转换为 收货人详细地址
        if(form_data.delivery_type == DELIVERY_TO_STORE){
          form_data.recipient_address = this.findSelectedOptionText('shop');
          form_data.recipient_landmark = '';
        }
        //团购密码验证
        if( isSrc('团购网站', form_data.src_id) ){
          if( !this.state.groupbuy_checked ){
            Noty('warning', '请确定团购密码已验证通过'); return;
          }
        }

        callback.call(this, form_data);
      }else{
        Noty('warning', '请填写完整');
      }
    }, 0);
  }
  findSelectedOptionText(_refs){
    return $(findDOMNode(this.refs[_refs])).find('option:selected').html();
  }
  handleCreateOrder(form_data){
    this.props.actions.createOrder(form_data)
      .done(function(){
        Noty('success', '保存成功');
        history.push('/om/index');
      })
      .fail(function(msg, code){
        Noty('error', msg || '保存异常');
      });
  }
  handleSaveOrder(form_data){
    this.props.actions.saveOrder(form_data)
      .done(function(){
        Noty('success', '保存成功')
        this.props.actions.getOrderById(form_data.order_id).fail(function(){history.go(0);}.bind(this));
      }.bind(this))
      .fail(function(msg){
        Noty('error', msg || '保存异常');
      });
  }
  handleSubmitOrder(form_data){
    if(!form_data.delivery_id){
      Noty('warning', '请选择配送中心'); return;
    }
    this.props.actions.submitOrder(form_data).done(function(){
      Noty('success', '已成功提交！');
      history.push('/om/index');
    }).fail(function(msg){
      Noty('error', msg || '操作异常');
    });
  }
  componentDidMount(){
    var {getProvinces, getOrderSrcs, getDeliveryStations, getPayModes, triggerFormUpdate} = this.props.actions;
    getProvinces();
    getOrderSrcs();
    getPayModes();
    getDeliveryStations();

    this.autoMatchDeliveryStations(delivery_id => {
      delivery_id = delivery_id || SELECT_DEFAULT_VALUE;
      $(findDOMNode(this.refs.delivery_center)).val(delivery_id);
      triggerFormUpdate('add_order', 'delivery_id', delivery_id); //手动更改表单值后，需要使用该方法，主动触发redux-form进行更新，否则数据将不会同步
    }, () => {
      triggerFormUpdate('add_order', 'delivery_id', SELECT_DEFAULT_VALUE)
    });

    LazyLoad('noty');

    $(findDOMNode(this.refs.delivery_center)).on('click', this.clearMsg.bind(this))
  }
  componentWillUnmount(){
    $(findDOMNode(this.refs.delivery_center)).off('click', this.clearMsg.bind(this))
  }
  clearMsg(){
    $(findDOMNode(this.refs.delivery_center)).removeClass('alert-success alert-danger')
    this.setState({auto_match_msg: ''})
  }
  onProvinceChange(callback, e){
    var {value} = e.target;
    this.props.actions.provinceReset();
    if(value != this.refs.province.props['default-value'])
      this.props.actions.getCities(value);
    callback(e);
  }
  onCityChange(callback, e){
    var {value} = e.target;
    this.props.actions.cityReset();
    if(value != this.refs.city.props['default-value'])
      this.props.actions.getDistricts(value);
    callback(e);
  }
  onDistrictChange(callback, e){
    var {value} = e.target;
    this.props.actions.districtReset();
    if(value != this.refs.district.props['default-value'])
      this.props.actions.getDeliveryShops(value);
    callback(e);
  }
  onPayModesChange(callback, e){
    // $(findDOMNode(this.refs.pay_status)).val('COD');
    // console.log('pay_modes change');
    callback(e);
  }
  orderSrcsLevel1Change(e){
    var { value } = e.target;
    var all_order_srcs = this.props['form-data'].all_order_srcs;
    //如果没有二级订单来源，则表明只是一个一级来源
    if(all_order_srcs[1] && !all_order_srcs[1].filter(n => n.parent_id == value).length){
      this.props.actions.triggerFormUpdate('add_order', 'src_id', value); //此时只能模拟form表单更新
    }else{
      this.props.actions.resetFormUpdate('add_order', 'src_id');
    }
    this.setState({selected_order_src_level1_id: value});
  }
  addProducts(){
    this.refs.productsModal.show();
  }
  showHistoryModal(){
    this.refs.history_orders_modal.show();
  }
  checkGroupbuyPsd(){
    var { fields: { city_id, coupon } } = this.props;
    coupon = coupon.value && coupon.value.trim();
    var city_name;
    if( city_id.value && city_id.value != SELECT_DEFAULT_VALUE ){
      city_name = this.findSelectedOptionText('city');
      city_name = city_name.substring(0, city_name.length - 1);
    }else{
      Noty('warning', '请先选择收货人所在城市'); return;
    }
    if(coupon && uForm.isCoupon(coupon)){
      this.setState({ groupbuy_check_ing: true });
      this.props.actions.checkGroupbuyPsd({coupon, city_name})
        .done((data, msg) => {
          this.setState({ groupbuy_success: true, groupbuy_msg: msg || <i className="fa fa-check"></i>})
        })
        .fail((msg) => {
          this.setState({ groupbuy_success: false, groupbuy_msg: msg || '团购券验证有误，请手动确认！'})
        })
        .always(() => {
          this.setState({ groupbuy_check_ing: false, groupbuy_checked: true })
        })
    }else{
      Noty('warning', '请填写正确的团购密码');
    }
  }
}

ManageAddForm.PropTypes = {
  form: PropTypes.shape({
    all_delivery_time: PropTypes.array.isRequired,
    all_pay_status: PropTypes.array.isRequired,
    all_order_srcs: PropTypes.array.isRequired,
    delivery_stations: PropTypes.array.isRequired,
    all_pay_modes: PropTypes.array.isRequired,
    save_ing: PropTypes.bool.isRequired,
    save_success: PropTypes.bool.isRequired
  }).isRequired,
  area: PropTypes.shape({
    provinces: PropTypes.array.isRequired, 
    cities: PropTypes.array.isRequired, 
    districts: PropTypes.array.isRequired
  }).isRequired,

  actions: PropTypes.shape({
    getProvinces: PropTypes.func.isRequired,
    getOrderSrcs: PropTypes.func.isRequired,
    getDeliveryStations: PropTypes.func.isRequired,
    getPayModes: PropTypes.func.isRequired,
    createOrder: PropTypes.func.isRequired,
  }).isRequired,

  editable: PropTypes.bool.isRequired,
  order_id: PropTypes.any.isRequired,
}

export default function initManageOrderForm( initFunc ){
  return reduxForm({
    form: 'add_order',  //表单命名空间
    fields: FormFields.add_order,
    validate,
    touchOnBlur: true,
  }, initFunc)( ManageAddForm );
}
