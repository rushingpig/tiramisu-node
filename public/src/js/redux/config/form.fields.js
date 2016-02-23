export default {
  add_order: [
    'delivery_type',
    'owner_name',
    'owner_mobile',
    'recipient_name', //下单人姓名
    'recipient_mobile',
    'recipient_address', //收货人详细地址----》送货上门
    'recipient_shop_address', //收货人详细地址----》门店自提(实际上是门店地址)
    'province_id',
    'city_id',
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
    '_update', //业务无关的私有field，用于触发整个form的更新
  ]
}