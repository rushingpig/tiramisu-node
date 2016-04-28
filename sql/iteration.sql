# 2016-04-27 Zhanzhao Liang
INSERT INTO `dict_regionalism` VALUES
   ('442027', '中山市', '442000', '中山', '3', '0760', '528400', '中国,广东省,中山市,中山市', '113.378835', '22.52522', 'Zhongshan', '1', null, null);
INSERT INTO `buss_product_category` VALUES (15, 0, '配件', 0, 1, now(), null, null, 1);

# 2016-04-28 Kaiming Zeng
INSERT INTO `buss_order_src` (`id`,`parent_id`,`parent_ids`,`level`,`name`,`sort`,`created_by`,`created_time`,`updated_by`,`updated_time`,`del_flag`,`merge_name`,`remark`) 
VALUES (57,0,'0,57',1,'东方福利网',0,1,'2016-04-28 11:26:31',NULL,NULL,1,'东方福利网',NULL);
INSERT INTO `buss_order_src` (`id`,`parent_id`,`parent_ids`,`level`,`name`,`sort`,`created_by`,`created_time`,`updated_by`,`updated_time`,`del_flag`,`merge_name`,`remark`) 
VALUES (58,48,'48,58',2,'淘宝',0,1,'2016-04-28 11:26:55',NULL,NULL,1,'电商平台,淘宝',NULL);