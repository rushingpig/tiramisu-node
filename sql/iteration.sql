ALTER TABLE `tiramisu`.`buss_order_fulltext` ADD COLUMN `merchant_id` varchar(50) COMMENT '外部订单ID' AFTER `order_id`;
ALTER TABLE `tiramisu`.`buss_order_fulltext` DROP INDEX `IDX_FL`, ADD FULLTEXT `IDX_FL` (`owner_name`, `owner_mobile`, `recipient_name`, `recipient_mobile`, `recipient_address`, `landmark`, `show_order_id`, `merchant_id`) comment '';
/*2016-03-17  (pigo)*/
ALTER TABLE `tiramisu`.`buss_order` ADD COLUMN `last_opt_cs` int UNSIGNED COMMENT '最后操作客服人员' AFTER `office_id`;
/*2016-03-20  (pigo)**/
ALTER TABLE `tiramisu`.`buss_order` ADD INDEX `IDX_DELIVERY_TIME` (`delivery_time`) comment '配送时间Btree索引';
ALTER TABLE `tiramisu`.`buss_order_sku` ADD INDEX `IDX_ORDER_ID` (`order_id`) comment '订单号BTree索引';
ALTER TABLE `tiramisu`.`buss_order` CHANGE COLUMN `delivery_time` `delivery_time` varchar(25) CHARACTER SET utf8 DEFAULT NULL;

/*2016-03-22 (pigo)*/
ALTER TABLE `tiramisu`.`sys_user` CHANGE COLUMN `login_flag` `is_usable` tinyint(1) UNSIGNED DEFAULT NULL COMMENT '是否可登录';

/*2016-03-23 (pigo)*/
ALTER TABLE `tiramisu`.`buss_order` CHANGE COLUMN `owner_mobile` `owner_mobile` varchar(20) CHARACTER SET utf8 DEFAULT NULL COMMENT '下单人手机';
ALTER TABLE `tiramisu`.`buss_recipient` CHANGE COLUMN `mobile` `mobile` varchar(20) CHARACTER SET utf8 DEFAULT NULL COMMENT '收货人手机号';