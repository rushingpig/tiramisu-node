import initManageAddForm from './manage_order_form';
import { 
  DELIVERY_TO_HOME,
  INVOICE,
} from 'config/app.config';

export default initManageAddForm( state => ({
    //赋初始值
    initialValues: {
      delivery_type: DELIVERY_TO_HOME,  //这里有bug，还是把默认值写到组件里面
      // invoice: INVOICE.NO,
    }
  })
)