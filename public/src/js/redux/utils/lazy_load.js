var root = window.xfxb.root;
var config = {
  noty: {
    css: '/plugins/animate/animate.min.css',
    js: root + 'lib/jquery.noty.packaged.min.js',
  },
  chinese_py: {
    js: root + 'lib/chinese_py.min.js'
  },
  autocomplete: {
    css: '/plugins/jquery-ui/jquery-ui.css',
    js: '/plugins/jquery-ui/autocomplete.js',
  },
  GeoUtils: {
    js: root + 'lib/GeoUtils.min.js',
  datetimerangepicker: {
    css: '/node_modules/react-bootstrap-datetimerange-picker/dist/react-bootstrap-datetime-range-picker.css'
  }
};
var load_map = {};

export default function LazyLoad(name, callback){
  $(function(){
    var plugin = config[name];
    if(plugin){
      if(!load_map[name]){
        if( load_map[name] != 0 ){
          if(plugin.css){
            var link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = plugin.css;
            document.head.appendChild(link);
          }
          if(plugin.js){
            var sc = document.createElement("script");
            sc.type = "text\/javascript";
            sc.src = plugin.js;
            sc.onload = (function(cb){
              return function(){
                load_map[name] = 1; //加载成功
                cb && cb();
              }
            })(callback);
            document.body.appendChild(sc);
          }
        }
        load_map[name] = 0; //还在加载中
      }else if(callback){
        callback();
      }
    }else{
      console.error('lazy load "' + name + '" fail');
    }
  })
}

window.LazyLoad = LazyLoad;