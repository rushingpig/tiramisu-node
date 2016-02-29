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
};
var load_map = {};

export default function LazyLoad(name, callback){
  $(function(){
    var plugin = config[name];
    if(plugin){
      if(!load_map[name]){
        setTimeout(function(){
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
            sc.onload = callback;
            document.body.appendChild(sc);
          }
          load_map[name] = 1; //已加载过
        }, 0);
      }
    }else{
      console.error('lazy load "' + name + '" fail');
    }
  })
}

window.LazyLoad = LazyLoad;