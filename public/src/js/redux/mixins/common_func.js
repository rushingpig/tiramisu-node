import { core } from 'utils/index';

export function searchOnEnterKeyDown(search_handler, e){
  if(!core.isFunc(search_handler)){
    throw new TypeError();
  }else{
    if(e && e.which == 13 && e.target && e.target.value){
      search_handler.call(this);
    }
  }
}