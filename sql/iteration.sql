# 首页展示数据
DROP TABLE IF EXISTS `buss_homepage`;
CREATE TABLE `buss_homepage` (
    `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'id',
    `regionalism_id` int(11) NOT NULL COMMENT '行政区域id',
    `src` varchar(255) NOT NULL COMMENT '图片url',
    `url` varchar(255) NOT NULL COMMENT '链接url',
    `created_by` int(11) NOT NULL COMMENT '创建人id',
    `created_time` datetime NOT NULL COMMENT '创建时间',
    `updated_by` int(11) DEFAULT NULL COMMENT '记录更新操作者id',
    `updated_time` datetime DEFAULT NULL COMMENT '记录更新时间',
    `del_flag` tinyint(1) NOT NULL DEFAULT '1' COMMENT '隐藏',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='首页展示数据';