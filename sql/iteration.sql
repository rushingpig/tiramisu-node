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
ALTER TABLE `tiramisu`.`buss_delivery_station` ADD COLUMN `is_national` tinyint(1) UNSIGNED DEFAULT 0 COMMENT '0：非全国属性    1：全国属性' AFTER `phone`;
# 2016-03-23 Zhanzhao LIANG
BEGIN;
REPLACE INTO `buss_delivery_station` VALUES
  ('1',440304,'深圳车公庙配送中心',null,null,'1',null,null,null,'1',null,null,null,null,'0755-21609316',0),
  ('2',440307,'深圳坂田配送中心','龙岗坂田','坂田配送中心坂田配送中心','1',null,null,null,'1',null,null,null,null,'0755-23917097',0),
  ('3',440303,'深圳布心配送中心','深圳罗湖',null,'1',null,null,null,'1',null,null,null,null,'0755-23823152',0),
  ('4',440306,'深圳宝华配送站',null,null,'1',null,null,null,'1',null,null,null,null,null,0),
  ('5',440307,'总部(用于五福临门)',null,null,'1',null,null,null,'1',null,null,null,null,null,0),
  ('6',440307,'深圳龙岗配送中心',null,null,'1',null,null,null,'1',null,null,null,null,null,0),
  ('7',440306,'深圳沙井配送中心',null,null,'1',null,null,null,'1',null,null,'[{\"longitude\":113.756041,\"latitude\":22.728996},{\"longitude\":113.810729,\"latitude\":22.625355},{\"longitude\":113.831934,\"latitude\":22.644414},{\"longitude\":113.836686,\"latitude\":22.646666},{\"longitude\":113.841811,\"latitude\":22.647604},{\"longitude\":113.846217,\"latitude\":22.650168},{\"longitude\":113.846751,\"latitude\":22.650264},{\"longitude\":113.849038,\"latitude\":22.650247},{\"longitude\":113.849644,\"latitude\":22.653791},{\"longitude\":113.848467,\"latitude\":22.654216},{\"longitude\":113.850493,\"latitude\":22.658939},{\"longitude\":113.883739,\"latitude\":22.65934},{\"longitude\":113.929984,\"latitude\":22.661908},{\"longitude\":113.964156,\"latitude\":22.684484},{\"longitude\":113.980541,\"latitude\":22.689352},{\"longitude\":113.975043,\"latitude\":22.697588},{\"longitude\":113.984242,\"latitude\":22.700189},{\"longitude\":113.989416,\"latitude\":22.703456},{\"longitude\":113.997896,\"latitude\":22.730859},{\"longitude\":113.998435,\"latitude\":22.739825},{\"longitude\":113.960257,\"latitude\":22.773352},{\"longitude\":113.951346,\"latitude\":22.793145},{\"longitude\":113.942794,\"latitude\":22.803273},{\"longitude\":113.916779,\"latitude\":22.819597},{\"longitude\":113.894896,\"latitude\":22.823927},{\"longitude\":113.886596,\"latitude\":22.80249},{\"longitude\":113.882661,\"latitude\":22.797751},{\"longitude\":113.869339,\"latitude\":22.796552},{\"longitude\":113.858856,\"latitude\":22.800649},{\"longitude\":113.843208,\"latitude\":22.797718},{\"longitude\":113.831709,\"latitude\":22.798251},{\"longitude\":113.823409,\"latitude\":22.795485},{\"longitude\":113.819133,\"latitude\":22.788655},{\"longitude\":113.813061,\"latitude\":22.787606},{\"longitude\":113.809737,\"latitude\":22.790438},{\"longitude\":113.80715,\"latitude\":22.788389},{\"longitude\":113.808838,\"latitude\":22.78474},{\"longitude\":113.80794,\"latitude\":22.781341},{\"longitude\":113.803341,\"latitude\":22.779609},{\"longitude\":113.799442,\"latitude\":22.776576},{\"longitude\":113.800736,\"latitude\":22.769045},{\"longitude\":113.799298,\"latitude\":22.760914},{\"longitude\":113.791034,\"latitude\":22.754649},{\"longitude\":113.772421,\"latitude\":22.746383}]',null,null,0),
  ('8',440303,'布心手信楼',null,null,'1',null,null,null,'1',null,null,null,null,null,1),
  ('9',440312,'深圳观澜配送中心',null,null,'1',null,null,null,'1',null,null,null,null,null,0),
  ('10',441302,'惠州配送中心',null,null,'1',null,null,null,'1',null,null,'[{\"longitude\":114.264042,\"latitude\":23.192161},{\"longitude\":114.274624,\"latitude\":23.165002},{\"longitude\":114.323671,\"latitude\":23.15932},{\"longitude\":114.346991,\"latitude\":23.153571},{\"longitude\":114.343793,\"latitude\":23.146327},{\"longitude\":114.343218,\"latitude\":23.142938},{\"longitude\":114.341961,\"latitude\":23.138718},{\"longitude\":114.337828,\"latitude\":23.1336},{\"longitude\":114.335672,\"latitude\":23.131572},{\"longitude\":114.33463,\"latitude\":23.128781},{\"longitude\":114.334918,\"latitude\":23.125657},{\"longitude\":114.336463,\"latitude\":23.120339},{\"longitude\":114.336355,\"latitude\":23.111963},{\"longitude\":114.33693,\"latitude\":23.108772},{\"longitude\":114.342715,\"latitude\":23.101326},{\"longitude\":114.344332,\"latitude\":23.097836},{\"longitude\":114.345446,\"latitude\":23.093714},{\"longitude\":114.345302,\"latitude\":23.083208},{\"longitude\":114.330229,\"latitude\":23.045369},{\"longitude\":114.314419,\"latitude\":23.006321},{\"longitude\":114.331612,\"latitude\":22.987658},{\"longitude\":114.417598,\"latitude\":23.021689},{\"longitude\":114.447529,\"latitude\":22.990386},{\"longitude\":114.461831,\"latitude\":22.976845},{\"longitude\":114.481665,\"latitude\":22.988956},{\"longitude\":114.480246,\"latitude\":22.993447},{\"longitude\":114.478665,\"latitude\":23.003095},{\"longitude\":114.476635,\"latitude\":23.0086},{\"longitude\":114.470113,\"latitude\":23.023069},{\"longitude\":114.469466,\"latitude\":23.02568},{\"longitude\":114.469915,\"latitude\":23.029206},{\"longitude\":114.471856,\"latitude\":23.032349},{\"longitude\":114.481647,\"latitude\":23.039649},{\"longitude\":114.485025,\"latitude\":23.045336},{\"longitude\":114.487971,\"latitude\":23.050956},{\"longitude\":114.492427,\"latitude\":23.056376},{\"longitude\":114.498032,\"latitude\":23.066185},{\"longitude\":114.501985,\"latitude\":23.070308},{\"longitude\":114.506943,\"latitude\":23.072503},{\"longitude\":114.513483,\"latitude\":23.073434},{\"longitude\":114.525628,\"latitude\":23.079584},{\"longitude\":114.529581,\"latitude\":23.083774},{\"longitude\":114.531701,\"latitude\":23.08999},{\"longitude\":114.531305,\"latitude\":23.095077},{\"longitude\":114.52764,\"latitude\":23.104351},{\"longitude\":114.529006,\"latitude\":23.109869},{\"longitude\":114.533641,\"latitude\":23.119674},{\"longitude\":114.537126,\"latitude\":23.123995},{\"longitude\":114.538348,\"latitude\":23.128},{\"longitude\":114.538312,\"latitude\":23.132669},{\"longitude\":114.535707,\"latitude\":23.141692},{\"longitude\":114.535707,\"latitude\":23.144915},{\"longitude\":114.537037,\"latitude\":23.151777},{\"longitude\":114.535941,\"latitude\":23.159835},{\"longitude\":114.512405,\"latitude\":23.165732},{\"longitude\":114.484558,\"latitude\":23.183175},{\"longitude\":114.459908,\"latitude\":23.189985},{\"longitude\":114.436983,\"latitude\":23.200448},{\"longitude\":114.422718,\"latitude\":23.199601},{\"longitude\":114.407267,\"latitude\":23.207507},{\"longitude\":114.392463,\"latitude\":23.207706},{\"longitude\":114.381899,\"latitude\":23.203654},{\"longitude\":114.365945,\"latitude\":23.201528},{\"longitude\":114.348985,\"latitude\":23.202724},{\"longitude\":114.330157,\"latitude\":23.199203},{\"longitude\":114.295806,\"latitude\":23.200797},{\"longitude\":114.280427,\"latitude\":23.200133}]',null,'0752-2305859',0),
  ('11',440305,'深圳西丽配送中心',null,null,'1',null,null,null,'1',null,null,null,null,null,0),
  ('12',440307,'工厂配送站',null,null,'1',null,null,null,'1',null,null,null,null,null,0),
  ('14',440105,'广州海珠配送中心',null,null,'1',null,null,null,'1',null,null,null,null,'02084122325',0),
  ('15',440111,'广州白云配送中心',null,null,'1',null,null,null,'1',null,null,null,null,null,0),
  ('17',440106,'广州天河配送中心',null,null,'1',null,null,null,'1',null,null,null,null,null,0),
  ('18',440113,'广州番禺配送中心',null,null,'1',null,null,null,'1',null,null,null,null,null,0),
  ('19',440306,'深圳西乡配送中心',null,null,'1',null,null,null,'1',null,null,null,null,null,0),
  ('20',440312,'深圳民治配送中心',null,null,'1',null,null,null,'1',null,null,null,null,null,0),
  ('21',440307,'深圳坪山配送中心',null,null,'1',null,null,null,'1',null,null,null,null,null,0),
  ('22',430702,'湖南常德配送中心','湖南常德市',null,'1',null,null,null,'1',null,null,null,null,null,0),
  ('23',440604,'佛山配送中心',null,null,'1',null,null,null,'1',null,null,null,null,null,0),
  ('25',500106,'重庆沙坪坝配送中心',null,null,'1',null,null,null,'1',null,null,null,null,null,0),
  ('26',500105,'重庆江北配送中心',null,null,'1',null,null,null,'1',null,null,null,null,null,0),
  ('27',500108,'重庆南岸配送中心',null,null,'1',null,null,null,'1',null,null,null,null,null,0),
  ('28',500107,'重庆九龙坡区配送中心',null,null,'1',null,null,null,'1',null,null,null,null,null,0),
  ('29',510108,'成都成华配送中心','成都市成华区五桂路阳光米娅中心负一楼588号',null,'1',null,null,null,'1',null,null,null,null,null,0),
  ('30',510107,'成都武侯配送中心','成都市武侯区武侯大道双楠段112号',null,'1',null,null,null,'1',null,null,null,null,null,0),
  ('31',441283,'肇庆高要配送中心',null,null,'1',null,null,null,'1',null,null,null,null,null,0),
  ('32',430203,'湖南株洲配送中心','株洲市芦淞区龙泉办事处古大桥村寺州上(古大挢村旁)',null,'1',null,null,null,'1',null,null,null,null,null,0),
  ('33',350128,'平潭配送中心','福建省平潭县岚城乡上楼工业区，(星海湾1号后面)',null,'1',null,null,null,'1',null,null,null,null,null,0),
  ('34',320111,'南京配送中心','南京市浦口区盘城威盾生态门业（盘城北街东）',null,'1',null,null,null,'1',null,null,null,null,null,0),
  ('35',431202,'湖南怀化配送中心','怀化湖南小商品加工工业园B2栋308房',null,'1',null,null,null,'1',null,null,null,null,null,0),
  ('36',44802,'湛江配送中心',null,null,'1',null,null,null,'1',null,null,null,null,null,0),
  ('37',445302,'云浮配送中心',null,null,'1',null,null,null,'1',null,null,null,null,null,0),
  ('38',440402,'珠海配送中心','珠海市香洲区香洲科技工业区南利大厦504-506室',null,'1',null,null,null,'1',null,null,null,null,null,0),
  ('39',440303,'深圳莲塘配送中心',null,null,'1',null,null,null,'1',null,null,null,null,null,0),
  ('40',440304,'八卦岭配送中心',null,null,'1',null,null,null,'1',null,null,null,null,null,0),
  ('41',350128,'福建平潭配送中心','平潭综合试验区上楼工业2区金坛康娱橡胶工程材料有限公司业务楼1楼',null,'1',null,null,null,'1',null,null,null,null,null,0),
  ('43',330302,'浙江温州配送中心',null,null,'1',null,null,null,'1',null,null,null,null,null,0),
  ('44',430602,'湖南岳阳配送中心','湖南省岳阳市青年东路1228号',null,'1',null,null,null,'1',null,null,null,null,null,0),
  ('45',310110,'上海杨浦配送中心','国安路758弄48号202室',null,'1',null,null,null,'1',null,null,null,null,null,0),
  ('46',350206,'厦门湖里配送中心','厦门市湖里区殿前一路536号望龙大厦B栋二楼',null,'1',null,null,null,'1',null,null,null,null,'18682338024',0),
  ('47',130108,'石家庄裕华配送中心','石家庄市裕华区仓兴路25号院',null,'1',null,null,null,'1',null,null,null,null,'13673238278',0),
  ('48',440306,'深圳大浪配送中心','宝安区大浪街道华荣路大浪联建工业区厂房第7栋第一层8号铺',null,'1',null,null,null,'1',null,null,null,null,null,0),
  ('49',430112,'长沙城西配送中心','长沙望城区金星北路208号长沙玫瑰园24、25号门面',null,'1',null,null,null,'1',null,null,null,null,null,0),
  ('50',430102,'长沙浏阳河配送中心','长沙芙蓉区浏阳河路鑫科明珠十一栋4号',null,'1',null,null,null,'1',null,null,null,null,null,0),
  ('51',310107,'上海普陀配送中心','绥德路2弄8号楼3楼（真如铁三角科技园）',null,'1',null,null,null,'1',null,null,null,null,null,0);
