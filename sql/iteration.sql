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
# 2016-03-23 Zhanzhao LIANG
BEGIN;
REPLACE INTO `buss_delivery_station` VALUES
  ('1',440304,'深圳车公庙配送中心',null,null,'1',null,null,null,'1',null,null,'','','0755-21609316'),
  ('2',440307,'深圳坂田配送中心','龙岗坂田','坂田配送中心坂田配送中心','1',null,null,null,'1',null,null,'','','0755-23917097'),
  ('3',440303,'深圳布心配送中心','深圳罗湖',null,'1',null,null,null,'1',null,null,'','','0755-23823152'),
  ('4',440306,'深圳宝华配送站',null,null,'1',null,null,null,'1',null,null,'','',null),
  ('5',440307,'总部(用于五福临门)',null,null,'1',null,null,null,'1',null,null,'','',null),
  ('6',440307,'深圳龙岗配送中心',null,null,'1',null,null,null,'1',null,null,'','',null),
  ('7',440306,'深圳沙井配送中心',null,null,'1',null,null,null,'1',null,null,'[{\"longitude\":113.756041,\"latitude\":22.728996},{\"longitude\":113.810729,\"latitude\":22.625355},{\"longitude\":113.831934,\"latitude\":22.644414},{\"longitude\":113.836686,\"latitude\":22.646666},{\"longitude\":113.841811,\"latitude\":22.647604},{\"longitude\":113.846217,\"latitude\":22.650168},{\"longitude\":113.846751,\"latitude\":22.650264},{\"longitude\":113.849038,\"latitude\":22.650247},{\"longitude\":113.849644,\"latitude\":22.653791},{\"longitude\":113.848467,\"latitude\":22.654216},{\"longitude\":113.850493,\"latitude\":22.658939},{\"longitude\":113.883739,\"latitude\":22.65934},{\"longitude\":113.929984,\"latitude\":22.661908},{\"longitude\":113.964156,\"latitude\":22.684484},{\"longitude\":113.980541,\"latitude\":22.689352},{\"longitude\":113.975043,\"latitude\":22.697588},{\"longitude\":113.984242,\"latitude\":22.700189},{\"longitude\":113.989416,\"latitude\":22.703456},{\"longitude\":113.997896,\"latitude\":22.730859},{\"longitude\":113.998435,\"latitude\":22.739825},{\"longitude\":113.960257,\"latitude\":22.773352},{\"longitude\":113.951346,\"latitude\":22.793145},{\"longitude\":113.942794,\"latitude\":22.803273},{\"longitude\":113.916779,\"latitude\":22.819597},{\"longitude\":113.894896,\"latitude\":22.823927},{\"longitude\":113.886596,\"latitude\":22.80249},{\"longitude\":113.882661,\"latitude\":22.797751},{\"longitude\":113.869339,\"latitude\":22.796552},{\"longitude\":113.858856,\"latitude\":22.800649},{\"longitude\":113.843208,\"latitude\":22.797718},{\"longitude\":113.831709,\"latitude\":22.798251},{\"longitude\":113.823409,\"latitude\":22.795485},{\"longitude\":113.819133,\"latitude\":22.788655},{\"longitude\":113.813061,\"latitude\":22.787606},{\"longitude\":113.809737,\"latitude\":22.790438},{\"longitude\":113.80715,\"latitude\":22.788389},{\"longitude\":113.808838,\"latitude\":22.78474},{\"longitude\":113.80794,\"latitude\":22.781341},{\"longitude\":113.803341,\"latitude\":22.779609},{\"longitude\":113.799442,\"latitude\":22.776576},{\"longitude\":113.800736,\"latitude\":22.769045},{\"longitude\":113.799298,\"latitude\":22.760914},{\"longitude\":113.791034,\"latitude\":22.754649},{\"longitude\":113.772421,\"latitude\":22.746383}]','',null),
  ('8',440303,'布心手信楼',null,null,'1',null,null,null,'1',null,null,'','',null),
  ('9',440312,'深圳观澜配送中心',null,null,'1',null,null,null,'1',null,null,'','',null),
  ('10',441302,'惠州配送中心',null,null,'1',null,null,null,'1',null,null,'[{\"longitude\":114.264042,\"latitude\":23.192161},{\"longitude\":114.274624,\"latitude\":23.165002},{\"longitude\":114.323671,\"latitude\":23.15932},{\"longitude\":114.346991,\"latitude\":23.153571},{\"longitude\":114.343793,\"latitude\":23.146327},{\"longitude\":114.343218,\"latitude\":23.142938},{\"longitude\":114.341961,\"latitude\":23.138718},{\"longitude\":114.337828,\"latitude\":23.1336},{\"longitude\":114.335672,\"latitude\":23.131572},{\"longitude\":114.33463,\"latitude\":23.128781},{\"longitude\":114.334918,\"latitude\":23.125657},{\"longitude\":114.336463,\"latitude\":23.120339},{\"longitude\":114.336355,\"latitude\":23.111963},{\"longitude\":114.33693,\"latitude\":23.108772},{\"longitude\":114.342715,\"latitude\":23.101326},{\"longitude\":114.344332,\"latitude\":23.097836},{\"longitude\":114.345446,\"latitude\":23.093714},{\"longitude\":114.345302,\"latitude\":23.083208},{\"longitude\":114.330229,\"latitude\":23.045369},{\"longitude\":114.314419,\"latitude\":23.006321},{\"longitude\":114.331612,\"latitude\":22.987658},{\"longitude\":114.417598,\"latitude\":23.021689},{\"longitude\":114.447529,\"latitude\":22.990386},{\"longitude\":114.461831,\"latitude\":22.976845},{\"longitude\":114.481665,\"latitude\":22.988956},{\"longitude\":114.480246,\"latitude\":22.993447},{\"longitude\":114.478665,\"latitude\":23.003095},{\"longitude\":114.476635,\"latitude\":23.0086},{\"longitude\":114.470113,\"latitude\":23.023069},{\"longitude\":114.469466,\"latitude\":23.02568},{\"longitude\":114.469915,\"latitude\":23.029206},{\"longitude\":114.471856,\"latitude\":23.032349},{\"longitude\":114.481647,\"latitude\":23.039649},{\"longitude\":114.485025,\"latitude\":23.045336},{\"longitude\":114.487971,\"latitude\":23.050956},{\"longitude\":114.492427,\"latitude\":23.056376},{\"longitude\":114.498032,\"latitude\":23.066185},{\"longitude\":114.501985,\"latitude\":23.070308},{\"longitude\":114.506943,\"latitude\":23.072503},{\"longitude\":114.513483,\"latitude\":23.073434},{\"longitude\":114.525628,\"latitude\":23.079584},{\"longitude\":114.529581,\"latitude\":23.083774},{\"longitude\":114.531701,\"latitude\":23.08999},{\"longitude\":114.531305,\"latitude\":23.095077},{\"longitude\":114.52764,\"latitude\":23.104351},{\"longitude\":114.529006,\"latitude\":23.109869},{\"longitude\":114.533641,\"latitude\":23.119674},{\"longitude\":114.537126,\"latitude\":23.123995},{\"longitude\":114.538348,\"latitude\":23.128},{\"longitude\":114.538312,\"latitude\":23.132669},{\"longitude\":114.535707,\"latitude\":23.141692},{\"longitude\":114.535707,\"latitude\":23.144915},{\"longitude\":114.537037,\"latitude\":23.151777},{\"longitude\":114.535941,\"latitude\":23.159835},{\"longitude\":114.512405,\"latitude\":23.165732},{\"longitude\":114.484558,\"latitude\":23.183175},{\"longitude\":114.459908,\"latitude\":23.189985},{\"longitude\":114.436983,\"latitude\":23.200448},{\"longitude\":114.422718,\"latitude\":23.199601},{\"longitude\":114.407267,\"latitude\":23.207507},{\"longitude\":114.392463,\"latitude\":23.207706},{\"longitude\":114.381899,\"latitude\":23.203654},{\"longitude\":114.365945,\"latitude\":23.201528},{\"longitude\":114.348985,\"latitude\":23.202724},{\"longitude\":114.330157,\"latitude\":23.199203},{\"longitude\":114.295806,\"latitude\":23.200797},{\"longitude\":114.280427,\"latitude\":23.200133}]','','0752-2305859'),
  ('11',440305,'深圳西丽配送中心',null,null,'1',null,null,null,'1',null,null,'','',null),
  ('12',440307,'工厂配送站',null,null,'1',null,null,null,'1',null,null,'','',null),
  ('14',440105,'广州海珠配送中心',null,null,'1',null,null,null,'1',null,null,'','','02084122325'),
  ('15',440111,'广州白云配送中心',null,null,'1',null,null,null,'1',null,null,'','',null),
  ('17',440106,'广州天河配送中心',null,null,'1',null,null,null,'1',null,null,'','',null),
  ('18',440113,'广州番禺配送中心',null,null,'1',null,null,null,'1',null,null,'','',null),
  ('19',440306,'深圳西乡配送中心',null,null,'1',null,null,null,'1',null,null,'','',null),
  ('20',440312,'深圳民治配送中心',null,null,'1',null,null,null,'1',null,null,'','',null),
  ('21',440307,'深圳坪山配送中心',null,null,'1',null,null,null,'1',null,null,'','',null),
  ('22',430702,'湖南常德配送中心','湖南常德市',null,'1',null,null,null,'1',null,null,'','',null),
  ('23',440604,'佛山配送中心',null,null,'1',null,null,null,'1',null,null,'','',null),
  ('24',440303,'鲜花网专用',null,null,'1',null,null,null,'1',null,null,'','',null),
  ('25',500106,'重庆沙坪坝配送中心',null,null,'1',null,null,null,'1',null,null,'','',null),
  ('26',500105,'重庆江北配送中心',null,null,'1',null,null,null,'1',null,null,'','',null),
  ('27',500108,'重庆南岸配送中心',null,null,'1',null,null,null,'1',null,null,'','',null),
  ('28',500107,'重庆九龙坡区配送中心',null,null,'1',null,null,null,'1',null,null,'','',null),
  ('29',510108,'成都成华配送中心','成都市成华区五桂路阳光米娅中心负一楼588号',null,'1',null,null,null,'1',null,null,'','',null),
  ('30',510107,'成都武侯配送中心','成都市武侯区武侯大道双楠段112号',null,'1',null,null,null,'1',null,null,'','',null),
  ('31',441283,'肇庆高要配送中心',null,null,'1',null,null,null,'1',null,null,'','',null),
  ('32',430203,'湖南株洲配送中心','株洲市芦淞区龙泉办事处古大桥村寺州上(古大挢村旁)',null,'1',null,null,null,'1',null,null,'','',null),
  ('33',350128,'平潭配送中心','福建省平潭县岚城乡上楼工业区，(星海湾1号后面)',null,'1',null,null,null,'1',null,null,'','',null),
  ('34',320111,'南京配送中心','南京市浦口区盘城威盾生态门业（盘城北街东）',null,'1',null,null,null,'1',null,null,'','',null),
  ('35',431202,'湖南怀化配送中心','怀化湖南小商品加工工业园B2栋308房',null,'1',null,null,null,'1',null,null,'','',null),
  ('36',440802,'湛江配送中心',null,null,'1',null,null,null,'1',null,null,'','',null),
  ('37',445302,'云浮配送中心',null,null,'1',null,null,null,'1',null,null,'','',null),
  ('38',440402,'珠海配送中心','珠海市香洲区香洲科技工业区南利大厦504-506室',null,'1',null,null,null,'1',null,null,'','',null),
  ('39',440303,'深圳莲塘配送中心',null,null,'1',null,null,null,'1',null,null,'','',null),
  ('40',440304,'八卦岭配送中心',null,null,'1',null,null,null,'1',null,null,'','',null),
  ('41',350128,'福建平潭配送中心','平潭综合试验区上楼工业2区金坛康娱橡胶工程材料有限公司业务楼1楼',null,'1',null,null,null,'1',null,null,'','',null),
  ('43',330302,'浙江温州配送中心',null,null,'1',null,null,null,'1',null,null,'','',null),
  ('44',430602,'湖南岳阳配送中心','湖南省岳阳市青年东路1228号',null,'1',null,null,null,'1',null,null,'','',null),
  ('45',310110,'上海杨浦配送中心','国安路758弄48号202室',null,'1',null,null,null,'1',null,null,'','',null),
  ('46',350206,'厦门湖里配送中心','厦门市湖里区殿前一路536号望龙大厦B栋二楼',null,'1',null,null,null,'1',null,null,'','','18682338024'),
  ('47',130108,'石家庄裕华配送中心','石家庄市裕华区仓兴路25号院',null,'1',null,null,null,'1',null,null,'','','13673238278'),
  ('48',440306,'深圳大浪配送中心','宝安区大浪街道华荣路大浪联建工业区厂房第7栋第一层8号铺',null,'1',null,null,null,'1',null,null,'','',null),
  ('49',430112,'长沙城西配送中心','长沙望城区金星北路208号长沙玫瑰园24、25号门面',null,'1',null,null,null,'1',null,null,'','',null),
  ('50',430102,'长沙浏阳河配送中心','长沙芙蓉区浏阳河路鑫科明珠十一栋4号',null,'1',null,null,null,'1',null,null,'','',null),
  ('51',310107,'上海普陀配送中心','绥德路2弄8号楼3楼（真如铁三角科技园）',null,'1',null,null,null,'1',null,null,'','',null);
COMMIT;
