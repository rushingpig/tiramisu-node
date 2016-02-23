import initManageAddForm from './manage_order_form';
import { 
  DELIVERY_TO_HOME,
  INVOICE,
} from 'config/app.config';

export default initManageAddForm( state => ({
    //赋初始值
    initialValues: state.orderManageForm.mainForm.data
  })
)