COMMIT;
# 29 March Zhanzhao LIANG
# TODO: fix the postcode and latlon information
BEGIN;
INSERT INTO `dict_regionalism` VALUES
   ('442025', '东区', '442000', '东区', '3', '0760', '528400', '中国,广东省,中山市,东区', '113.378835', '22.52522', 'dongqu', '1', null, null),
   ('442026', '西区', '442000', '西区', '3', '0760', '528400', '中国,广东省,中山市,西区', '113.378835', '22.52522', 'xiqu', '1', null, null),
   ('510185', '高新南区', '510100', '高新南', '3', '028', '611230', '中国,四川省,成都市,高新南区', '103.67285', '30.63014', 'gaoxingnan', '1', null, null),
   ('510186', '天府新区', '510100', '天府新', '3', '028', '611230', '中国,四川省,成都市,天府新区', '103.67285', '30.63014', 'tianfuxin', '1', null, null);
COMMIT;

# 2016-03-29 Zhao Wei
ALTER TABLE `tiramisu`.`buss_order_src` ADD `remark` varchar(255) DEFAULT NULL COMMENT '备注';
/*2016-03-25 (pigo)*/
ALTER TABLE `tiramisu`.`sys_user` CHANGE COLUMN `city_id` `city_ids` varchar(255) DEFAULT 'NONE' COMMENT '所属城市集合';
ALTER TABLE `tiramisu`.`sys_user` CHANGE COLUMN `updated_by` `updated_by` varchar(64) COMMENT '更新者';
ALTER TABLE `tiramisu`.`sys_user` DROP INDEX `sys_user_login_name`, ADD UNIQUE `sys_user_login_name` USING BTREE (`username`) comment '';
ALTER TABLE `tiramisu`.`sys_organization` CHANGE COLUMN `del_flag` `del_flag` tinyint(1) NOT NULL DEFAULT 1 COMMENT '删除标记';
ALTER TABLE `tiramisu`.`sys_role` CHANGE COLUMN `office_id` `org_id` int(11) DEFAULT NULL COMMENT '归属机构';
ALTER TABLE `tiramisu`.`sys_organization` CHANGE COLUMN `is_usable` `is_usable` tinyint(1) DEFAULT 1 COMMENT '是否启用', ADD COLUMN `description` varchar(255) NOT NULL DEFAULT '' COMMENT '机构部门描述' AFTER `del_flag`;
ALTER TABLE `tiramisu`.`sys_role` ADD COLUMN `description` varchar(255) NOT NULL DEFAULT '' COMMENT '角色描述' AFTER `del_flag`;
ALTER TABLE `tiramisu`.`sys_menu` ADD COLUMN `module_id` int(11) NOT NULL DEFAULT 0 COMMENT '所属模块名称' AFTER `del_flag`;
ALTER TABLE `tiramisu`.`sys_menu` ADD COLUMN `description` varchar(100) NOT NULL DEFAULT '' COMMENT '权限动作描述' AFTER `module_name`;
ALTER TABLE `tiramisu`.`sys_menu` ADD COLUMN `type` enum('LIST','ELEMENT') NOT NULL DEFAULT 'LIST' AFTER `description`;
ALTER TABLE `tiramisu`.`sys_user` CHANGE COLUMN `station_id` `station_ids` varchar(50) DEFAULT NULL COMMENT '配送站ID集合';
ALTER TABLE `tiramisu`.`sys_user` CHANGE COLUMN `city_ids` `city_ids` varchar(5000) DEFAULT 'NONE' COMMENT '所属城市集合', CHANGE COLUMN `station_ids` `station_ids` varchar(50000) DEFAULT NULL COMMENT '配送站ID集合';
# 2016-04-22 Zhanzhao LIANG
BEGIN;
REPLACE INTO `buss_shop` VALUES
  ('1',440306,'宝安区翻身路开屏市场225号 ','翻身店','8:00-22:00','0755-29971900','113.890944','22.57643','1','2016-04-22 15:36:19', 1),
  ('2',440304,'福田区车公庙丰盛町地下阳光街A区（近地铁B出口）','丰盛町店','8:00-22:00','0755-23823152','114.030882','22.54162','1','2016-04-22 15:36:19', 1),
  ('3',440304,'福田区车公庙深南大道阳光街B区（近地铁C出口）','车公庙店','8:00-22:00','0755-23947151','114.030794','22.541569','1','2016-04-22 15:36:19', 1),
  ('4',440304,'福田区岗厦村东4坊6-3号铺（近岗厦站地铁站A出口）','岗厦店','8:00-22:00','0755-88294047','114.075581','22.54227','1','2016-04-22 15:36:19', 1),
  ('5',440304,'福田区华发北路107栋A01号商铺','华发店','8:00-22:00','0755-83249104','114.096342','22.549021','1','2016-04-22 15:36:19', 1),
  ('6',440304,'福田区民田路购物公园北园地下室B06-03号商铺','购物公园店	','8:00-22:00','0755-83165485','114.060986','22.540601','1','2016-04-22 15:36:19', 1),
  ('7',440304,'福田区田面新村31栋101号','田面店','8:00-22:00','0755-82810117','114.082595','22.549681','1','2016-04-22 15:36:19', 1),
  ('8',440304,'福田区下沙3坊72号1号地铺','下沙店','8:00-22:00','0755-23917097','114.03345','22.532373','1','2016-04-22 15:36:19', 1),
  ('9',440304,'福田区振中路北鼎诚大厦112号铺','华强店','8:00-22:00','0755-82722634','114.090615','22.549347','1','2016-04-22 15:36:19', 1),
  #('10',440304,'高车路西郊花园门面','高车店','9:00-23:00','0736-7175117','111.664001','29.050837','1','2016-04-22 15:36:19', 1),
  ('11',440307,'龙岗区布吉街道办吉华路牡丹苑1层9号铺','布吉吉华店','8:00-22:00','0755-28540597','114.118375','22.616529','1','2016-04-22 15:36:19', 1),
  ('12',440307,'龙岗区布吉街道华浩源3号楼商铺101-24','慢城店','8:00-22:00','0755-89536513','114.126203','22.623401','1','2016-04-22 15:36:19', 1),
  ('13',440307,'龙岗区布吉上水花园2区44栋2号商铺','丽湖一店','8:00-22:00','0755-28305269','114.114076','22.63265','1','2016-04-22 15:36:19', 1),
  ('14',440307,'龙岗区龙岗区布吉街道办长盛路10号(万家百货)1层','布吉长盛店','8:00-22:00','0755-28594529','114.124324','22.614127','1','2016-04-22 15:36:19', 1),
  ('15',440307,'龙岗区上水花园154栋-1-101','丽湖二店','8:00-22:00','0755-28345631','114.115024','22.634026','1','2016-04-22 15:36:19', 1),
  ('16',440307,'龙岗区深惠路布吉大芬油画村60号商铺（即沃尔玛超市边）','大芬店','8:00-22:00','0755-89511256','114.143657','22.617221','1','2016-04-22 15:36:19', 1),
  ('17',440303,'罗湖区大望村篮球场平平百货旁','大望店','8:00-22:00','0755-25714405','114.174648','22.608847','1','2016-04-22 15:36:19', 1),
  ('18',440303,'罗湖区大望新平村59号103铺','新平店','8:00-22:00','0755-25668754','114.176557','22.600314','1','2016-04-22 15:36:19', 1),
  ('19',440303,'罗湖区东湖路鹏城花园25-2号商铺','布心中学店','8:00-22:00','0755-82178679','114.148053','22.587384','1','2016-04-22 15:36:19', 1),
  ('20',440303,'罗湖区东乐花园乐1楼裙楼','东乐店','8:00-22:00','0755-25274256','114.147133','22.579359','1','2016-04-22 15:36:19', 1),
  ('21',440303,'罗湖区东晓路3085号海鹰大厦4栋204号铺','东湖店','8:00-22:00','0755-25016485','114.144408','22.587409','1','2016-04-22 15:36:19', 1),
  ('22',440303,'罗湖区金稻田路边防布心住宅区A座3号4号商铺','布心店','8:00-22:00','0755-82237083','114.139657','22.590204','1','2016-04-22 15:36:19', 1),
  ('23',440303,'罗湖区人民南路佳宁娜广场G1号铺','佳宁娜店','8:00-22:00','0755-61665150','114.125969','22.543222','1','2016-04-22 15:36:19', 1),
  ('24',440303,'罗湖区太白路松泉山庄碧涟阁首层02号铺','松泉店','8:00-22:00','0755-82621550','114.135491','22.583163','1','2016-04-22 15:36:19', 1),
  ('25',440303,'罗湖区向西路文星花园文星阁一层第105号铺位','向西店','8:00-22:00','0755-82722634','114.134044','22.546802','1','2016-04-22 15:36:19', 1),
  ('26',440305,'南山区滨海苑11号利安楼公园路52号','公园南店','8:00-22:00','0755-21609316','113.931778','22.495756','1','2016-04-22 15:36:19', 1),
  ('27',440305,'南山区前海路星海名城二期七组团1-3栋9号铺B部分','星海名城店','8:00-22:00','0755-86179270','113.920917','22.543547','1','2016-04-22 15:36:19', 1),
  ('28',440305,'南山区前海路与学府路交汇处新德家园裙楼1层C1-2/3','前海店','8:00-22:00','0755-25486860','113.920168','22.534509','1','2016-04-22 15:36:19', 1),
  ('29',440305,'武陵大道锦都豪苑门面（永利KTV斜对面）','锦都店','9:00-23:00','0736-7191117','111.698363','29.039872','1','2016-04-22 15:36:19', 1),
  ('30',440305,'武陵大道与西园路交汇处(宏大宾馆斜对面往火车站方向走2OO米男科医院1楼门面)','宏大店','9:00-23:00','0736-7151117','111.698903','29.050039','1','2016-04-22 15:36:19', 1);
COMMIT;

ALTER TABLE `tiramisu`.`buss_order_error` DROP COLUMN `created_by`, DROP COLUMN `created_time`, DROP COLUMN `updated_by`, DROP COLUMN `updated_time`, ADD COLUMN `created_by` int UNSIGNED NOT NULL DEFAULT 1 AFTER `status`, ADD COLUMN `created_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `created_by`, ADD COLUMN `updated_by` int UNSIGNED NOT NULL DEFAULT 0 AFTER `created_time`, ADD COLUMN `updated_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `updated_by`;
ALTER TABLE `tiramisu`.`buss_order_error` ADD INDEX `IDX_MERCHANT_ID` (`merchant_id`) comment '', ADD INDEX `IDX_CREATED_TIME` (`created_time`) comment '', ADD INDEX `IDX_TYPE` (`type`) comment '';

# 2016-04-25 Kaiming Zeng
BEGIN;
INSERT INTO `dict_regionalism` VALUES
   ('520124', '小河区', '520100', '小河', '3', '0851', '551400', '中国,贵州省,贵阳市,小河区', '106.70098', '26.496945', 'XiaoHe', '1', null, null);
COMMIT;