import React, {Component, PropTypes} from 'react';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
// import { bindActionCreators } from 'redux';
import * as AreaActions from '../../actions/area';
import * as OrderAddActions from '../../actions/order_manage_add';
import DatePicker from '../common/datepicker';
import Select from '../common/select';
import Pagination from '../common/pagination';
import { DISTRIBUTE_TO_HOME, DISTRIBUTE_TO_STORE } from '../../config/app.config';

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

class ManageAddPannel extends Component {
  constructor(props){
    super(props);
  }
  render(){
    var {
      handleSubmit,
      submitting,
      handleSaveInfo,
      fields: {
        distribute_type,
        owner_name,
        owner_mobile,
        recipient_name, //下单人姓名
        recipient_mobile,
        recipient_address, //收货人详细地址----》送货上门
        regionalism_id,    //分店ID ----》自取
        recipient_landmark, //标志性建筑
        delivery_id,     //配送中心
        src_id,          //订单来源
        pay_modes_id,
        pay_status,
        delivery_time,
        remarks,
        invoice,
      },

      all_pay_status,
    } = this.props;
    var {provinces, cities, districts} = this.props.area;
    return (
      <div className="order-manage">

        <TopHeader />

        <div className="panel">
          <header className="panel-heading">订单列表</header>
          <div className="panel-body">
            <form>
            <div className="form-group form-inline">
              <label className="control-label">{'　配送方式：'}</label>
              <label>
                <input type="radio" 
                  {...distribute_type}
                  value={DISTRIBUTE_TO_HOME}
                  checked={distribute_type.value == DISTRIBUTE_TO_HOME} /> 陪送上门</label>
              {'　'}
              <label>
                <input type="radio" 
                  {...distribute_type}
                  value={DISTRIBUTE_TO_STORE}
                  checked={distribute_type.value == DISTRIBUTE_TO_STORE} /> 门店自提</label>
            </div>
            <div className="form-group form-inline">
              <label>{'下单人姓名：'}</label>
              <input {...owner_name} className="form-control input-sm" type="text" />
            </div>
            <div className="form-group form-inline">
              <label>{'下单人手机：'}</label>
              <input {...owner_mobile} className="form-control input-sm" type="text" />{'　'}
              <button className="btn btn-default btn-sm">查询历史订单</button>{' '}
              <button className="btn btn-default btn-sm">拨号</button>
            </div>
            <div className="form-group form-inline">
              <label>{'收货人姓名：'}</label>
              <input {...recipient_name} className="form-control input-sm" type="text" />
            </div>
            <div className="form-group form-inline">
              <label>{'收货人手机：'}</label>
              <input {...recipient_mobile} className="form-control input-sm" type="text" />
            </div>
            <div className="form-group form-inline">
              <label>{distribute_type.value == DISTRIBUTE_TO_HOME ? '收货人地址：' : '　选择分店：'}</label>
              <Select ref="Select" options={provinces} onChange={this.onProvinceChange.bind(this)} />{' '}
              <Select options={cities} onChange={this.onCityChange.bind(this)} />{' '}
              <Select options={districts} />{' '}
              <input className="form-control input-sm" type="text" />
            </div>
            {
              distribute_type.value == DISTRIBUTE_TO_HOME
              ? <div className="form-group form-inline">
                  <label>{'标志性建筑：'}</label>
                  <input {...recipient_landmark} className="form-control input-sm" type="text" />
                </div>
              : null
            }
            <div className="form-group form-inline">
              <label>{'　配送中心：'}</label>
              <Select options={[]} className="form-select" />
            </div>
            <div className="form-group form-inline">
              <label>{'　订单来源：'}</label>
              <Select options={[]} className="form-select" />
            </div>
            <div className="form-group form-inline">
              <label>{'　支付方式：'}</label>
             <Select options={[]} className="form-select" />
            </div>
            <div className="form-group form-inline">
              <label>{'　支付状态：'}</label>
              <Select options={all_pay_status} className="form-select" />
            </div>
            <div className="form-group form-inline">
              <label>{'　配送时间：'}</label>
              <input className="form-control input-sm" type="text" />
            </div>
            <div className="form-group form-inline">
              <label>{'　　　备注：'}</label>
              <textarea {...remarks} className="form-control input-sm" rows="2" cols="40"></textarea>
              {'　　'}
              <label>{'发票备注：'}</label>
              <Select />{'　　'}
              <button onClick={handleSubmit(handleSaveInfo)} disabled={submitting} className="btn btn-theme btn-sm">保存信息</button>
            </div>
            </form>
          </div>
        </div>
      </div>
    )
  }
  componentDidMount(){
    this.props.getProvinces();
  }
  onProvinceChange(e){
    var {value} = e.target;
    value != this.refs.Select.props['default-value']
      ? this.props.getCities(value)
      : this.props.provinceReset();
  }
  onCityChange(e){
    var {value} = e.target;
    value != this.refs.Select.props['default-value']
      ? this.props.getDistricts(value)
      : this.props.cityReset();
  }
}

ManageAddPannel = reduxForm({
  form: 'add_order',  //表单命名空间
  fields: [
    'distribute_type',
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
    'delivery_time',
    'remarks',
    'invoice',
  ]
}, state => ({
  //赋初始值
  initialValues: {
    distribute_type: DISTRIBUTE_TO_STORE
  }
}))( ManageAddPannel );

function mapStateToProps({orderManageAdd}){
  var {addForm, area} = orderManageAdd;
  return {...addForm, area};
}

export default connect(mapStateToProps, {
  ...AreaActions, ...OrderAddActions
})(ManageAddPannel);
