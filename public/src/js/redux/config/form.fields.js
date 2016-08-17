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
    'new_merchant_id', //商户订单号
    'pay_modes_id',
    'coupon',          //团购密码
    'pay_status',
    // 'delivery_time',
    'delivery_date',
    'delivery_hours',
    'remarks',
    'invoice',
    '_update', //业务无关的私有field，用于触发整个form的更新
  ],
  add_user:[
    'username',
    'pwd',
    'name',
    'mobile',
    'dept_id',
    'tmp_roles',
    'role_ids',
    'province_id',
    'tmp_cities',
    'city_ids',
    'tmp_stations',
    'tmp_stations_national',
    'station_ids',
    'cities_in',
    'stations_in',
    'roles_in',
    'is_national',
    'en_delivery',
  ],
  add_city:[
    'is_county',
    'sec_order',
    'city_id',
    'order_time',
    'delivery_time_range',
    'is_diversion',
    'manager_mobile',
    'manager_name',
    'remarks',
    'online_time_date',
    'online_time_hour',
    'online_time_min',
    'first_open_regions',
    'sec_open_regions',
    'sec_order_time',
  ]
}