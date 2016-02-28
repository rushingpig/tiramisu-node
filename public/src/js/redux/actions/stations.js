import {get, post, GET} from 'utils/request'; //Promise
import Url from 'config/url';

export const FAIL = 'FAIL';
export const GOT_STATIONS = 'GOT_STATIONS';
export const GOT_STATIONS_BY_CITY = 'GOT_STATIONS_BY_CITY';

export default function Stations(){
  function _resolve(url, signal) {
    return (dispatch) => {
      return get(url)
        .done(function(json){
          dispatch({
            type: signal,
            data: json
          })
        }).fail(function(msg){
          dispatch({
            type: FAIL,
            msg
          })
        })
    }
  };
  return {
    getStations: function (){
      return _resolve(Url.stations.toString(), GOT_STATIONS);
      // return {
      //   type: ActionTypes.GOT_STATIONS,
      //   data: [1: '沙井配送站']
      // }
    },

    getStationByCity: function(city_id){
      return _resolve(Url.station_list_info.toString(city_id), GOT_STATIONS_BY_CITY)
    }
    
  }
}

