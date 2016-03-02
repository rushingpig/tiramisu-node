
export function getGlobalStore(){
  return window.STORE;
}

export function getGlobalState(){
  var s = getGlobalStore();
  return s && s.getState();
}