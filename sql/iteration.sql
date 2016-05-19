# 2016-04-27 Zhanzhao Liang
INSERT INTO `dict_regionalism` VALUES
   ('442027', '中山市', '442000', '中山', '3', '0760', '528400', '中国,广东省,中山市,中山市', '113.378835', '22.52522', 'Zhongshan', '1', null, null);

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
DROP TABLE IF EXISTS `buss_delivery_record`;
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
DROP TABLE IF EXISTS `buss_delivery_picture`;
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
DROP TABLE IF EXISTS `delivery_pay_rule`;
CREATE TABLE `delivery_pay_rule` (
    `category_id` int(11) NOT NULL COMMENT '产品类型',
    `rule_type` enum  ('CAKE','COOKIE','WINE','SOUVENIR') NOT NULL COMMENT '蛋糕，下午茶/曲奇，红酒，手信',
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

DROP TABLE IF EXISTS `buss_product_category_regionalism`;
CREATE TABLE `buss_product_category_regionalism` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `category_id` int(10) unsigned NOT NULL COMMENT '分类id',
  `regionalism_id` int(10) unsigned NOT NULL COMMENT '区域id',
  `sort` int(10) unsigned NOT NULL DEFAULT '4294967295' COMMENT '排序权重',
  `channel` enum('PC') DEFAULT 'PC' COMMENT 'PC端',
  `created_by` int(10) unsigned NOT NULL COMMENT '创建人',
  `created_time` datetime NOT NULL COMMENT '创建时间',
  `updated_by` int(10) unsigned DEFAULT NULL COMMENT '更新者',
  `updated_time` datetime DEFAULT NULL COMMENT '更新时间',
  `del_flag` tinyint(1) NOT NULL DEFAULT '1' COMMENT '删除标志',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=594 DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='分类-区域';

ALTER TABLE `tiramisu`.`buss_product_category` DROP COLUMN `sort`;
ALTER TABLE `tiramisu`.`buss_product_category`
ADD COLUMN `remarks` varchar(255) DEFAULT NULL COMMENT '备注信息' AFTER `name`;
ALTER TABLE `tiramisu`.`buss_product_category`
ADD COLUMN `isAddition` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '是否为附加商品，1表示是，0表示否' AFTER `remarks`;

ALTER TABLE `tiramisu`.`buss_product` 
DROP COLUMN `original_price`,
ADD COLUMN `detail_page` varchar(255) NULL COMMENT '商品网站详情页' AFTER `category_id`,
ADD COLUMN `created_by` INT(255) NULL DEFAULT NULL COMMENT '创建人' AFTER `detail_page`,
ADD COLUMN `created_time` DATETIME NULL DEFAULT NULL AFTER `created_by`,
ADD COLUMN `updated_by` INT(255) NULL DEFAULT NULL COMMENT '更新人' AFTER `created_time`,
ADD COLUMN `updated_time` DATETIME NULL DEFAULT NULL AFTER `updated_by`,
ADD COLUMN `del_flag` TINYINT(1) NULL DEFAULT 1 AFTER `updated_time`;

ALTER TABLE `tiramisu`.`buss_product_sku` 
DROP INDEX `IDX_PRODUCT_SIZE_WEBSITE`,
DROP COLUMN `is_local_site`,
DROP COLUMN `is_delivery`,
CHANGE COLUMN `del_flag` `del_flag` TINYINT(1) NULL DEFAULT 1,
ADD COLUMN `original_price` INT(8) NULL DEFAULT '0' COMMENT '产品原价（单位：分）' AFTER `price`,
ADD COLUMN `book_time` INT(4) NOT NULL DEFAULT '0' COMMENT '第一预约时间' AFTER `original_price`,
ADD COLUMN `presell_start` DATETIME NULL DEFAULT NULL COMMENT '预售上架开始时间' AFTER `book_time`,
ADD COLUMN `presell_end` DATETIME NULL DEFAULT NULL COMMENT '预售上架结束时间' AFTER `presell_start`,
ADD COLUMN `send_start` DATETIME NULL DEFAULT NULL COMMENT '预售发货开始时间' AFTER `presell_end`,
ADD COLUMN `send_end` DATETIME NULL DEFAULT NULL COMMENT '预售发货结束时间' AFTER `send_start`,
ADD COLUMN `activity_price` INT(8) NULL DEFAULT NULL COMMENT '活动价格' AFTER `send_end`,
ADD COLUMN `ref` INT(10) NULL DEFAULT NULL COMMENT '活动前原skuid' AFTER `activity_price`,
ADD COLUMN `activity_start` DATETIME NULL DEFAULT NULL COMMENT '活动开始时间' AFTER `ref`,
ADD COLUMN `activity_end` DATETIME NULL DEFAULT NULL COMMENT '活动结束时间' AFTER `activity_start`,
ADD COLUMN `expire_flag` tinyint(1) NOT NULL DEFAULT '1' COMMENT '过期标记，1为当前有效，0为过期失效' AFTER `activity_end`;

DROP TABLE IF EXISTS `buss_product_sku_booktime`;
CREATE TABLE `buss_product_sku_booktime` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sku_id` int(10) NOT NULL COMMENT 'skuid',
  `book_time` int(4) NOT NULL COMMENT '预约时间',
  `regionalism_id` int(10) NOT NULL COMMENT '区域id',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='sku第二预约时间';

SET GLOBAL event_scheduler = ON;

DROP EVENT IF EXISTS Expire_Activity_Time;
DELIMITER //
CREATE EVENT Expire_Activity_Time
On SCHEDULE EVERY 1 MINUTE
COMMENT '定时结束活动sku，开启原有sku'
DO
BEGIN
  DECLARE done INT DEFAULT FALSE;
  DECLARE sku_id,ref_id INT;
  DECLARE cur CURSOR FOR SELECT id,ref FROM buss_product_sku where activity_start > now() or activity_end < now() and expire_flag = 1 and del_flag = 1;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
  OPEN cur;
  read_loop: LOOP
    FETCH cur into sku_id,ref_id;
    IF done THEN
      LEAVE read_loop;
    END IF;
    update buss_product_sku set expire_flag = 0 where id = sku_id;
    update buss_product_sku set expire_flag = 1 where id = ref_id;
  END LOOP;
  CLOSE cur;
END;//

DROP EVENT IF EXISTS Expire_Presell_Time;
DELIMITER //
CREATE EVENT Expire_Presell_Time
On SCHEDULE EVERY 1 MINUTE
COMMENT '定时结束预售sku'
DO
BEGIN
  update buss_product_sku set expire_flag = 0 where presell_start > now() or presell_end < now() and expire_flag = 1 and del_flag = 1;
END;//

DROP TABLE IF EXISTS `buss_product_pic`;
CREATE TABLE `buss_product_pic` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(10) DEFAULT NULL COMMENT '产品id',
  `pic_url` varchar(255) DEFAULT NULL COMMENT '图片url',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='产品图片';
