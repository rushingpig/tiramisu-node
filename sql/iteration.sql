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