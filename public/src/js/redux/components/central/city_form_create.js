import initAddCityForm from './city_form';
import { getDate } from 'utils/index';

const iNow = new Date();
const hour = iNow.getHours();
const min = iNow.getMinutes();

export default initAddCityForm(state =>({
    initialValues:{'is_diversion': 0, 'online_time_date': getDate(), 'online_time_hour': hour, 'online_time_min' : min,
    'delivery_time_range':'09:30 ~ 23:30', 'is_county': 0, 'sec_order': 0, 'first_open_regions': [], 'sec_open_regions': []}
}))
