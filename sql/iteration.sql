ALTER TABLE `tiramisu`.`buss_order_fulltext` ADD COLUMN `merchant_id` varchar(50) COMMENT '外部订单ID' AFTER `order_id`;
ALTER TABLE `tiramisu`.`buss_order_fulltext` DROP INDEX `IDX_FL`, ADD FULLTEXT `IDX_FL` (`owner_name`, `owner_mobile`, `recipient_name`, `recipient_mobile`, `recipient_address`, `landmark`, `show_order_id`, `merchant_id`) comment '';
/*2016-03-17  (pigo)*/
ALTER TABLE `tiramisu`.`buss_order` ADD COLUMN `last_opt_cs` int UNSIGNED COMMENT '最后操作客服人员' AFTER `office_id`;