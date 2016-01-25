import { GET, TEST } from 'utils/request'; //Promise
import Url from 'config/url';

export const GET_ALL_DELIVERYMAN = 'GET_ALL_DELIVERYMAN';
export function getAllDeliveryman(){
  return GET(Url.deliveryman.toString(), null, GET_ALL_DELIVERYMAN);
  // return TEST([
  //   { deliveryman_id: '1', deliveryman_name: '张三三', deliveryman_mobile: '17744445555' },
  //   { deliveryman_id: '2', deliveryman_name: '李四四', deliveryman_mobile: '13544445555' },
  //   { deliveryman_id: '3', deliveryman_name: '王五五', deliveryman_mobile: '13344445555' },
  //   { deliveryman_id: '4', deliveryman_name: '韩梅梅', deliveryman_mobile: '13644445555' },
  //   { deliveryman_id: '5', deliveryman_name: '刘小明', deliveryman_mobile: '18944445555' }
  // ], GET_ALL_DELIVERYMAN);
}