# 2016-04-27 Zhanzhao Liang
INSERT INTO `dict_regionalism` VALUES
   ('442027', '中山市', '442000', '中山', '3', '0760', '528400', '中国,广东省,中山市,中山市', '113.378835', '22.52522', 'Zhongshan', '1', null, null);
INSERT INTO `buss_product_category` VALUES (15, 0, '配件', 0, 1, now(), null, null, 1);

# 2016-04-28 Kaiming Zeng
INSERT INTO `buss_order_src` (`id`,`parent_id`,`parent_ids`,`level`,`name`,`sort`,`created_by`,`created_time`,`updated_by`,`updated_time`,`del_flag`,`merge_name`,`remark`)
VALUES (57,0,'0,57',1,'东方福利网',0,1,'2016-04-28 11:26:31',NULL,NULL,1,'东方福利网',NULL);
INSERT INTO `buss_order_src` (`id`,`parent_id`,`parent_ids`,`level`,`name`,`sort`,`created_by`,`created_time`,`updated_by`,`updated_time`,`del_flag`,`merge_name`,`remark`)
VALUES (58,48,'48,58',2,'淘宝',0,1,'2016-04-28 11:26:55',NULL,NULL,1,'电商平台,淘宝',NULL);

# 2016-04-30 Zhanzhao Liang
INSERT INTO `dict_regionalism` VALUES
  ('130103', '桥东区', '130100', '桥东', '3', '0311', '050091', '中国,河北省,石家庄市,桥东区', '114.46977', '38.03221', 'Qiaodong', '1', null, null),
  ('320601', '开发区', '320600', '开发', '3', '0513', '226001', '中国,江苏省,南通市,开发区', '120.8573', '32.0098', 'Kaifa', '1', null, null);

# 2016-05-05 Zhenglin Zhu
# 全文检索加入<验券券号>\<下单人手机号后5位>\<收货人手机号后5位>
ALTER TABLE `tiramisu`.`buss_order_fulltext` ADD COLUMN `coupon` varchar(50) NOT NULL DEFAULT 'NONE' COMMENT '验券的券号' AFTER `deliveryman_mobile`,
ADD COLUMN `recipient_mobile_suffix` varchar(5) NOT NULL DEFAULT '00000' COMMENT '收货人手机号后5位' AFTER `coupon`,
ADD COLUMN `owner_mobile_suffix` varchar(5) NOT NULL DEFAULT '00000' COMMENT '下单人手机号后5位' AFTER `recipient_mobile_suffix`,
DROP INDEX `IDX_FL`,
ADD FULLTEXT `IDX_FL` (`owner_name`, `owner_mobile`, `recipient_name`, `recipient_mobile`, `recipient_address`, `landmark`, `show_order_id`, `merchant_id`, `coupon`, `recipient_mobile_suffix`, `owner_mobile_suffix`) comment '';

# 审核重新打印列表建立索引
ALTER TABLE `tiramisu`.`buss_print_apply` ADD INDEX `IDX_SHOW_ORDER_ID` (`show_order_id`) comment '在页面上展示的订单号建立索引，便于查询';

# 2016-05-09 Wei Zhao
# 订单配送记录表
CREATE TABLE `buss_delivery_record` (
    `id` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT '记录编号',
    `order_id` int(11) NOT NULL COMMENT '订单id',
    `deliveryman_id` int(11) NOT NULL COMMENT '配送员id',
    `delivery_pay` int(11) NOT NULL COMMENT '配送工资',
    `delivery_count` int(11) NOT NULL DEFAULT '1' COMMENT '配送次数',
    `is_review` tinyint(1) DEFAULT '0' COMMENT '审核标志（0：未审核；1：已审核）',
    `updated_by` int(11) NOT NULL COMMENT '记录更新操作者id',
    `updated_time` datetime DEFAULT NULL COMMENT '记录更新时间',
    `remark` varchar(255) DEFAULT NULL COMMENT '备注',
    PRIMARY KEY (`id`),
    UNIQUE KEY `IDX_ORDER_ID` (`order_id`),
    KEY `IDX_DM_ID` (`deliveryman_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='订单配送记录表';

# 2016-05-09 Wei Zhao
# 配送成功图片凭证
CREATE TABLE `buss_delivery_picture` (
    `order_id` int(11) NOT NULL COMMENT '订单id',
    `deliveryman_id` int(11) NOT NULL COMMENT '配送员id',
    `delivery_count` int(11) NOT NULL DEFAULT '1' COMMENT '第几次配送',
    `picture_type` enum  ('RECEIPT','DOOR','CALL','SMS') NOT NULL COMMENT '单据，门牌，通话记录，短信记录',
    `picture_url` varchar(255) NOT NULL COMMENT '图片url',
    UNIQUE KEY `IDX_UNIQUE` (`order_id`,`delivery_count`,`picture_type`),
    KEY `IDX_ORDER_ID` (`order_id`),
    KEY `IDX_DM_ID` (`deliveryman_id`),
    KEY `IDX_DC` (`delivery_count`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='配送成功图片凭证';
INSERT INTO `buss_delivery_picture` VALUES
    (10000001, 1, 1, 'RECEIPT', 'http://picture.xfxb.net/receipt_1.jpg'),
    (10000001, 1, 1, 'DOOR', 'http://picture.xfxb.net/door_1.jpg'),
    (10000001, 1, 1, 'CALL', 'http://picture.xfxb.net/call_1.jpg'),
    (10000001, 1, NULL, 'SMS', 'http://picture.xfxb.net/sms_1.jpg');

# 2016-05-10 Wei Zhao
# 增加pos相关字段
ALTER TABLE `tiramisu`.`buss_order` ADD COLUMN `pos_id` varchar(32) DEFAULT NULL COMMENT 'pos终端号';
ALTER TABLE `tiramisu`.`buss_order` ADD COLUMN `is_pos_pay` tinyint(1) DEFAULT NULL COMMENT 'pos支付标志';

# 2016-05-17 Wei Zhao
# 创建产品配送工资计算规则对应表
CREATE TABLE `delivery_pay_rule` (
    `category_id` int(11) NOT NULL COMMENT '产品类型',
    `rule_type` enum  ('CAKE','COOKIE','WINE','SOUVENIR') NOT NULL DEFAULT 'UNTREATED' COMMENT '蛋糕，下午茶/曲奇，红酒，手信',
    `del_flag` tinyint(1) NOT NULL DEFAULT '1' COMMENT '软删除标志',
    PRIMARY KEY (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='创建产品配送工资计算规则对应表';
INSERT INTO `delivery_pay_rule` VALUES
    (1, 'CAKE', 1),
    (3, 'SOUVENIR', 1),
    (4, 'COOKIE', 1),
    (5, 'COOKIE', 1),
    (6, 'SOUVENIR', 1),
    (7, 'SOUVENIR', 1),
    (8, 'SOUVENIR', 1),
    (10, 'CAKE', 1),
    (11, 'CAKE', 1),
    (12, 'CAKE', 1),
    (13, 'CAKE', 1),
    (14, 'CAKE', 1);