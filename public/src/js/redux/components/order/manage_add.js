import React, {Component, PropTypes} from 'react';
import {findDOMNode} from 'react-dom';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
// import { bindActionCreators } from 'redux';
import * as AreaActions from '../../actions/area';
import * as OrderAddActions from '../../actions/order_manage_add';
import MyMap from '../../utils/MyMap';
import DatePicker from '../common/datepicker';
import Select from '../common/select';
import Pagination from '../common/pagination';
import { DELIVERY_TO_HOME, DELIVERY_TO_STORE,
  SELECT_DEFAULT_VALUE, INVOICE } from '../../config/app.config';

class TopHeader extends Component {
  render(){
    return (
      <div className="clearfix top-header">
        <div className="pull-right line-router">
          <span className="node">总订单页面</span>
          <span>{'　/　'}</span>
          <span className="node active">添加订单</span>
        </div>
      </div>
    )
  }
}

const validate = (values, {form}) => {
  const errors = {};
  var msg = 'error';
  function _v(key){
    // touched 为true 表示用户点击处理过
    if (form[key] && form[key].touched && !values[key])
      errors[key] = msg;
  }
  function _v_s(key){
    if(form[key] && form[key].touched && (!values[key] || values[key] == SELECT_DEFAULT_VALUE))
      errors[key] = msg;
  }
  _v('owner_name');
  _v('owner_mobile');
  _v('recipient_name');
  _v('recipient_mobile');
  _v('recipient_address');
  _v('recipient_landmark');
  _v('delivery_date');

  _v_s('regionalism_id');
  _v_s('delivery_id');
  _v_s('src_id');
  _v_s('pay_modes_id');
  _v_s('pay_status');
  _v_s('delivery_hours');
  console.log(errors);
  return errors;
};

