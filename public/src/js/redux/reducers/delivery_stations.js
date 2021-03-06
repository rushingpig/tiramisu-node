import * as FormActions from 'actions/order_manage_form';
import { RESET_DELIVERY_STATIONS, CLEAR_DELIVERY_STATIONS } from 'actions/order_manage';
import { REQUEST } from 'config/app.config';
import { map } from 'utils/index';

var initial_state = {
  delivery_stations: [],
  delivery_stations_backup: [],
}

function delivery_stations(state = initial_state, action){
  switch(action.type){
    case CLEAR_DELIVERY_STATIONS:
      return {...state, delivery_stations: []}
    case RESET_DELIVERY_STATIONS:
      return {...state, delivery_stations: state.delivery_stations_backup}
    case FormActions.GOT_DELIVERY_STATIONS:
      let __delivery_stations = map(action.data, (text, id) => ({id, text}));
      return {...state, delivery_stations: __delivery_stations, delivery_stations_backup: __delivery_stations }
    case FormActions.AUTO_GOT_DELIVERY_STATIONS:
      return (function(){
        var d = action.data;
        if(action.key == REQUEST.SUCCESS){
          let unionMap = {};
          let new_delivery_stations = [];
          [{id: d.delivery_id, text: d.delivery_name}].concat(state.delivery_stations_backup).forEach(obj => {
            if( !unionMap[obj.id] ){
              unionMap[obj.id] = 1;
              new_delivery_stations.push(obj);
            }
          });
          return {...state, delivery_stations: new_delivery_stations }
        }else if(action.key == REQUEST.FAIL){
          return {...state, delivery_stations: state.delivery_stations_backup }
        }else{
          return state;
        }
      })();
    default:
      return state;
  }
}

export default delivery_stations;