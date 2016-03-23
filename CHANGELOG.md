### v0.1.8
* Backend:
 * Zhanzhao LIANG: 导入旧商城配送站信息

### v0.1.7 (22 Mar 2016)
* Frontend:
 * Bo XIONG: update auto match delivery station
* Backend:
 * Zhanzhao LIANG: 修正提交订单修改时update_time无法通过验证

### v0.1.5 (20 Mar 2016)
* Backend:
 * Zhanzhao LIANG: 使用node-mysql的transaction，移除mysql-queue库
 * Zhenglin ZHU: 增加订单的配送时间，订单sku的订单号索引，优化订单导出excel时间
 * Kaiming ZENG: 添加配送站范围坐标添加事务处理

### v0.1.3 (18 Mar 2016)
* Backend:
 * Zhenglin ZHU: fix missing connection release in baseDao

### v0.1.2 (17 Mar 2016)
* Frontend:
 * Bo XIONG:修正无法查询sku
* BackEnd:
 * Zhanzhao LIANG:非授权IP访问 /v1/i/* 会在返回response带上该非授权IP
 * Zhanzhao LIANG:修正 /v1/i/order 没有 prefix_address 字段问题
 * Zhenglin ZHU:增加订单最后客服操作人员的记录
 * Zhenglin ZHU:增加生产环境日志的输出
 * Zhenglin ZHU:fix the issue when the bodyParse thtrow exception
 * Zhenglin ZHU:导出订单excel增加最后客服操作人

### v0.1.1 (15 Mar 2016)
### v0.1.0 (14 Mar 2016)