class ManageAddPannel extends Component {
  constructor(props){
    super(props);
    this.state = {
      invoices: [{id: INVOICE.NO, text: '不需要'}, {id: INVOICE.YES, text: '需要'}],
      selected_order_src_level1_id: SELECT_DEFAULT_VALUE
    }
  }
  render(){
    var {
      handleSubmit,
      submitting,
      handleSaveInfo,
      fields: {
        delivery_type,
        owner_name,
        owner_mobile,
        recipient_name, //下单人姓名
        recipient_mobile,
        recipient_address, //收货人详细地址----》送货上门
        regionalism_id,    //分店ID ----》自取
        recipient_landmark, //标志性建筑
        delivery_id,     //配送中心
        src_id,          //订单来源
        pay_modes_id,    //支付方式
        pay_status,
        // delivery_time, //总配送时间：delivery_date + delivery_time
        delivery_date,  //配送日期
        delivery_hours, //配送时段：几点到几点
        remarks,
        invoice,
      }
    } = this.props;
    var {all_delivery_time, all_pay_status, all_order_srcs, delivery_stations} = this.props.addForm;
    var {provinces, cities, districts} = this.props.area;
    var {invoices, selected_order_src_level1_id} = this.state;

    var order_srcs_level2 = all_order_srcs.length > 1
      ? all_order_srcs[1].filter(n => n.parent_id == selected_order_src_level1_id)
      : [];

    return (
      <div className="order-manage">

        <TopHeader />

        <div className="panel">
          <header className="panel-heading">订单详情</header>
          <div className="panel-body">
            <form>
            <div className="form-group form-inline">
              <label className="control-label">{'　配送方式：'}</label>
              <label>
                <input type="radio" 
                  {...delivery_type}
                  value={DELIVERY_TO_HOME}
                  checked={delivery_type.value == DELIVERY_TO_HOME} /> 陪送上门</label>
              {'　'}
              <label>
                <input type="radio" 
                  {...delivery_type}
                  value={DELIVERY_TO_STORE}
                  checked={delivery_type.value == DELIVERY_TO_STORE} /> 门店自提</label>
            </div>
            <div className="form-group form-inline">
              <label>{'下单人姓名：'}</label>
              <input {...owner_name} className={`form-control input-sm ${owner_name.error}`} type="text" />
            </div>
            <div className="form-group form-inline">
              <label>{'下单人手机：'}</label>
              <input {...owner_mobile} className={`form-control input-sm ${ owner_mobile.error }`} type="text" />{'　'}
              <button className="btn btn-default btn-sm">查询历史订单</button>{' '}
              <button className="btn btn-default btn-sm">拨号</button>
            </div>
            <div className="form-group form-inline">
              <label>{'收货人姓名：'}</label>
              <input {...recipient_name} className={`form-control input-sm ${recipient_name.error}`} type="text" />
            </div>
            <div className="form-group form-inline">
              <label>{'收货人手机：'}</label>
              <input {...recipient_mobile} className={`form-control input-sm ${recipient_mobile.error}`} type="text" />
            </div>
            <div className="form-group form-inline">
              <label>{delivery_type.value == DELIVERY_TO_HOME ? '收货人地址：' : '　选择分店：'}</label>
              <Select ref="province" options={provinces} onChange={this.onProvinceChange.bind(this)} />{' '}
              <Select ref="city" options={cities} onChange={this.onCityChange.bind(this)} />{' '}
              <Select ref="district" options={districts} {...regionalism_id} className={`${regionalism_id.error}`} />{' '}
              <input ref="recipient_address" {...recipient_address} className={`form-control input-sm ${recipient_address.error}`} type="text" />
            </div>
            {
              delivery_type.value == DELIVERY_TO_HOME
              ? <div className="form-group form-inline">
                  <label>{'标志性建筑：'}</label>
                  <input {...recipient_landmark} className={`form-control input-sm ${recipient_landmark.error}`} type="text" />
                </div>
              : null
            }
            <div className="form-group form-inline">
              <label>{'　配送中心：'}</label>
              <Select {...delivery_id} options={delivery_stations} className={`form-select ${delivery_id.error}`} />
            </div>
            <div className="form-group form-inline">
              <label>{'　订单来源：'}</label>
              {
                all_order_srcs.length == 1 //2级
                ? <Select {...src_id} options={all_order_srcs[0]} key="order_srcs_level1" className={`form-select ${src_id.error}`} />
                : [
                    <Select options={all_order_srcs[0]} onChange={this.orderSrcsLevel1Change.bind(this)} key="order_srcs_level1" className="form-select" />,
                    ' ',
                    (order_srcs_level2.length ? <Select {...src_id} options={order_srcs_level2} key="order_srcs_level2" className={`form-select ${src_id.error}`} />  : null)
                  ]
              }
            </div>
            <div className="form-group form-inline">
              <label>{'　支付方式：'}</label>
             <Select {...pay_modes_id} options={[]} className={`form-select ${pay_modes_id.error}`} />
            </div>
            <div className="form-group form-inline">
              <label>{'　支付状态：'}</label>
              <Select {...pay_status} options={all_pay_status} className={`form-select ${pay_status.error}`} />
            </div>
            <div className="form-group form-inline">
              <label>{'　配送时间：'}</label>
              <DatePicker redux-form={delivery_date} className={`${delivery_date.error}`}/>{' '}
              <Select {...delivery_hours} options={all_delivery_time} className={`${delivery_hours.error}`} />
            </div>
            <div className="form-group form-inline">
              <label>{'　　　备注：'}</label>
              <textarea {...remarks} className="form-control input-sm" rows="2" cols="40"></textarea>
              {'　　'}
              <label>{'发票备注：'}</label>
              <Select {...invoice} options={invoices} className={`${invoice.error}`} no-default="true" />
            </div>
            </form>

            <hr className="dotted" />

            <div className="form-group">
              选择产品：<button className="btn btn-sm btn-theme">添加</button>
            </div>
            <div className="table-responsive">
              <table className="table text-center">
                <thead>
                <tr>
                  <th>产品名称</th>
                  <th>规格</th>
                  <th>原价</th>
                  <th>数量</th>
                  <th>实际售价</th>
                  <th>应收金额</th>
                  <th>巧克力牌</th>
                  <th>祝福贺卡</th>
                  <th>产品图册</th>
                  <th>自定义名称</th>
                  <th>自定义描述</th>
                  <th>操作</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                  <td>自由拼</td>
                  <td>约2磅</td>
                  <td>138</td>
                  <td>1</td>
                  <td>69</td>
                  <td>0</td>
                  <td>妈妈生日快乐</td>
                  <td>生日快乐</td>
                  <td><input type="checkbox" /></td>
                  <td>单恋黑森林，榴莲香雪，梨子沙滩，夏日鲜果</td>
                  <td>2磅1/4，方形</td>
                  <td className="nowrap">
                    <a href="javascript:;">[编辑]</a>{' '}<a href="javascript:;">[删除]</a>
                  </td>
                </tr>
                </tbody>
              </table>
            </div>

            <div className="form-group">
              <button onClick={handleSubmit(this.mergeState)} disabled={submitting} className="btn btn-theme btn-sm">保存信息</button>
              {'　　　'}
              <button className="btn btn-theme btn-sm">保存</button>
            </div>

          </div>
        </div>
      </div>
    )
  }
  componentDidMount(){
    var {getProvinces, getOrderSrcs, getDeliveryStations} = this.props;
    getProvinces();
    getOrderSrcs();  //有问题

    var self = this;

    //初始化地图
    MyMap.create( (map) => {
      self._bmap = map;
    });

    $(this.refs.recipient_address).on('blur', (e) => {
      var detail = e.target.value;
      if(detail){
        let province = $(findDOMNode(self.refs.province)).find('option:selected').text();
        let city = $(findDOMNode(self.refs.city)).find('option:selected').text();
        let district = $(findDOMNode(self.refs.district)).find('option:selected').text();
        let default_text = self.refs.province.props['default-text'];
        if(province != default_text && city != default_text && district != default_text){
          if(BMap){
            let map = self._bmap;
            map.centerAndZoom(city);
            let localSearch = new BMap.LocalSearch(map);
            localSearch.setSearchCompleteCallback( (searchResult) => {
              var poi = searchResult.getPoi(0);
              console.log(poi.point.lng + "," + poi.point.lat);
              getDeliveryStations({
                lng: poi.point.lng,
                lat: poi.point.lat
              })
            });
            localSearch.search(district + detail);
          }else{
            alert('地图服务加载失败，请好后再试');
          }
        }
      }
    });
  }
  onProvinceChange(e){
    var {value} = e.target;
    value != this.refs.province.props['default-value']
      ? this.props.getCities(value)
      : this.props.provinceReset();
  }
  onCityChange(e){
    var {value} = e.target;
    value != this.refs.city.props['default-value']
      ? this.props.getDistricts(value)
      : this.props.cityReset();
  }
  orderSrcsLevel1Change(e){
    this.setState({selected_order_src_level1_id: e.target.value})
  }
  mergeState(data){
    console.log(data);
    return data;
  }
}

ManageAddPannel = reduxForm({
  form: 'add_order',  //表单命名空间
  fields: [
    'delivery_type',
    'owner_name',
    'owner_mobile',
    'recipient_name', //下单人姓名
    'recipient_mobile',
    'recipient_address', //收货人详细地址----》送货上门
    'regionalism_id',    //分店ID ----》自取
    'recipient_landmark', //标志性建筑
    'delivery_id',     //配送中心
    'src_id',          //订单来源
    'pay_modes_id',
    'pay_status',
    // 'delivery_time',
    'delivery_date',
    'delivery_hours',
    'remarks',
    'invoice',
  ],
  validate,
  touchOnBlur: true
}, state => ({
  //赋初始值
  initialValues: {
    delivery_type: DELIVERY_TO_HOME,
    invoice: INVOICE.NO,
  }
}))( ManageAddPannel );

function mapStateToProps({orderManageAdd}){
  return orderManageAdd;
}

export default connect(mapStateToProps, {
  ...AreaActions, ...OrderAddActions
})(ManageAddPannel);
